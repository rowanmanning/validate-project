'use strict';

const fs = require('node:fs/promises');

module.exports = function deleteFile(filePath) {
	return fs.rm(filePath);
};
