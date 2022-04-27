'use strict';

const {constants} = require('fs');
const fs = require('fs/promises');

module.exports = async function fileIsExecutable(filePath) {
	try {
		await fs.access(filePath, constants.X_OK);
		return true;
	} catch (error) {
		return false;
	}
};
