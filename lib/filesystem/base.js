'use strict';

const deleteDirectory = require('../utils/delete-directory');
const deleteFile = require('../utils/delete-file');
const File = require('./file/base');
const IgnoreFile = require('./file/ignore');
const JsonFile = require('./file/json');
const listFiles = require('../utils/list-files');
const MarkdownFile = require('./file/markdown');
const readFile = require('../utils/read-file');
const touchDirectory = require('../utils/touch-directory');
const writeFile = require('../utils/write-file');
const YamlFile = require('./file/yaml');

module.exports = class FileSystem {

	constructor(runner) {
		this.runner = runner;
		this.log = this.runner.log;
		this.logIssue = this.runner.logIssue.bind(this.runner);
		this._caches = {};
	}

	get list() {
		if (!this._caches.list) {
			this._caches.list = listFiles(this.runner.basePath);
		}
		return this._caches.list;
	}

	get files() {
		if (!this._caches.files) {
			this._caches.files = this.list
				.then(files => files.filter(file => !file.endsWith('/')));
		}
		return this._caches.files;
	}

	get directories() {
		if (!this._caches.directories) {
			this._caches.directories = this.list
				.then(files => files
					.filter(file => file.endsWith('/'))
					.map(file => file.substring(0, file.length - 1))
				);
		}
		return this._caches.directories;
	}

	clearCache() {
		this._caches = {};
	}

	load(filePath) {
		return new File(filePath, this.runner);
	}

	loadAsJson(filePath) {
		return new JsonFile(filePath, this.runner);
	}

	loadAsYaml(filePath) {
		return new YamlFile(filePath, this.runner);
	}

	loadAsIgnoreFile(filePath) {
		return new IgnoreFile(filePath, this.runner);
	}

	loadAsMarkdown(filePath) {
		return new MarkdownFile(filePath, this.runner);
	}

	async fileExists(file) {
		return (await this.files).includes(file);
	}

	async directoryExists(directory) {
		return (await this.directories).includes(directory);
	}

	async assertFileExists(file, template = '', fix = null) {
		if (!await this.fileExists(file)) {
			this.logIssue(`File "${file}" must exist`, fix ?? (async () => {
				await writeFile(this.runner.path(file), template);
				return `Created file "${file}"`;
			}));
		}
	}

	async assertFileNotExists(file, fix = null) {
		if (await this.fileExists(file)) {
			this.logIssue(`File "${file}" must not exist`, fix ?? (async () => {
				await deleteFile(this.runner.path(file));
				return `Deleted file "${file}"`;
			}));
		}
	}

	async assertFileMatches(file, template, fix = null) {
		await this.assertFileExists(file, template);
		try {
			const content = await readFile(this.runner.path(file));
			if (content !== template) {
				this.logIssue(`File "${file}" must match template`, fix ?? (async () => {
					await writeFile(this.runner.path(file), template);
					return `Updated file "${file}" to match template`;
				}));
			}
		} catch (error) {}
	}

	async assertDirectoryExists(directory, fix = null) {
		if (!await this.directoryExists(directory)) {
			this.logIssue(`Directory "${directory}" must exist`, fix ?? (async () => {
				await touchDirectory(this.runner.path(directory));
				return `Created directory "${directory}"`;
			}));
		}
	}

	async assertDirectoryNotExists(directory, fix = null) {
		if (await this.directoryExists(directory)) {
			this.logIssue(`Directory "${directory}" must not exist`, fix ?? (async () => {
				await deleteDirectory(this.runner.path(directory));
				return `Deleted directory "${directory}"`;
			}));
		}
	}

};
