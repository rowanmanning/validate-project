#!/usr/bin/env node
'use strict';

const GitProject = require('../lib/project/git');
const manifest = require('../package.json');
const NodeProject = require('../lib/project/node');
const {program} = require('commander');
const Runner = require('../lib/runner');

program
	.version(manifest.version)
	.description('Validate a project')
	.option(
		'-f, --fix',
		'whether to automatically fix issues',
		false
	)
	.option(
		'-t, --type <types...>',
		'project types to validate against'
	)
	.action(async ({fix, type}) => {

		if (!Array.isArray(type)) {
			return program.help();
		}

		// Create a test runner
		const runner = new Runner({
			basePath: process.cwd(),
			log: console
		});

		// Add project archetypes
		if (type.includes('git')) {
			runner.log.info('Adding git project archetype');
			runner.addProjectArchetype(GitProject);
		}
		if (type.includes('node')) {
			runner.log.info('Adding node project archetype');
			runner.addProjectArchetype(NodeProject);
		}

		// Run
		runner.run(fix);

	})
	.parseAsync(process.argv);
