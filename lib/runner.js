'use strict';

const {name: libraryName, version: libraryVersion} = require('../package.json');
const path = require('path');
const semver = require('semver');

module.exports = class Runner {

	constructor({basePath, log}) {
		this.basePath = basePath;
		this.log = log;
		this.projectArchetypeNames = [];
		this.projectArchetypes = [];
		this.issues = [];
		this.fixes = [];
	}

	get majorVersion() {
		return semver.major(libraryVersion);
	}

	// Get the commands used to trigger the runner
	get validateCommand() {
		const archetypeNames = this.projectArchetypeNames.join(' ');
		return `npx --yes ${libraryName}@${this.majorVersion} --type ${archetypeNames}`;
	}

	get fixCommand() {
		return `${this.validateCommand} --fix`;
	}

	addProjectArchetype(name, ProjectArchetype) {
		this.projectArchetypeNames.push(name);
		this.projectArchetypes.push(new ProjectArchetype(this));
	}

	path(filePath) {
		return path.join(this.basePath, filePath);
	}

	logIssue(message, fix = false) {
		this.issues.push({
			message,
			fix
		});
		this.log.info(`  • Issue found: ${message}`);
	}

	logFix(message) {
		this.fixes.push({message});
	}

	async run(applyFixes = false) {
		this.issues = [];
		this.fixes = [];
		this.log.info('Checking for issues');
		for (const projectArchetype of this.projectArchetypes) {
			await projectArchetype.test();
		}
		if (applyFixes) {
			await this.fix();
		}
	}

	async fix() {
		const fixableIssues = this.issues.filter(issue => issue.fix);
		this.log.info('Applying fixes');
		if (!fixableIssues.length) {
			this.log.info('  ✔ No fixable issues');
		}
		for (const issue of fixableIssues) {
			try {
				this.log.info(`  • Fixing issue: ${issue.message}`);
				const result = await issue.fix();
				this.log.info(`    ✔ ${result}`);
				issue.fixed = true;
			} catch (error) {
				issue.fixed = false;
				issue.fixError = error;
				this.log.info(`    ✘ Failed: ${error.message}`);
			}
		}
	}

};
