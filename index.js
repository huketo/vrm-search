import http from "http";
import express from "express";
import puppeteer from "puppeteer";
import path from "path";
import { convertVrmToGlb } from "./converter/converter.js";

// parse command line arguments
const args = process.argv.slice(2);

let inputPath;
let outputPath;
let modelName;
// -i option
args.forEach((arg, i) => {
	if (arg === "-i") {
		inputPath = args[i + 1];
	}
});

// invalid arguments
if (!inputPath) {
	console.error("Usage: node script.js -i <path_to_vrm_file>");
	process.exit(1);
}
// invalid file extension, Input file must be '.vrm' or '.gltf' or '.glb'
if (!inputPath.endsWith(".vrm") && !inputPath.endsWith(".gltf") && !inputPath.endsWith(".glb")) {
  console.error("Input file must be '.vrm' or '.gltf' or '.glb'");
  process.exit(1);
}


// extract model name from inputPath
if (inputPath.endsWith(".vrm")) {
  outputPath = inputPath.replace(/\.vrm$/, ".glb");
  modelName = path.basename(inputPath, ".vrm");
  // convert `vrm` to `glb` and set src attribute to model path
  console.log("Converting VRM to GLB...");
  console.log(`Input: ${inputPath}`);
  console.log(`Output: ${outputPath}`);
  await convertVrmToGlb(inputPath, outputPath);
}
if (inputPath.endsWith(".gltf")) {
  modelName = path.basename(inputPath, ".gltf");
}
if (inputPath.endsWith(".glb")) {
  modelName = path.basename(inputPath, ".glb");
}

const app = express();
const server = http.createServer(app);

// TODO: get .env variables
const hostname = "localhost";
const port = 5500;

app.set("view engine", "ejs");
app.set("views", "./views");

const orbitViews = {
	front: "180.0deg 90.00deg 4m",
	back: "0.0deg 90.00deg 4m",
	right: "90.0deg 90.00deg 4m",
	left: "-90.0deg 90.00deg 4m",
	top: "0.0deg 0.00deg 4m",
	bottom: "0.0deg 180.00deg 4m",
};

// add routes for each view
for (const [view, orbit] of Object.entries(orbitViews)) {
	app.get(`/${view}`, (req, res) => {
		res.render("index", {
			modelSrc: `${modelName}.glb`,
			cameraOrbit: orbit,
		});
	});
}

// serve static files
const inputDir = path.dirname(inputPath);
app.use(express.static(inputDir));

server.listen(port, hostname, async () => {
	console.log(`Server running at http://${hostname}:${port}/`);

	const browser = await puppeteer.launch({
		headless: "new",
		args: ["--no-sandbox"],
	});

	// take screenshots for each view in parallel
	const screenshotPromises = Object.entries(orbitViews).map(
		([view, orbit]) => {
			return takeScreenshot(browser, view, orbit, modelName);
		}
	);

	// wait for all screenshots to be taken
	await Promise.all(screenshotPromises);

	// close browser instance
	await browser.close();
	// close server
	server.close();
});

// take screenshot for a view
async function takeScreenshot(browser, view, orbit, modelName) {
	const page = await browser.newPage();
	await page.goto(`http://localhost:5500/${view}`);
	const modelViewer = await page.$("model-viewer");
	await page.waitForFunction('document.querySelector("model-viewer").loaded');
	await modelViewer.screenshot({ path: `output/${modelName}_${view}.png` });
	console.log(`${view} screenshot taken`);
	await page.close();
}
