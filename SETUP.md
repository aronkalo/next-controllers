# Setup Guide for next-controllers

This guide will help you set up and publish the next-controllers package to npm.

## Prerequisites

- Node.js 18 or higher
- npm account (create one at https://www.npmjs.com)
- Git repository (GitHub, GitLab, etc.)

## Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/aronkalo/next-controllers.git
cd next-controllers
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build the Package

```bash
npm run build
```

This will:
- Compile TypeScript to JavaScript
- Generate type declarations (`.d.ts` files)
- Output everything to the `dist/` directory

### 4. Test Locally

You can test the package locally before publishing:

```bash
# In the next-controllers directory
npm link

# In your Next.js project
npm link next-controllers
```

Or use `npm pack` to create a tarball:

```bash
npm pack
# This creates next-controllers-1.0.0.tgz

# In your Next.js project
npm install /path/to/next-controllers-1.0.0.tgz
```

## Publishing to npm

### 1. Login to npm

```bash
npm login
```

Enter your npm credentials.

### 2. Verify Package Contents

Check what will be included in the package:

```bash
npm pack --dry-run
```

This shows all files that will be published.

### 3. Update Version (if needed)

Follow semantic versioning:

```bash
# For bug fixes
npm version patch  # 1.0.0 -> 1.0.1

# For new features (backward compatible)
npm version minor  # 1.0.0 -> 1.1.0

# For breaking changes
npm version major  # 1.0.0 -> 2.0.0
```

### 4. Publish to npm

```bash
npm publish
```

For the first release, you might need to use:

```bash
npm publish --access public
```

### 5. Verify Publication

Check that your package is live:

```bash
npm info next-controllers
```

Or visit: https://www.npmjs.com/package/next-controllers

## Post-Publication

### Tag the Release

```bash
git tag v1.0.0
git push origin v1.0.0
```

### Create GitHub Release

Go to your repository on GitHub and create a release:
- Use the tag you just created
- Add release notes from CHANGELOG.md
- Attach any relevant files

### Update Documentation

Make sure your README and documentation are up to date:
- Installation instructions
- Usage examples
- API reference
- Migration guides (for updates)

## Continuous Integration

Consider setting up CI/CD for automated:
- Testing
- Building
- Publishing
- Documentation updates

Example GitHub Actions workflow:

```yaml
name: Publish Package

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          registry-url: 'https://registry.npmjs.org'
      - run: npm install
      - run: npm run build
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Troubleshooting

### Package Name Conflict

If the package name is taken:
- Choose a different name
- Use a scoped package: `@yourusername/next-controllers`

Update `package.json`:
```json
{
  "name": "@yourusername/next-controllers"
}
```

### Build Errors

Make sure TypeScript is configured correctly:
```bash
npm run type-check
```

### Publishing Fails

- Verify you're logged in: `npm whoami`
- Check package.json for errors
- Ensure version number is unique
- Check npm status: https://status.npmjs.org

## Package Maintenance

### Regular Updates

- Keep dependencies up to date
- Test with new Next.js versions
- Address security vulnerabilities
- Respond to issues and PRs

### Deprecation

If you need to deprecate a version:

```bash
npm deprecate next-controllers@1.0.0 "Please upgrade to 1.1.0"
```

### Unpublishing

Within 72 hours of publication:

```bash
npm unpublish next-controllers@1.0.0
```

After 72 hours, you can only deprecate, not unpublish.

## Getting Help

- npm documentation: https://docs.npmjs.com
- npm support: https://www.npmjs.com/support
- Next.js documentation: https://nextjs.org/docs

## Checklist Before Publishing

- [ ] All tests pass
- [ ] Documentation is complete and accurate
- [ ] CHANGELOG.md is updated
- [ ] Version number is correct in package.json
- [ ] Build completes without errors
- [ ] Examples work correctly
- [ ] README has correct installation instructions
- [ ] LICENSE file is present
- [ ] .npmignore excludes unnecessary files
- [ ] Git repository is up to date
- [ ] You've tested the package locally

Good luck with your package! 🚀
