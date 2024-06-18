'use strict';

const contributing = require('./contributing');

module.exports = ({
	includeLinting,
	includeTypeScript,
	includeUnitTests,
	includeIntegrationTests
}) =>
	contributing(
		[
			`
### Committing

Commit messages must be written using [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/). This is how our [release system](https://github.com/googleapis/release-please#readme) knows what a given commit means.

\`\`\`
<type>: <description>

[body]
\`\`\`

The \`type\` can be any of \`feat\`, \`fix\`, \`docs\` or \`chore\`.

The prefix is used to calculate the [Semantic Versioning](https://semver.org/) release:

| **type**  | when to use                                            | release level |
| --------- | ------------------------------------------------------ | ------------- |
| feat      | a feature has been added                               | \`minor\`       |
| fix       | a bug has been patched                                 | \`patch\`       |
| docs      | a change to documentation                              | \`patch\`       |
| chore     | repo maintenance and support tasks                     | none          |

Indicate a breaking change by placing an \`!\` between the type name and the colon, e.g.

\`\`\`
feat!: add a breaking feature
\`\`\`

We use [commitlint](https://commitlint.js.org/) to enforce these commit messages.`,
			includeLinting
				? `
### Linting

This project is linted using [ESLint](https://eslint.org/), configured in the way I normally write JavaScript. Please keep to the existing style.

ESLint errors will fail the build on any PRs. Most editors have an ESLint plugin which will pick up errors, but you can also run the linter manually with the following command:

\`\`\`
npm run verify:eslint
\`\`\``
				: '',
			includeTypeScript
				? `
### TypeScript

Although this project is written in JavaScript, it is checked with [TypeScript](https://www.typescriptlang.org/) to ensure type-safety. We also document all types with JSDoc so you should get type hints if your editor supports these.

Type errors will fail the build on any PRs. Most editors have a TypeScript plugin which will pick up errors, but you can also check types manually with the following command:

\`\`\`
npm run verify:types
\`\`\``
				: '',
			includeUnitTests
				? `
### Unit tests

This project has unit tests with good coverage, and failing unit tests will fail the build on any PRs. If you add or remove features, please update the tests to match.

You can run tests manually with the following command:

\`\`\`
npm run test:unit
\`\`\``
				: '',
			includeIntegrationTests
				? `
### Integration tests

This project has end to end integration tests, and these tests can fail the build on PRs. If you add or remove features, please update the tests to match.

You can run integration tests manually with the following command:

\`\`\`
npm run test:integration
\`\`\``
				: ''
		]
			.filter((section) => section)
			.join('\n')
	);
