'use strict';

const fs = require('fs/promises');
const path = require('path');

module.exports = async function appendFile(filePath, content) {
	const directory = path.dirname(filePath);
	await fs.mkdir(directory, {
		recursive: true
	});
	return fs.appendFile(filePath, `\n${content}`);
};
