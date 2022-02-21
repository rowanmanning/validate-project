'use strict';

module.exports = () => `name: Sync repo labels
on: [issues, pull_request]
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: rowanmanning/github-labels@v1
        with:
          github-token: \${{ secrets.GITHUB_TOKEN }}
`;