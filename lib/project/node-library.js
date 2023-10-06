'use strict';

const NodeProject = require('./node');
const releasePlease = require('../template/workflows/release-please');

module.exports = class NodeLibraryProject extends NodeProject {

	constructor(runner) {
		super(runner);
		this.npmignore = this.fs.loadAsIgnoreFile('.npmignore');
	}

	async test() {
		if (await this.manifest.hasProperty('devDependencies.typescript')) {
			await this.manifest.assertPropertyMatches(
				'scripts.build:types',
				'tsc --noEmit false --emitDeclarationOnly --project ./jsconfig.json'
			);
			this.npmGroupScripts.build.push('npm run build:types');
		}

		await super.test();

		// Check for required README data
		await this.readme.assertHasLevel2Heading('Usage');
		await this.readme.assertHasLink('#usage');
		await this.readme.assertHasLink('https://www.npmjs.com/');

		// Add files to npm ignore
		await this.fs.assertFileExists('.npmignore', '');
		if (await this.manifest.hasProperty('devDependencies.typescript')) {
			await this.npmignore.assertIncludes('!*.d.ts');
			await this.npmignore.assertIncludes('!*.d.ts.map');
			await this.npmignore.assertIncludes('jsconfig.json');
		}
		await this.npmignore.assertIncludes('.eslintrc.json');
		await this.npmignore.assertIncludes('.github');
		await this.npmignore.assertIncludes('docs');
		await this.npmignore.assertIncludes('test');
		await this.npmignore.assertIncludes('CHANGELOG.md');
		await this.npmignore.assertIncludes('.nyc_output');
		await this.npmignore.assertIncludes('coverage');
		await this.npmignore.assertIncludes('.husky');
		await this.npmignore.assertIncludes('.commitlintrc.json');
		if (await this.fs.directoryExists('example')) {
			await this.npmignore.assertIncludes('example');
		}

		// Disallow the old npm publish workflow
		await this.fs.assertFileNotExists('.github/workflows/npm-publish.yml');

		// Use Release Please
		const packageName = await this.manifest.getProperty('name');
		if (packageName && !(await this.manifest.getProperty('private'))) {
			await this.fs.assertFileMatches('.github/workflows/release-please.yml', releasePlease({
				stableNodeVersion: await this.stableNodeVersion(),
				packageName,
				hasBuildScript: this.npmGroupScripts.build.length > 0
			}));
		}
	}

};
