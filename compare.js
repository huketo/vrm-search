import weaviate from "weaviate-ts-client";
import { cubemapSchemaConfig } from "./schema/cubemap.js";
import { readFileSync, readdirSync, writeFileSync } from "fs";

const client = weaviate.client({
	scheme: "http",
	host: "localhost:8080",
});

const schemeRes = await client.schema.getter().do();

if (!schemeRes.classes.length) {
	console.log("schema is empty, creating schema...");
	await client.schema.classCreator().withClass(cubemapSchemaConfig).do();
	console.log("schema created");
}

const data = await client.data.getter().withClassName("VrmModel").do();
if (data.totalResults) {
	console.log("data is already in the database");
} else {
	console.log("data is empty, importing data...");
	addDatas();
}

async function addDatas() {
	const imgDirs = readdirSync("./images");
	let promises = [];

	// create promises for each image directory
	imgDirs.map(async (imgDir) => {
		const imgFiles = readdirSync(`./images/${imgDir}`);
		let properties = {
			front: null,
			back: null,
			left: null,
			right: null,
			top: null,
			bottom: null,
			title: imgDir,
		};
		// insert images blob to properties
		imgFiles.map(async (imgFile) => {
			const view = imgFile.split("___")[1].split(".")[0];
			const img = readFileSync(`./images/${imgDir}/${imgFile}`);
			const b64 = Buffer.from(img).toString("base64");
			properties[view] = b64;
		});

		// insert data to weaviate
		await client.data
			.creator()
			.withClassName("VrmModel")
			.withProperties(properties)
			.do();
	});

	// wait until all promises are resolved
	await Promise.all(promises);
}

// Search data
let testImgs = {
	front: null,
	back: null,
	left: null,
	right: null,
	top: null,
	bottom: null,
};
const testImgFiles = readdirSync("./images/Darkness_Shibu");
testImgFiles.map(async (imgFile) => {
	const view = imgFile.split("___")[1].split(".")[0];
	const img = readFileSync(`./images/Darkness_Shibu/${imgFile}`);
	const b64 = Buffer.from(img).toString("base64");
	testImgs[view] = b64;
});

const searchRes = await client.graphql
	.get()
	.withClassName("VrmModel")
	.withFields(["front", "back", "left", "right", "top", "bottom", "title"])
	.withNearImage({ image: testImgs.front })
	.withLimit(2)
	.do();

const result = searchRes.data.Get.VrmModel[1];
console.log(result);
