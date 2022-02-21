'use strict';

const BaseProject = require('./base');
const dependabotConfigTemplate = require('../template/dependabot-config');
const semver = require('semver');
const verifyTest = require('../template/workflows/verify-test');
const npmPublish = require('../template/workflows/npm-publish');

module.exports = class NodeProject extends BaseProject {

	constructor(basePath, log) {
		super(basePath, log);
		this.manifest = this.fs.loadAsJson('package.json');
		this.eslintConfig = this.fs.loadAsJson('.eslintrc.json');
		this.testEslintConfig = this.fs.loadAsJson('test/.eslintrc.json');
		this.gitignore = this.fs.loadAsIgnoreFile('.gitignore');
		this.npmignore = this.fs.loadAsIgnoreFile('.npmignore');
	}

	async test() {
		const ciTasks = [];

		// Require some key Node.js files
		await this.fs.assertFileExists('package.json', '{}');
		await this.fs.assertFileExists('package-lock.json', null, false);
		await this.fs.assertFileExists('.npmignore', '');

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
		await this.npmignore.assertIncludes('.eslintrc.json');
		await this.npmignore.assertIncludes('.github');
		await this.npmignore.assertIncludes('test');

		// Dependabot config
		await this.fs.assertFileMatches('.github/dependabot.yml', dependabotConfigTemplate());
		await this.fs.assertDirectoryNotExists('.dependabot');

		// Disallowed dependencies
		await this.manifest.assertPropertyNotExists('devDependencies.@rowanmanning/make');
		await this.manifest.assertPropertyNotExists('devDependencies.jest');
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
				await this.manifest.assertPropertyMatches('nyc.reporter', [
					'html',
					'text'
				]);
				await this.gitignore.assertIncludes('.nyc_output');
				await this.npmignore.assertIncludes('.nyc_output');
				await this.gitignore.assertIncludes('coverage');
				await this.npmignore.assertIncludes('coverage');
			}

			// Integration tests
			if (await this.fs.directoryExists('test/integration')) {
				ciTasks.push('test:integration');
				await this.manifest.assertPropertyMatches(
					'scripts.test:integration',
					`mocha 'test/integration/**/*.test.js'`
				);
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

		// GitHub Actions config
		await this.fs.assertFileNotExists('.github/workflows/ci.yml');
		if (ciTasks.length) {
			await this.fs.assertFileMatches('.github/workflows/verify-test.yml', verifyTest({
				maximumNodeVersion: await this.maximumNodeVersion(),
				supportedNodeVersions: await this.supportedNodeVersions(),
				tasks: ciTasks
			}));
		} else {
			await this.fs.assertFileNotExists('.github/workflows/verify-test.yml');
		}
		if (!(await this.manifest.getProperty('private'))) {
			await this.fs.assertFileMatches('.github/workflows/npm-publish.yml', npmPublish({
				maximumNodeVersion: await this.maximumNodeVersion()
			}));
		}
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

};
