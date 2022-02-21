'use strict';

const fs = require('fs/promises');

module.exports = function deleteFile(filePath) {
	return fs.rm(filePath);
};
