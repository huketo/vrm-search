# converter for `.vrm` to `.glb`

Using [tinygo](https://tinygo.org/) to build `.wasm` file.

## Prerequisite

- [go](https://golang.org/) higher than `v1.20.0`
- [tinygo](https://tinygo.org/)
- [node.js](https://nodejs.org/en/) higher than `v20.10.0`

## Build

```bash
tinygo build -o converter.wasm -target wasi ./converter-go/converter.go
```