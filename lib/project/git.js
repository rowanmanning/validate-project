'use strict';

const BaseProject = require('./base');
const codeownersConfigTemplate = require('../template/codeowners-config');
const syncRepoLabels = require('../template/workflows/sync-repo-labels');

module.exports = class GitProject extends BaseProject {

	async test() {
		await this.fs.assertFileExists('.github/CODEOWNERS', codeownersConfigTemplate());
		await this.fs.assertFileExists('.gitignore');
		await this.fs.assertFileExists('LICENSE', null, false);
		await this.fs.assertFileExists('README.md', null, false);
		await this.fs.assertFileNotExists('Makefile');
		await this.fs.assertFileMatches('.github/workflows/sync-repo-labels.yml', syncRepoLabels());
		await this.fs.assertDirectoryNotExists('.circleci');
		await this.fs.assertFileNotExists('.travis.yml');
	}

};
