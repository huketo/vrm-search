import sharp from "sharp";

/**
 * @param {String[]} imagePaths
 * @param {String} outputPath
 */
async function joinImageHorizontally(imagePaths, outputPath) {
	// Load images
	const images = await Promise.all(
		imagePaths.map((path) =>
			sharp(path)
				.metadata()
				.then((metadata) => ({ path, metadata }))
				.catch((error) =>
					console.error(
						`Failed to load image at ${path}: ${error.message}`
					)
				)
		)
	);

	// Filter out failed loads
	const loadedImages = images.filter((image) => image !== undefined);

	// all images must have the same height
	const maxHeight = Math.max(
		...loadedImages.map((image) => image.metadata.height)
	);

	// Check if all images have the same height
	if (loadedImages.some((image) => image.metadata.height !== maxHeight)) {
		console.error("All images must have the same height.");
		return;
	}

	// Arrange images horizontally, white background
	let x = 0;
	const outputImage = imagePaths.map((path, index) => {
		const image = {
			input: path,
			top: 0,
			left: x,
		};
		x += loadedImages[index].metadata.width;
		return image;
	});

	// Composite images and save
	await sharp({
		create: {
			width: x,
			height: maxHeight,
			channels: 4,
			background: { r: 255, g: 255, b: 255 },
		},
	})
		.composite(outputImage)
		.toFile(outputPath);

	console.log(`Joined Image saved to ${outputPath}`);
}

export { joinImageHorizontally };
