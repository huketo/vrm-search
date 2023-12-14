# VRM to Vector

<!-- 어떻게 동작하는 가 -->

## How it works

### 1. `.vrm` file convert to `.glb`

### 2. Create cubemap images with a `.glb` file by using `puppeteer`

> [How to Use in Puppeteer WSL](https://pptr.dev/troubleshooting#running-puppeteer-on-wsl-windows-subsystem-for-linux)

### 3. Save the cube map images in the vector database using the weaviate API

### 4. Similar Query

## Usage

```bash
npm install
node index.js -i <input file path>
```

## Features

- [x] `.vrm` file convert to `.glb`
- [x] Create cubemap images with a `.glb` file by using `puppeteer`
- [ ] Save the cube map images in the vector database using the weaviate API
- [ ] Similar Query
