#!/usr/bin/env node
'use strict';

const GitProject = require('../lib/project/git');
const manifest = require('../package.json');
const NodeProject = require('../lib/project/node');
const {program} = require('commander');
const Runner = require('../lib/runner');
const NodeLibraryProject = require('../lib/project/node-library');
const NodeExpressAppProject = require('../lib/project/node-express-app');

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
			runner.addProjectArchetype('git', GitProject);
		}
		if (type.includes('node-library')) {
			runner.log.info('Adding node library project archetype');
			runner.addProjectArchetype('node-library', NodeLibraryProject);
		} else if (type.includes('node-express-app')) {
			runner.log.info('Adding node express app project archetype');
			runner.addProjectArchetype('node-express-app', NodeExpressAppProject);
		} else if (type.includes('node')) {
			runner.log.info('Adding node project archetype');
			runner.addProjectArchetype('node', NodeProject);
		}

		// Run
		runner.run(fix);

	})
	.parseAsync(process.argv);
