'use strict';

const fs = require('node:fs/promises');

module.exports = async function makeFileExecutable(filePath) {
	await fs.chmod(filePath, '755');
};
