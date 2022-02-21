'use strict';

const fs = require('fs/promises');

module.exports = async function touchDirectory(directoryPath) {
	await fs.mkdir(directoryPath, {
		recursive: true
	});
};
