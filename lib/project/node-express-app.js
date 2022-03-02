'use strict';

const NodeProject = require('./node');

module.exports = class NodeExpressAppProject extends NodeProject {

	async test() {
		await super.test();

		// Check for required folders
		await this.fs.assertDirectoryExists('client/public');
		await this.fs.assertDirectoryExists('server');

		// Check for required manifest properties
		await this.manifest.assertPropertyMatches('private', true);

		// Check for required scripts
		await this.manifest.assertPropertyMatches('scripts.start', 'node .');
		await this.manifest.assertPropertyMatches('scripts.start:dev', 'nodemon .');

		// Check for required nodemon config
		await this.manifest.assertPropertyExists('devDependencies.nodemon');
		await this.manifest.assertPropertyExists('nodemonConfig', {});
		await this.manifest.assertPropertyExists('nodemonConfig.ext', 'js,jsx');
		await this.manifest.assertPropertyExists('nodemonConfig.ignore', ['test/*']);

		// Check for required dotenv
		await this.manifest.assertPropertyExists('dependencies.dotenv');
		await this.fs.assertFileExists('sample.env');

		// Check for required README data
		await this.readme.assertHasLevel2Heading('Running Locally');
		await this.readme.assertHasLink('#running-locally');
		await this.readme.assertHasLevel2Heading('Running on a Server');
		await this.readme.assertHasLink('#running-on-a-server');
	}

};
