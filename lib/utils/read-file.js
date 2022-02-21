'use strict';

const fs = require('fs/promises');

module.exports = function readFile(filePath) {
	return fs.readFile(filePath, 'utf-8');
};
