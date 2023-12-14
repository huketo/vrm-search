const cubemapSchemaConfig = {
	class: "VrmModel",
	description: "Cubemap image with 6 faces for Humanoid 3D model",
	vectorizer: "img2vec-neural",
	vectorIndexConfig: {
    distance: 'cosine',
  },
	moduleConfig: {
		"img2vec-neural": {
			imageFields: ["front", "back", "left", "right", "top", "bottom"],
		},
	},
	properties: [
		{
			dataType: ["blob"],
			description: "Cubemap image (front)",
			name: "front",
		},
		{
			dataType: ["blob"],
			description: "Cubemap image (back)",
			name: "back",
		},
		{
			dataType: ["blob"],
			description: "Cubemap image (left)",
			name: "left",
		},
		{
			dataType: ["blob"],
			description: "Cubemap image (right)",
			name: "right",
		},
		{
			dataType: ["blob"],
			description: "Cubemap image (top)",
			name: "top",
		},
		{
			dataType: ["blob"],
			description: "Cubemap image (bottom)",
			name: "bottom",
		},
		{
			dataType: ["string"],
			description: "model name (description) of the given image.",
			name: "title",
		},
	],
};

export { cubemapSchemaConfig };
