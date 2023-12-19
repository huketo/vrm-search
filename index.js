import http from 'http';
import express from 'express';
import puppeteer, { Browser } from 'puppeteer';
import path from 'path';
import fs from 'fs';

// parse command line arguments
const args = process.argv.slice(2);

let inputPath;
let outputPath;
let modelName;
// -i option
args.forEach((arg, i) => {
  if (arg === '-i') {
    inputPath = args[i + 1];
  }
});

// invalid arguments
if (!inputPath) {
  console.error('Usage: node script.js -i <path_to_vrm_file>');
  process.exit(1);
}
// invalid file extension, Input file must be '.vrm' or '.gltf' or '.glb'
if (!inputPath.endsWith('.vrm') && !inputPath.endsWith('.glb')) {
  console.error("Input file must be '.vrm' or '.glb'");
  process.exit(1);
}

// extract model name from inputPath
if (inputPath.endsWith('.vrm')) {
  outputPath = inputPath.replace(/\.vrm$/, '.glb');
  modelName = path.basename(inputPath, '.vrm');
  // convert `vrm` to `glb` and set src attribute to model path
  console.log('Converting VRM to GLB...');
  console.log(`Input: ${inputPath}`);
  console.log(`Output: ${outputPath}`);
  fs.copyFileSync(inputPath, outputPath);
}
if (inputPath.endsWith('.glb')) {
  modelName = path.basename(inputPath, '.glb');
}

const app = express();
const server = http.createServer(app);

// TODO: get .env variables
const hostname = 'localhost';
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', './views');

const orbitViews = {
  front: '180.0deg 90.00deg 4m',
  back: '0.0deg 90.00deg 4m',
  right: '90.0deg 90.00deg 4m',
  left: '-90.0deg 90.00deg 4m',
  top: '0.0deg 0.00deg 4m',
  bottom: '0.0deg 180.00deg 4m',
};

// add routes for each view
for (const [view, orbit] of Object.entries(orbitViews)) {
  app.get(`/${view}`, (req, res) => {
    res.render('index', {
      modelSrc: `${modelName}.glb`,
      cameraOrbit: orbit,
    });
  });
}

// serve static files
const inputDir = path.dirname(inputPath);
console.log(`Serving static files from ${inputDir}`);
app.use(express.static(inputDir));

server.listen(port, hostname, async () => {
  console.log(`Server running at http://${hostname}:${port}/`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox'],
  });

  // take screenshots for each view in parallel
  const screenshotPromises = Object.entries(orbitViews).map(([view, orbit]) => {
    return takeScreenshot(browser, view, orbit, modelName);
  });

  // wait for all screenshots to be taken
  await Promise.all(screenshotPromises);

  // close browser instance
  await browser.close();

  // close server
  server.close();
});

/**
 * @name takeScreenshot
 * @description take screenshot of model-viewer
 * @param {Browser} browser
 * @param {String} view
 * @param {String?} orbit
 * @param {String} modelName
 */
async function takeScreenshot(browser, view, orbit, modelName) {
  const page = await browser.newPage();
  await page.goto(`http://localhost:${port}/${view}`);
  const modelViewer = await page.$('model-viewer');
  await page.waitForFunction('document.querySelector("model-viewer").loaded');
  // get model-viewer cameraOrbit attribute
  const initialRadius = await page.evaluate(
    () => document.querySelector('model-viewer').getCameraOrbit().radius
  );
  const cameraOrbit = getCameraOrbit(view, initialRadius);
  // set model-viewer cameraOrbit attribute
  await page.evaluate(
    (cameraOrbit) =>
      (document.querySelector('model-viewer').cameraOrbit = cameraOrbit),
    cameraOrbit
  );

  // create directory 'images/${modelName}' if it doesn't exist
  const dir = path.join('images', modelName);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  await modelViewer.screenshot({
    path: `images/${modelName}/${modelName}___${view}.png`,
  });
  console.log(`${view} screenshot taken`);
  await page.close();
}

/**
 * @description get cameraOrbit attribute for model-viewer's cameraOrbit radius
 * @param {String} view
 * @param {String} radius
 * @returns {String} cameraOrbit
 */
function getCameraOrbit(view, radius) {
  if (view === 'front') {
    return `180.0deg 90.00deg ${radius}m`;
  } else if (view === 'back') {
    return `0.0deg 90.00deg ${radius}m`;
  } else if (view === 'right') {
    return `90.0deg 90.00deg ${radius}m`;
  } else if (view === 'left') {
    return `-90.0deg 90.00deg ${radius}m`;
  } else if (view === 'top') {
    return `0.0deg 0.00deg ${radius}m`;
  } else if (view === 'bottom') {
    return `0.0deg 180.00deg ${radius}m`;
  }
}
