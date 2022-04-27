'use strict';

const fs = require('fs/promises');

module.exports = async function makeFileExecutable(filePath) {
	await fs.chmod(filePath, '755');
};
