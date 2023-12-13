import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { WASI } from "wasi";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const convertVrmToGlb = async (vrmPath, glbPath) => {
	// extract directory path from vrmPath
	const dirPath = path.dirname(vrmPath);
	const absDirPath = path.resolve(dirPath);
	// WASI setup
	const wasi = new WASI({
		version: "preview1",
		args: ["", "-i", vrmPath, "-o", glbPath],
		preopens: {
			[absDirPath]: absDirPath,
		},
	});
	const importObject = { wasi_snapshot_preview1: wasi.wasiImport };
	// .wasm file load
	const wasmPath = path.join(__dirname, "converter.wasm");
	const wasm = fs.readFileSync(wasmPath);

	// WebAssembly.instantiate
	const wasmInstance = await WebAssembly.instantiate(wasm, importObject);

	wasi.start(wasmInstance.instance);
};

export { convertVrmToGlb };
