'use strict';

const fs = require('node:fs/promises');

module.exports = function readFile(filePath) {
	return fs.readFile(filePath, 'utf-8');
};
