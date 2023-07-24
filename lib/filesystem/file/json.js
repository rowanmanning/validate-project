'use strict';

const File = require('./base');
const {isDeepStrictEqual} = require('node:util');

module.exports = class JsonFile extends File {

	constructor(filePath, runner) {
		super(filePath, runner);
		this.indentation = '\t';
	}

	transformAfterLoad(content) {
		const firstWhitespaceLine = content.split(/\n+/).find(line => /^\s+[^\s]/.test(line));
		this.indentation = firstWhitespaceLine.split(/[^\s]/)[0];
		return JSON.parse(content);
	}

	transformBeforeSave(content) {
		return JSON.stringify(content, null, this.indentation);
	}

	get defaultContent() {
		return {};
	}

	async hasProperty(property) {
		const {hasProperty} = await import('dot-prop');
		return hasProperty(await this.content, property);
	}

	async setProperty(property, value) {
		const {setProperty} = await import('dot-prop');
		return setProperty(await this.content, property, value);
	}

	async getProperty(property) {
		const {getProperty} = await import('dot-prop');
		return getProperty(await this.content, property);
	}

	async deleteProperty(property) {
		const {deleteProperty} = await import('dot-prop');
		return deleteProperty(await this.content, property);
	}

	async assertPropertyExists(property, template = '', fix = null) {
		if (!(await this.hasProperty(property))) {
			this.logIssue(
				`Property "${property}" must exist in "${this.filePath}"`,
				fix ?? (async () => {
					this.clearCache();
					await this.setProperty(property, template);
					await this.save();
					return `Created property "${property}" in "${this.filePath}"`;
				})
			);
		}
	}

	async assertPropertyMatches(property, template = '', fix = null) {
		await this.assertPropertyExists(property, template, fix);
		if (!isDeepStrictEqual(await this.getProperty(property), template)) {
			this.logIssue(
				`Property "${property}" in "${this.filePath}" must match ${JSON.stringify(template)}`,
				fix ?? (async () => {
					this.clearCache();
					await this.setProperty(property, template);
					await this.save();
					return `Updated property "${property}" in "${this.filePath}"`;
				})
			);
		}
	}

	async assertPropertyNotExists(property, fix = null) {
		if (await this.hasProperty(property)) {
			this.logIssue(
				`Property "${property}" must not exist in "${this.filePath}"`,
				fix ?? (async () => {
					this.clearCache();
					await this.deleteProperty(property);
					await this.save();
					return `Deleted property "${property}" in "${this.filePath}"`;
				})
			);
		}
	}

	async assertPropertyIncludes(property, search, fix = null) {
		const value = await this.getProperty(property);
		if (!Array.isArray(value) || !value.includes(search)) {
			this.logIssue(
				`Property "${property}" in "${this.filePath}" must include ${JSON.stringify(search)}`,
				fix ?? (async () => {
					this.clearCache();
					const val = await this.getProperty(property);
					if (val === search) {
						await this.setProperty(property, [val]);
					} else if (Array.isArray(val)) {
						await this.setProperty(property, [...val, search]);
					} else if (val) {
						await this.setProperty(property, [val, search]);
					} else {
						await this.setProperty(property, [search]);
					}
					await this.save();
					return `Updated property "${property}" in "${this.filePath}"`;
				})
			);
		}
	}

};
