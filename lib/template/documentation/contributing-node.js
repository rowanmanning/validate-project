'use strict';

const contributing = require('./contributing');

module.exports = ({includeLinting, includeTypeScript, includeUnitTests, includeIntegrationTests}) => contributing([
	(includeLinting ? `
### Linting

This project is linted using [ESLint](https://eslint.org/), configured in the way I normally write JavaScript. Please keep to the existing style.

ESLint errors will fail the build on any PRs. Most editors have an ESLint plugin which will pick up errors, but you can also run the linter manually with the following command:

\`\`\`
npm run verify:eslint
\`\`\`` : ''),
	(includeTypeScript ? `
### TypeScript

Although this project is written in JavaScript, it is checked with [TypeScript](https://www.typescriptlang.org/) to ensure type-safety. We also document all types with JSDoc so you should get type hints if your editor supports these.

Type errors will fail the build on any PRs. Most editors have a TypeScript plugin which will pick up errors, but you can also check types manually with the following command:

\`\`\`
npm run verify:types
\`\`\`` : ''),
	(includeUnitTests ? `
### Unit tests

This project has unit tests with good coverage, and failing unit tests will fail the build on any PRs. If you add or remove features, please update the tests to match.

You can run tests manually with the following command:

\`\`\`
npm run test:unit
\`\`\`` : ''),
	(includeIntegrationTests ? `
### Integration tests

This project has end to end integration tests, and these tests can fail the build on PRs. If you add or remove features, please update the tests to match.

You can run integration tests manually with the following command:

\`\`\`
npm run test:integration
\`\`\`` : '')
].filter(section => section).join('\n'));
