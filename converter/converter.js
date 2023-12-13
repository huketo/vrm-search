import fs from "fs";
import path from "path";
import { WASI } from "wasi";

const convertVrmToGlb = async (vrmPath, glbPath) => {
	// WASI setup
	const wasi = new WASI({
    version: "preview1",
		args: ["", "-i", vrmPath, "-o", glbPath],
		preopens: {
			"../models": path.resolve("../models"),
		},
	});
	const importObject = { wasi_snapshot_preview1: wasi.wasiImport };
	// .wasm file load
	const wasmPath = path.join("./wasm/converter.wasm");
	const wasm = fs.readFileSync(wasmPath);

	// WebAssembly.instantiate
	const wasmInstance = await WebAssembly.instantiate(wasm, importObject);

	wasi.start(wasmInstance.instance);
};

await convertVrmToGlb(
	"../models/victoria-jeans.vrm",
	"../models/victoria-jeans.glb"
);

// export default convertVrmToGlb;
