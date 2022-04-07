'use strict';

const BaseProject = require('./base');
const contributingNodeTemplate = require('../template/documentation/contributing-node');
const dependabotConfigTemplate = require('../template/dependabot-config');
const semver = require('semver');
const verifyTest = require('../template/workflows/verify-test');

module.exports = class NodeProject extends BaseProject {

	constructor(runner) {
		super(runner);
		this.manifest = this.fs.loadAsJson('package.json');
		this.eslintConfig = this.fs.loadAsJson('.eslintrc.json');
		this.testEslintConfig = this.fs.loadAsJson('test/.eslintrc.json');
		this.gitignore = this.fs.loadAsIgnoreFile('.gitignore');
		this.readme = this.fs.loadAsMarkdown('README.md');
	}

	async test() {
		const ciTasks = [];

		// Check for required README data
		await this.readme.assertHasLevel2Heading('Requirements');
		await this.readme.assertHasLink('#requirements');
		await this.readme.assertHasLink('docs/contributing.md');
		await this.readme.assertHasLink('https://nodejs.org/');

		// Require some key Node.js files
		await this.fs.assertFileExists('package.json', '{}');
		await this.fs.assertFileExists('package-lock.json', null, false);

		// Validate package.json
		await this.manifest.assertPropertyExists('name', null, false);
		await this.manifest.assertPropertyExists('version', '0.0.0');
		await this.manifest.assertPropertyExists('license', null, false);
		await this.manifest.assertPropertyMatches('author', 'Rowan Manning (https://rowanmanning.com/)');
		await this.manifest.assertPropertyExists(
			'engines.node',
			`>=${await this.minimumNodeVersion()}`
		);
		await this.manifest.assertPropertyExists(
			'engines.npm',
			`>=${await this.minimumNpmVersion()}`
		);

		// Validate main entry
		const main = await this.manifest.getProperty('main');
		if (main && !(await this.fs.fileExists(main))) {
			this.logIssue(`Property "main" in "package.json" does not point to an existing file`);
		} else if (main && main === 'index.js') {
			this.manifest.assertPropertyNotExists('main');
		}

		// Require some more ignore rules
		await this.gitignore.assertIncludes('npm-debug.log');
		await this.gitignore.assertIncludes('node_modules');

		// Dependabot config
		await this.fs.assertFileMatches('.github/dependabot.yml', dependabotConfigTemplate());
		await this.fs.assertDirectoryNotExists('.dependabot');

		// Disallowed dependencies
		await this.manifest.assertPropertyNotExists('devDependencies.@rowanmanning/make');
		await this.manifest.assertPropertyNotExists('devDependencies.istanbul');
		await this.manifest.assertPropertyNotExists('devDependencies.jest');
		await this.manifest.assertPropertyNotExists('devDependencies.jscs');
		await this.manifest.assertPropertyNotExists('devDependencies.jshint');
		await this.manifest.assertPropertyNotExists('devDependencies.mockery');
		await this.manifest.assertPropertyNotExists('devDependencies.proclaim');
		await this.manifest.assertPropertyNotExists('devDependencies.sinon');

		// ESLint config
		if (await this.manifest.hasProperty('devDependencies.eslint')) {
			ciTasks.push('verify');
			await this.manifest.assertPropertyExists('devDependencies.@rowanmanning/eslint-config', null, false);
			await this.fs.assertFileNotExists('.eslintrc.js');
			await this.fs.assertFileExists('.eslintrc.json', '{}');
			await this.fs.assertFileNotExists('.eslintignore');
			await this.eslintConfig.assertPropertyIncludes(
				'extends',
				'@rowanmanning/eslint-config'
			);
			await this.manifest.assertPropertyMatches('scripts.verify', 'eslint .');
		}

		// Mocha config
		if (await this.manifest.hasProperty('devDependencies.mocha')) {
			const expectedTestScripts = [];

			// Test Eslint config
			if (await this.manifest.hasProperty('devDependencies.eslint')) {
				await this.fs.assertFileNotExists('test/.eslintrc.js');
				await this.fs.assertFileExists('test/.eslintrc.json', '{}');
				await this.testEslintConfig.assertPropertyIncludes(
					'extends',
					'../.eslintrc.json'
				);
				await this.testEslintConfig.assertPropertyMatches('rules.max-len', 'off');
				await this.testEslintConfig.assertPropertyMatches('rules.max-statements', 'off');
			}

			// Unit tests
			if (await this.fs.directoryExists('test/unit')) {
				ciTasks.push('test:unit');

				await this.manifest.assertPropertyExists('devDependencies.chai', null, false);
				await this.manifest.assertPropertyExists('devDependencies.nyc', null, false);

				// Require testdouble if there are any dependencies
				if (Object.keys(await this.manifest.getProperty('dependencies') || {}).length) {
					await this.manifest.assertPropertyExists('devDependencies.testdouble', null, false);
				}

				await this.manifest.assertPropertyMatches(
					'scripts.test:unit',
					`mocha 'test/unit/**/*.test.js'`
				);
				await this.manifest.assertPropertyMatches(
					'scripts.test:coverage',
					'nyc npm run test:unit'
				);
				expectedTestScripts.push('npm run test:coverage');

				// Nyc config
				await this.manifest.assertPropertyMatches('nyc.eager', true);
				await this.manifest.assertPropertyMatches('nyc.reporter', [
					'html',
					'text'
				]);
				await this.gitignore.assertIncludes('.nyc_output');
				await this.gitignore.assertIncludes('coverage');
			}

			// Integration tests
			if (await this.fs.directoryExists('test/integration')) {
				ciTasks.push('test:integration');
				const integrationTestCommand = `mocha 'test/integration/**/*.test.js'`;
				if (await this.fs.fileExists('test/integration/fixtures/load.js')) {
					await this.manifest.assertPropertyMatches(
						'scripts.test:integration',
						`node test/integration/fixtures/load.js && ${integrationTestCommand}`
					);
				} else {
					await this.manifest.assertPropertyMatches(
						'scripts.test:integration',
						integrationTestCommand
					);
				}
				expectedTestScripts.push('npm run test:integration');
			}

			if (expectedTestScripts.length) {
				await this.manifest.assertPropertyMatches(
					'scripts.test',
					expectedTestScripts.join(' && ')
				);
			}

			// Mocha config
			await this.manifest.assertPropertyExists('mocha.timeout', 10000);

		}

		// MongoDB config
		const supportedMongoDbVersions = await this.supportedMongoDbVersions();
		if (supportedMongoDbVersions) {
			await this.readme.assertHasLink('https://www.mongodb.com/');
		}

		// GitHub Actions config
		await this.fs.assertFileNotExists('.github/workflows/ci.yml');
		if (ciTasks.length) {
			await this.fs.assertFileMatches('.github/workflows/verify-test.yml', verifyTest({
				maximumNodeVersion: await this.maximumNodeVersion(),
				supportedNodeVersions: await this.supportedNodeVersions(),
				supportedMongoDbVersions,
				tasks: ciTasks
			}));
		} else {
			await this.fs.assertFileNotExists('.github/workflows/verify-test.yml');
		}

		// Require a Node.js-based contributing guide
		await this.fs.assertFileMatches('docs/contributing.md', contributingNodeTemplate({
			includeLinting: ciTasks.includes('verify'),
			includeUnitTests: ciTasks.includes('test:unit'),
			includeIntegrationTests: ciTasks.includes('test:integration')
		}));

		// Add the validation script to `package.json`
		await this.manifest.assertPropertyMatches(
			'scripts.project:verify',
			this.runner.validateCommand
		);
		await this.manifest.assertPropertyMatches(
			'scripts.project:fix',
			this.runner.fixCommand
		);

	}

	async minimumNpmVersion() {
		return 7;
	}

	async minimumNodeVersion() {
		return semver.minVersion((await this.manifest.getProperty('engines.node')) || `>=16`).major;
	}

	async maximumNodeVersion() {
		return 16;
	}

	async supportedNodeVersions() {
		const versions = [];
		const minimumNodeVersion = await this.minimumNodeVersion();
		const maximumNodeVersion = await this.maximumNodeVersion();
		for (let version = minimumNodeVersion; version <= maximumNodeVersion; version += 2) {
			versions.push(version);
		}
		return versions;
	}

	availableMongoDbVersions() {
		return ['4.0.0', '5.0.0'];
	}

	async supportedMongoDbVersions() {
		const mongodbEngines = await this.manifest.getProperty('engines.mongodb');
		const availableMongoDbVersions = this.availableMongoDbVersions();
		if (mongodbEngines && semver.validRange(mongodbEngines)) {
			const versions = [];
			const minimumMongoVersion = semver.minVersion(mongodbEngines);
			const maximumMongoVersion = semver.maxSatisfying(
				availableMongoDbVersions,
				mongodbEngines
			);
			const minimumMongoVersionMajor = semver.major(minimumMongoVersion);
			const maximumMongoVersionMajor = semver.major(
				maximumMongoVersion || minimumMongoVersion
			);
			for (let version = minimumMongoVersionMajor; version <= maximumMongoVersionMajor; version += 1) {
				versions.push(version);
			}
			return versions;
		}
		return null;
	}

};
