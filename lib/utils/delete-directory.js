'use strict';

const fs = require('node:fs/promises');

module.exports = function deleteDirectory(filePath) {
	return fs.rm(filePath, {
		recursive: true,
		force: true
	});
};
