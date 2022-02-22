'use strict';

const NodeProject = require('./node');
const npmPublish = require('../template/workflows/npm-publish');

module.exports = class NodeLibraryProject extends NodeProject {

	constructor(basePath, log) {
		super(basePath, log);
		this.npmignore = this.fs.loadAsIgnoreFile('.npmignore');
	}

	async test() {
		await super.test();

		// Add files to npm ignore
		await this.fs.assertFileExists('.npmignore', '');
		await this.npmignore.assertIncludes('.eslintrc.json');
		await this.npmignore.assertIncludes('.github');
		await this.npmignore.assertIncludes('docs');
		await this.npmignore.assertIncludes('test');
		if (await this.fs.directoryExists('test/unit')) {
			await this.npmignore.assertIncludes('.nyc_output');
			await this.npmignore.assertIncludes('coverage');
		}

		if (!(await this.manifest.getProperty('private'))) {
			await this.fs.assertFileMatches('.github/workflows/npm-publish.yml', npmPublish({
				maximumNodeVersion: await this.maximumNodeVersion()
			}));
		}
	}

};
