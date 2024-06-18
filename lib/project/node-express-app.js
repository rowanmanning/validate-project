'use strict';

const NodeProject = require('./node');

module.exports = class NodeExpressAppProject extends NodeProject {
	async test() {
		// Check for required folders
		await this.fs.assertDirectoryExists('client/public');
		await this.fs.assertDirectoryExists('server');

		// Check for required manifest properties
		await this.manifest.assertPropertyMatches('private', true);

		// Check for start script
		await this.manifest.assertPropertyMatches('scripts.start', 'node .');

		// Check for start:dev script
		let startDev = 'nodemon .';
		const hasPinoPrettyInstalled =
			(await this.manifest.hasProperty('devDependencies.pino-pretty')) ||
			(await this.manifest.hasProperty('dependencies.pino-pretty'));
		if (hasPinoPrettyInstalled) {
			startDev = `${startDev} | pino-pretty`;
		}
		await this.manifest.assertPropertyMatches('scripts.start:dev', startDev);

		// Check for Sass build scripts
		const watchScripts = [];
		const shouldBuildSass =
			(await this.manifest.hasProperty('devDependencies.sass')) &&
			(await this.fs.fileExists('client/sass/main.scss'));
		if (shouldBuildSass) {
			const buildCss = 'sass client/sass/main.scss:client/public/main.css --style=compressed';
			this.npmGroupScripts.build.push('npm run build:css');
			await this.manifest.assertPropertyMatches('scripts.build:css', buildCss);
			watchScripts.push('npm run watch:css');
			await this.manifest.assertPropertyMatches('scripts.watch:css', `${buildCss} --watch`);
		}

		await super.test();

		// Check for build script
		if (watchScripts.length) {
			await this.manifest.assertPropertyMatches('scripts.watch', watchScripts.join(' && '));
		}

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
