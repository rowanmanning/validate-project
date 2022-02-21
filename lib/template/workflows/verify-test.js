'use strict';

const verifyBlock = ({tasks, maximumNodeVersion}) => `
  # Verify code
  verify:
    name: Verify code
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '${maximumNodeVersion}'
          cache: 'npm'
      - run: npm install
      - run: npm run verify
`;

const testUnitBlock = ({tasks, supportedNodeVersions}) => `
  # Run unit tests
  test-unit:
    name: Run unit tests${tasks.includes('verify') ? `
    needs: verify` : ''}
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node: [${supportedNodeVersions.map(version => `'${version}'`).join(', ')}]
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: \${{ matrix.node }}
          cache: 'npm'
      - run: npm install
      - run: npm run test:coverage
`;

const testIntegrationBlock = ({tasks, maximumNodeVersion}) => `
  # Run integration tests
  test-integration:
    name: Run integration tests${tasks.includes('verify') ? `
    needs: verify` : ''}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '${maximumNodeVersion}'
          cache: 'npm'
      - run: npm install
      - run: npm run test:integration
`;

module.exports = ({
	maximumNodeVersion,
	supportedNodeVersions,
	tasks
}) => `name: Verify and Test
on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main
env:
  NODE_ENV: test
jobs:
${tasks.map(task => {
		switch (task) {
			case 'verify':
				return verifyBlock({
					tasks,
					maximumNodeVersion
				});
			case 'test:unit':
				return testUnitBlock({
					tasks,
					supportedNodeVersions
				});
			case 'test:integration':
				return testIntegrationBlock({
					tasks,
					maximumNodeVersion
				});
			default:
				return '';
		}
	}).filter(task => task).join('')}`;