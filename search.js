import weaviate from 'weaviate-ts-client';
import { cubemapSchemaConfig } from './schema/cubemap.js';
import {
  readFileSync,
  readdirSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  unlinkSync,
} from 'fs';

const client = weaviate.client({
  scheme: 'http',
  host: 'localhost:8080',
});

const schemeRes = await client.schema.getter().do();

// Check if schema already exists
if (!schemeRes.classes.length) {
  console.log('schema is empty, creating schema...');
  await client.schema.classCreator().withClass(cubemapSchemaConfig).do();
  console.log('schema created');
} else {
  console.log('schema already exists, deleting schema...');
  await client.schema.classDeleter().withClassName('VrmModel').do();
  console.log('schema deleted, creating schema...');
  await client.schema.classCreator().withClass(cubemapSchemaConfig).do();
}

const data = await client.data.getter().withClassName('VrmModel').do();
if (data.totalResults) {
  console.log('data is already in the database');
} else {
  console.log('data is empty, importing data...');
  addDatas();
}

async function addDatas() {
  const imgDirs = readdirSync('./images');
  let promises = [];

  // create promises for each image directory
  imgDirs.map(async (imgDir) => {
    // ignore README.md
    if (imgDir.includes('README')) return;
    const imgFiles = readdirSync(`./images/${imgDir}`);

    for (let i = 0; i < imgFiles.length; i++) {
      // insert images blob to properties
      const img = readFileSync(`./images/${imgDir}/${imgFiles[i]}`);
      const b64 = Buffer.from(img).toString('base64');
      // ex) AvatarSample_A___back.png
      const view = imgFiles[i].split('___')[1].split('.')[0];
      // insert data to weaviate
      await client.data
        .creator()
        .withClassName('VrmModel')
        .withProperties({
          title: imgDir,
          view: view,
          image: b64,
        })
        .do();
    }
  });

  // wait until all promises are resolved
  await Promise.all(promises);
}

// wait 5s for data to be indexed
console.log('waiting 5s for data to be indexed...');
await new Promise((resolve) => setTimeout(resolve, 5000));

// Search data
const testImgPath = `./samples/sample_a.png`;
const testImg = readFileSync(testImgPath);
const testImgBase64 = Buffer.from(testImg).toString('base64');
console.log(`Searching for ${testImgPath}...`);
// copy search input image to result folder
if (!existsSync('./results')) {
  mkdirSync('./results');
}
writeFileSync(`./results/input.png`, testImgBase64, 'base64');

const searchRes = await client.graphql
  .get()
  .withClassName('VrmModel')
  .withFields(['title', 'view', 'image'])
  .withNearImage({
    image: testImgBase64,
  })
  .withLimit(5)
  .do();

// remove all images before write
const resultFiles = readdirSync('./results');
resultFiles.map((resultFile) => {
  if (resultFile.includes('input')) return;
  if (resultFile.includes('result_')) {
    console.log(`Removing ${resultFile}`);
    unlinkSync(`./results/${resultFile}`);
  }
});

if (!searchRes.data.Get.VrmModel.length) {
  console.log('No result found');
} else {
  for (let i = 0; i < searchRes.data.Get.VrmModel.length; i++) {
    console.log(
      `Result ${i + 1}: ${searchRes.data.Get.VrmModel[i].title}, view: ${
        searchRes.data.Get.VrmModel[i].view
      }`
    );

    // write result image to result folder
    const resultImg = searchRes.data.Get.VrmModel[i].image;
    writeFileSync(
      `./results/result_${i + 1}_${searchRes.data.Get.VrmModel[i].title}_${
        searchRes.data.Get.VrmModel[i].view
      }.png`,
      resultImg,
      'base64'
    );
  }
}
