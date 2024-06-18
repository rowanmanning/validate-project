'use strict';

const NodeProject = require('./node');

module.exports = class NodeArcAppProject extends NodeProject {
	async test() {
		await super.test();

		// Check for required files and folders
		await this.fs.assertFileExists('app.arc');
		await this.fs.assertDirectoryExists('src/http');

		// Check for required manifest properties
		await this.manifest.assertPropertyMatches('private', true);

		// Check for start script
		await this.manifest.assertPropertyMatches('scripts.start', 'arc sandbox');

		// Check for start:dev script
		let startDev = 'arc sandbox';
		const hasPinoPrettyInstalled =
			(await this.manifest.hasProperty('devDependencies.pino-pretty')) ||
			(await this.manifest.hasProperty('dependencies.pino-pretty'));
		if (hasPinoPrettyInstalled) {
			startDev = `${startDev} | pino-pretty`;
		}
		await this.manifest.assertPropertyMatches('scripts.start:dev', startDev);

		// Check for dependencies
		await this.manifest.assertPropertyExists('dependencies.@architect/functions');
		await this.manifest.assertPropertyExists('devDependencies.@architect/architect');

		// Check for sample environment file
		await this.fs.assertFileExists('sample.env');

		// Check for required README data
		await this.readme.assertHasLevel2Heading('Running Locally');
		await this.readme.assertHasLink('#running-locally');
	}
};
