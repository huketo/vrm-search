import weaviate from "weaviate-ts-client";
import { cubemapSchemaConfig } from "./schema/cubemap.js";
import {
	readFileSync,
	readdirSync,
	writeFileSync,
	existsSync,
	mkdirSync,
} from "fs";

const client = weaviate.client({
	scheme: "http",
	host: "localhost:8080",
});

const schemeRes = await client.schema.getter().do();

// Check if schema already exists
if (!schemeRes.classes.length) {
	console.log("schema is empty, creating schema...");
	await client.schema.classCreator().withClass(cubemapSchemaConfig).do();
	console.log("schema created");
} else {
	console.log("schema already exists, deleting schema...");
	await client.schema.classDeleter().withClassName("VrmModel").do();
	console.log("schema deleted, creating schema...");
	await client.schema.classCreator().withClass(cubemapSchemaConfig).do();
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
		// get Image 'model___joined.png' from each directory
		const joinedImg = imgFiles.find((imgFile) =>
			imgFile.includes("___joined")
		);
		// insert images blob to properties
		const img = readFileSync(`./images/${imgDir}/${joinedImg}`);
		const b64 = Buffer.from(img).toString("base64");
		// insert data to weaviate
		await client.data
			.creator()
			.withClassName("VrmModel")
			.withProperties({
				title: imgDir,
				image: b64,
			})
			.do();
	});

	// wait until all promises are resolved
	await Promise.all(promises);
}

// Search data
const testModel = "meebit_09842";
const testImgPath = `./images/${testModel}/${testModel}___joined.png`;
const testImg = readFileSync(testImgPath);
const testImgBase64 = Buffer.from(testImg).toString("base64");
console.log(`Searching for ${testModel}___joined.png...`);
// copy search input image to result folder
writeFileSync(`./result/input.png`, testImgBase64, "base64");

const searchRes = await client.graphql
	.get()
	.withClassName("VrmModel")
	.withFields(["title", "image"])
	.withNearImage({ image: testImgBase64 })
	.withLimit(5)
	.do();

for (let i = 0; i < searchRes.data.Get.VrmModel.length; i++) {
	console.log(`Result ${i + 1}: ${searchRes.data.Get.VrmModel[i].title}`);
	if (!existsSync("./result")) {
		mkdirSync("./result");
	}
	writeFileSync(
		`./result/${i + 1}.png`,
		searchRes.data.Get.VrmModel[i].image,
		"base64"
	);
}

if (!searchRes.data.Get.VrmModel.length) {
	console.log("No result found");
}