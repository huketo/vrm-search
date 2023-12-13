import http from "http";
import express from "express";
import puppeteer from "puppeteer";
import path from "path";
import { convertVrmToGlb } from "./converter/converter.js";

const vrmPath = path.resolve("./models/meebit_09842.vrm");
const glbPath = path.resolve("./models/meebit_09842.glb");

// convert `vrm` to `glb` and set src attribute to model path
await convertVrmToGlb(vrmPath, glbPath);

const app = express();
const server = http.createServer(app);

const hostname = "localhost";
const port = 5500;

app.set("view engine", "ejs");
app.set("views", "./views");

app.get("/", (req, res) => {
	res.render("index", { modelSrc: "meebit_09842.glb" });
});

app.use(express.static("models"));

server.listen(port, hostname, async () => {
	console.log(`Server running at http://${hostname}:${port}/`);

	// camera-orbit="180.0deg 90.00deg 4m" => front
	// camera-orbit="0.0deg 90.00deg 4m" => back
	// camera-orbit="90.0deg 90.00deg 4m" => right
	// camera-orbit="270.0deg 90.00deg 4m" => left
	// camera-orbit="0.0deg 0.00deg 4m" => top
	// camera-orbit="0.0deg 180.00deg 4m" => bottom

	const browser = await puppeteer.launch({
		headless: "new",
		args: ["--no-sandbox"],
	});
	const page = await browser.newPage();
	await page.goto("http://localhost:5500");

	let modelViewer = await page.$("model-viewer");
	// wait model to load, change loaded property to true
	await page.waitForFunction('document.querySelector("model-viewer").loaded');
	console.log("model loaded");

	// Set camera orbit and wait for each view before taking a screenshot

	// front view
	await modelViewer.evaluate((modelViewer) => {
		modelViewer.setAttribute("camera-orbit", "180.0deg 90.00deg 4m");
	});
	await modelViewer.screenshot({ path: "output/front.png" });
	console.log("front screenshot taken");

	// back view
	await page.reload();
	await page.waitForFunction('document.querySelector("model-viewer").loaded');
	modelViewer = await page.$("model-viewer");
	await modelViewer.evaluate((modelViewer) => {
		modelViewer.setAttribute("camera-orbit", "0.0deg 90.00deg 4m");
	});
	await modelViewer.screenshot({ path: "output/back.png" });
	console.log("back screenshot taken");

	// right view
	await page.reload();
	await page.waitForFunction('document.querySelector("model-viewer").loaded');
	modelViewer = await page.$("model-viewer");
	await modelViewer.evaluate((modelViewer) => {
		modelViewer.setAttribute("camera-orbit", "90.0deg 90.00deg 4m");
	});
	await modelViewer.screenshot({ path: "output/right.png" });
	console.log("right screenshot taken");

	// left view
	await page.reload();
	await page.waitForFunction('document.querySelector("model-viewer").loaded');
	modelViewer = await page.$("model-viewer");
	await modelViewer.evaluate((modelViewer) => {
		modelViewer.setAttribute("camera-orbit", "270.0deg 90.00deg 4m");
	});
	await modelViewer.screenshot({ path: "output/left.png" });
	console.log("left screenshot taken");

	// top view
	await page.reload();
	await page.waitForFunction('document.querySelector("model-viewer").loaded');
	modelViewer = await page.$("model-viewer");
	await modelViewer.evaluate((modelViewer) => {
		modelViewer.setAttribute("camera-orbit", "0.0deg 0.00deg 4m");
	});
	await modelViewer.screenshot({ path: "output/top.png" });
	console.log("top screenshot taken");

	// bottom view
	await page.reload();
	await page.waitForFunction('document.querySelector("model-viewer").loaded');
	modelViewer = await page.$("model-viewer");
	await modelViewer.evaluate((modelViewer) => {
		modelViewer.setAttribute("camera-orbit", "0.0deg 180.00deg 4m");
	});
	await modelViewer.screenshot({ path: "output/bottom.png" });
	console.log("bottom screenshot taken");

	await browser.close();

	// close server
	server.close();
});
