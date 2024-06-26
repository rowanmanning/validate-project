'use strict';

module.exports = ({ hasBuildScript, stableNodeVersion, packageName }) => `name: Create releases and publish to npm
on:
  push:
    branches:
      - main
jobs:
  release-please:
    runs-on: ubuntu-latest
    steps:

      # Create a release
      - uses: google-github-actions/release-please-action@v3
        id: release
        with:
          release-type: node
          package-name: '${packageName}'
          bump-minor-pre-major: true
          bump-patch-for-minor-pre-major: true
          changelog-types: '[{"type":"feat","section":"Features","hidden":false},{"type":"fix","section":"Bug Fixes","hidden":false},{"type":"docs","section":"Documentation Changes","hidden":false},{"type":"chore","section":"Miscellaneous","hidden":true}]'

      # Publish a release to npm if it was merged into main
      - uses: actions/checkout@v4
        if: \${{ steps.release.outputs.release_created }}
      - uses: actions/setup-node@v4
        with:
          node-version: '${stableNodeVersion}'
          registry-url: https://registry.npmjs.org
        if: \${{ steps.release.outputs.release_created }}
      - run: npm ci
        if: \${{ steps.release.outputs.release_created }}${
			hasBuildScript
				? `
      - run: npm run build
        if: \${{ steps.release.outputs.release_created }}`
				: ''
		}
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: \${{ secrets.NPM_AUTH_TOKEN }}
        if: \${{ steps.release.outputs.release_created }}
`;
