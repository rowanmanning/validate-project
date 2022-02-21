'use strict';

const readFile = require('./read-file');

module.exports = function readLines(filePath) {
	return readFile(filePath).then(content => content.split('\n'));
};
