const cubemapSchemaConfig = {
	class: "VrmModel",
	description: "Cubemap image with 6 faces for Humanoid 3D model",
	vectorizer: "img2vec-neural",
	vectorIndexType: "hnsw",
	moduleConfig: {
		"img2vec-neural": {
			imageFields: ["image"],
		},
	},
	properties: [
		{
			dataType: ["blob"],
			description: "Cubemap image",
			name: "image",
		},
		{
			dataType: ["string"],
			description: "model name (description) of the given image.",
			name: "title",
		},
	],
};

export { cubemapSchemaConfig };
