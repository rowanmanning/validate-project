'use strict';

const {exec} = require('node:child_process');

module.exports = async function execute(script) {
	return new Promise((resolve, reject) => {
		exec(script, (error, stdout, stderr) => {
			if (error) {
				return reject(error);
			}
			resolve({
				stdout,
				stderr
			});
		});
	});
};
