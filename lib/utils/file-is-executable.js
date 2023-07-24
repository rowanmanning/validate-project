'use strict';

const {constants} = require('node:fs');
const fs = require('node:fs/promises');

module.exports = async function fileIsExecutable(filePath) {
	try {
		await fs.access(filePath, constants.X_OK);
		return true;
	} catch (error) {
		return false;
	}
};
