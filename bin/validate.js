#!/usr/bin/env node
'use strict';

const NodeProject = require('../lib/project/node');
const GitProject = require('../lib/project/git');
const Runner = require('../lib/runner');

const runner = new Runner({
	basePath: process.cwd(),
	log: console
});

runner.addProjectArchetype(GitProject);
runner.addProjectArchetype(NodeProject);

runner.run(process.argv.includes('--fix'));
