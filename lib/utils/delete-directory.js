'use strict';

const fs = require('fs/promises');

module.exports = function deleteDirectory(filePath) {
	return fs.rm(filePath, {
		recursive: true,
		force: true
	});
};
