'use strict';

const writeFile = require('./write-file');

module.exports = async function touchFile(filePath) {
	await writeFile(filePath, '');
};
