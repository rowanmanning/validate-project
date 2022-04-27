'use strict';

const NodeProject = require('./node');
const releasePlease = require('../template/workflows/release-please');

module.exports = class NodeLibraryProject extends NodeProject {

	constructor(runner) {
		super(runner);
		this.npmignore = this.fs.loadAsIgnoreFile('.npmignore');
	}

	async test() {
		await super.test();

		// Check for required README data
		await this.readme.assertHasLevel2Heading('Usage');
		await this.readme.assertHasLink('#usage');
		await this.readme.assertHasLink('https://www.npmjs.com/');

		// Add files to npm ignore
		await this.fs.assertFileExists('.npmignore', '');
		await this.npmignore.assertIncludes('.eslintrc.json');
		await this.npmignore.assertIncludes('.github');
		await this.npmignore.assertIncludes('docs');
		await this.npmignore.assertIncludes('test');
		await this.npmignore.assertIncludes('CHANGELOG.md');
		if (await this.fs.directoryExists('test/unit')) {
			await this.npmignore.assertIncludes('.nyc_output');
			await this.npmignore.assertIncludes('coverage');
		}
		if (await this.fs.directoryExists('example')) {
			await this.npmignore.assertIncludes('example');
		}
		if (await this.fs.directoryExists('.husky')) {
			await this.npmignore.assertIncludes('.husky');
		}
		if (await this.fs.fileExists('.commitlintrc.json')) {
			await this.npmignore.assertIncludes('.commitlintrc.json');
		}

		// Disallow the old npm publish workflow
		await this.fs.assertFileNotExists('.github/workflows/npm-publish.yml');

		// Use Release Please
		const packageName = await this.manifest.getProperty('name');
		if (packageName && !(await this.manifest.getProperty('private'))) {
			await this.fs.assertFileMatches('.github/workflows/release-please.yml', releasePlease({
				maximumNodeVersion: await this.maximumNodeVersion(),
				packageName
			}));
		}
	}

};
