'use strict';

const glob = require('glob');

module.exports = function listFiles(basePath) {
	return new Promise((resolve, reject) => {
		glob('**', {
			cwd: basePath,
			dot: true,
			ignore: [
				'.git/**',
				'.nyc_output/**',
				'coverage/**',
				'node_modules/**'
			],
			mark: true
		}, (error, files) => {
			if (error) {
				return reject(error);
			}
			resolve(files);
		});
	});
};
