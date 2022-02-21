'use strict';

const readFile = require('./read-file');

module.exports = function readJson(filePath) {
	return readFile(filePath).then(content => JSON.parse(content));
};
