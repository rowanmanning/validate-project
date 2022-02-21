'use strict';

const readFile = require('../../utils/read-file');
const writeFile = require('../../utils/write-file');

module.exports = class File {

	constructor(filePath, runner) {
		this.filePath = filePath;
		this.runner = runner;
		this.log = this.runner.log;
		this.logIssue = this.runner.logIssue.bind(this.runner);
		this._caches = {};
	}

	get content() {
		if (!this._caches.content) {
			this._caches.content = readFile(this.runner.path(this.filePath))
				.then(content => this.transformAfterLoad(content))
				.catch(() => this.defaultContent);
		}
		return this._caches.content;
	}

	set content(value) {
		this._caches.content = value;
	}

	get defaultContent() {
		return '';
	}

	clearCache() {
		this._caches = {};
	}

	transformAfterLoad(content) {
		return content;
	}

	transformBeforeSave(content) {
		return content;
	}

	async save() {
		const content = this.transformBeforeSave(await this.content);
		return writeFile(this.runner.path(this.filePath), content);
	}

};
