'use strict';

const NodeProject = require('./node');
const npmPublish = require('../template/workflows/npm-publish');

module.exports = class NodeLibraryProject extends NodeProject {

	async test() {
		await super.test();

		if (!(await this.manifest.getProperty('private'))) {
			await this.fs.assertFileMatches('.github/workflows/npm-publish.yml', npmPublish({
				maximumNodeVersion: await this.maximumNodeVersion()
			}));
		}
	}

};
