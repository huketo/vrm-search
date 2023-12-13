package main

import (
	"flag"

	"github.com/qmuntal/gltf"
)

// Build command
// tinygo build -o converter.wasm -target=wasm converter.go

func convert(input string, output string) {
	// Load VRM file
	doc, err := gltf.Open(input)
	if err != nil {
		panic(err)
	}

	// Save GLB file
	gltf.SaveBinary(doc, output)
}

func main() {
	// Parse arguments
	// converter -i /path/to/model.vrm -o /path/to/model.glb
	var input string
	var output string
	flag.StringVar(&input, "i", "", "input file path")
	flag.StringVar(&output, "o", "", "output file path")
	flag.Parse()

	// Convert VRM to GLTF
	convert(input, output)
}
