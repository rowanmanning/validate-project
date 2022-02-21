'use strict';

const FileSystem = require('../filesystem/base');

module.exports = class BaseProject {

	constructor(runner) {
		this.runner = runner;
		this.log = this.runner.log;
		this.logIssue = this.runner.logIssue.bind(this.runner);
		this.fs = new FileSystem(this.runner);
	}

	async test() {
		this.log.error('Expected `test()` to be extended');
	}

};
