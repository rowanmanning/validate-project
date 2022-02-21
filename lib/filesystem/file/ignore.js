'use strict';

const File = require('./base');

module.exports = class IgnoreFile extends File {

	transformAfterLoad(content) {
		return content.trim().split(/\n/);
	}

	transformBeforeSave(content) {
		return content.sort().join('\n');
	}

	get defaultContent() {
		return [];
	}

	async includesLine(line) {
		return Boolean((await this.content).includes(line));
	}

	async appendLine(line) {
		this.content = [
			...await this.content,
			line
		];
	}

	async assertIncludes(line, fix = null) {
		if (!(await this.includesLine(line))) {
			this.logIssue(
				`Line "${line}" must exist in "${this.filePath}"`,
				fix ?? (async () => {
					this.clearCache();
					await this.appendLine(line);
					await this.save();
					return `Added line "${line}" in "${this.filePath}"`;
				})
			);
		}
	}

};
