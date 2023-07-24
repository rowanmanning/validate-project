'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

module.exports = async function writeFile(filePath, content) {
	const directory = path.dirname(filePath);
	await fs.mkdir(directory, {
		recursive: true
	});
	return fs.writeFile(filePath, content);
};
