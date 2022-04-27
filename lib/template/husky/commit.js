'use strict';

module.exports = () => `#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx --no -- commitlint --edit ""
`;
