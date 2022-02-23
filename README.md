
# Validate Project

This is just a tool to validate my coding projects. It forces me to be consistent in the way my repos are organised. It's probably not worth trying to use it.

## Table of Contents

  * [Requirements](#requirements)
  * [Usage](#usage)
  * [Contributing](#contributing)
  * [License](#license)


## Requirements

This library requires the following to run:

  * [Node.js](https://nodejs.org/) 16+


## Usage

Install with [npm](https://www.npmjs.com/):

```sh
npm install -g @rowanmanning/validate-project
```

Alternatively use the `npx` command bundled with npm. The rest of the examples assume you're doing this.

Basics:

```bash
npx @rowanmanning/validate-project
```

Validate a general Git repo:

```bash
npx @rowanmanning/validate-project --type git
```

Validate a general Git repo + Node.js project:

```bash
npx @rowanmanning/validate-project --type git node
```

Validate a general Git repo + Node.js project, and then auto-fix issues:

```bash
npx @rowanmanning/validate-project --type git node --fix
```

### Types

The valid types are:

  - `git`: the basics for a Git-based project
  - `node`: the basics for a Node.js-based project
  - `node-library`: a Node.js project published to npm


## Contributing

Genuinely unless you're Rowan Manning, you probably don't need to contribute to this. However if you decide you really need to, then [the contributing guide is available here](docs/contributing.md). All contributors must follow [this library's code of conduct](docs/code_of_conduct.md).


## License

Licensed under the [MIT](LICENSE) license.<br/>
Copyright &copy; 2022, Rowan Manning
