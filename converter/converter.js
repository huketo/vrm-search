import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { WASI } from "wasi";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const convertVrmToGlb = async (vrmPath, glbPath) => {
	// extract absolute path
	const vrmAbsPath = path.resolve(vrmPath);
	const glbAbsPath = path.resolve(glbPath);
	const vrmAbsDirPath = path.resolve(path.dirname(vrmPath));
	const glbAbsDirPath = path.resolve(path.dirname(glbPath));
	
	// WASI setup
	const wasi = new WASI({
		version: "preview1",
		args: ["", "-i", vrmAbsPath, "-o", glbAbsPath],
		preopens: {
			[vrmAbsDirPath]: vrmAbsDirPath,
			[glbAbsDirPath]: glbAbsDirPath,
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
