'use strict';

const File = require('./base');
const { JSDOM } = require('jsdom');
const { marked } = require('marked');

module.exports = class MarkdownFile extends File {
	constructor(filePath, runner) {
		super(filePath, runner);
		this._caches = {};
	}

	get html() {
		if (!this._caches.html) {
			this._caches.html = this.content.then((content) => marked.parse(content));
		}
		return this._caches.html;
	}

	get dom() {
		if (!this._caches.dom) {
			this._caches.dom = this.html.then((html) => new JSDOM(html));
		}
		return this._caches.dom;
	}

	get document() {
		if (!this._caches.document) {
			this._caches.document = this.dom.then((dom) => dom.window.document);
		}
		return this._caches.document;
	}

	clearCache() {
		this._caches = {};
	}

	async hasHeading(level, headingText) {
		const headings = [...(await this.document).querySelectorAll(`h${level}`)];
		return headings.find((heading) => heading.textContent === headingText);
	}

	async hasLevel2Heading(headingText) {
		return this.hasHeading(2, headingText);
	}

	async assertHasLevel2Heading(headingText) {
		if (!(await this.hasLevel2Heading(headingText))) {
			this.logIssue(`Level 2 heading "${headingText}" must exist in "${this.filePath}"`);
		}
	}

	async hasLink(href) {
		return Boolean((await this.document).querySelector(`a[href="${href}"]`));
	}

	async assertHasLink(href) {
		if (!(await this.hasLink(href))) {
			this.logIssue(`Link to "${href}" must exist in "${this.filePath}"`);
		}
	}
};
