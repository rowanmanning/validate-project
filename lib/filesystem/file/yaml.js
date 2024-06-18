'use strict';

const JsonFile = require('./json');
const YAML = require('yaml');

module.exports = class YamlFile extends JsonFile {
	transformAfterLoad(content) {
		return YAML.parse(content);
	}

	transformBeforeSave(content) {
		return YAML.stringify(content);
	}
};
