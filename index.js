import * as THREE from "three";
import { GLTFLoader } from "node-three-gltf";
// import { GLTFLoader } from "./lib/loaders/GLTFLoader.js";
import { VRMLoaderPlugin } from "@pixiv/three-vrm";
import { createCanvas } from "./lib/canvas/index.js";
import fs from "fs";
import { PNG } from "pngjs";

// Create a canvas and renderer setup
const width = 2048;
const height = 2048;

const canvas = createCanvas(width, height);
const renderer = new THREE.WebGLRenderer({
	canvas,
});
renderer.setSize(width, height);

// scene, camera, light setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
const ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(1, 1, 0).normalize();
scene.add(directionalLight);

// camera position
const cameraPositions = [
	{ x: 0, y: 0, z: 3 }, // 전
	{ x: 3, y: 0, z: 0 }, // 우
	{ x: 0, y: 0, z: -3 }, // 후
	{ x: -3, y: 0, z: 0 }, // 좌
	{ x: 0, y: 3, z: 0 }, // 상
	{ x: 0, y: -1.5, z: 0 }, // 하
];

// VRM file load
const loader = new GLTFLoader();
// Install GLTFLoader plugin
loader.register((parser) => {
	return new VRMLoaderPlugin(parser);
});

loader.load(
	// URL of the VRM you want to load
	"/root/vrm-to-vector/models/victoria-jeans.vrm",
	// called when the resource is loaded
	(glft) => {
		// retrieve the VRM instance from gltf
		const vrm = glft.userData.vrm;
		// add the loaded vrm to the scene
		scene.add(vrm.scene);
		// render and save image
		renderAndSavePng();
	},
	// called while loading is progressing
	(progress) =>
		console.log(
			"Loading model...",
			100.0 * (progress.loaded / progress.total),
			"%"
		),
	// called when loading has errors
	(error) => console.error(error)
);

function renderAndSavePng() {
	cameraPositions.forEach((position, index) => {
		// set camera position
		camera.position.set(position.x, position.y, position.z);
		camera.lookAt(scene.position);
		// render scene
		renderer.render(scene, camera);
		// capture and save the rendered image
    const webGLContext = renderer.getContext();
    const pixels = new Uint8Array(width * height * 4);
    webGLContext.readPixels(0, 0, width, height, webGLContext.RGBA, webGLContext.UNSIGNED_BYTE, pixels);
    const png = new PNG({ width, height });
    for (let i = 0; i < pixels.length; i++) {
      png.data[i] = pixels[i];
    }

    png.pack().pipe(fs.createWriteStream(`./output/cubemap_${index}.png`));
	});
}
