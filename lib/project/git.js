'use strict';

const BaseProject = require('./base');
const codeownersConfigTemplate = require('../template/codeowners-config');
const codeOfConductTemplate = require('../template/documentation/code-of-conduct');

module.exports = class GitProject extends BaseProject {
	constructor(runner) {
		super(runner);
		this.readme = this.fs.loadAsMarkdown('README.md');
		this.settings = this.fs.loadAsYaml('.github/settings.yml');
	}

	async test() {
		// Check for file presence
		await this.fs.assertFileExists('.github/CODEOWNERS', codeownersConfigTemplate());
		await this.fs.assertFileExists('.gitignore');
		await this.fs.assertFileExists('LICENSE', null, false);
		await this.fs.assertFileExists('README.md', null, false);
		await this.fs.assertFileMatches('docs/code_of_conduct.md', codeOfConductTemplate());
		await this.fs.assertFileNotExists('Makefile');
		await this.fs.assertFileExists('.github/settings.yml', '{}');
		await this.fs.assertFileNotExists('.github/workflows/sync-repo-labels.yml');
		await this.fs.assertDirectoryNotExists('.circleci');
		await this.fs.assertFileNotExists('.travis.yml');

		// Check for required README data
		await this.readme.assertHasLevel2Heading('Table of Contents');
		await this.readme.assertHasLevel2Heading('Contributing');
		await this.readme.assertHasLink('#contributing');
		await this.readme.assertHasLevel2Heading('License');
		await this.readme.assertHasLink('#license');
		await this.readme.assertHasLink('docs/code_of_conduct.md');
		await this.readme.assertHasLink('LICENSE');

		// Check for required GitHub settings
		if (!(await this.fs.fileExists('.github/settings.lock'))) {
			await this.settings.assertPropertyMatches('_extends', 'rowanmanning/github-settings');
		}
	}
};
