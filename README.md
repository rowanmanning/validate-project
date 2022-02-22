
# Validate Project

This is just a tool to validate my coding projects. It forces me to be consistent in the way my repos are organised. It's probably not worth trying to use it.

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

## Types

The valid types are:

  - `git`: the basics for a Git-based project
  - `node`: the basics for a Node.js-based project
  - `node-library`: a Node.js project published to npm


## License

Licensed under the [MIT](LICENSE) license.<br/>
Copyright &copy; 2022, Rowan Manning
