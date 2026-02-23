# Contributing to next-controllers

Thank you for your interest in contributing to next-controllers! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/next-controllers.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Install dependencies: `npm install`

## Development

### Building

```bash
npm run build
```

This will compile TypeScript to JavaScript and generate type declarations in the `dist/` folder.

### Development Mode

```bash
npm run dev
```

This will watch for file changes and rebuild automatically.

### Type Checking

```bash
npm run type-check
```

## Project Structure

```
src/
  core/          # Core routing and loading logic
  decorators/    # Decorator implementations
  auth/          # Authentication utilities
  types/         # TypeScript type definitions
  utils/         # Utility functions
examples/        # Example controllers and usage
```

## Code Style

- Use TypeScript for all code
- Follow existing code style and formatting
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused

## Making Changes

1. Make your changes in your feature branch
2. Add or update tests if applicable
3. Ensure all tests pass
4. Update documentation if you've changed APIs
5. Commit your changes with clear commit messages

### Commit Messages

Follow conventional commits:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Test additions or updates
- `chore:` - Maintenance tasks

Examples:
```
feat: add support for WebSocket decorators
fix: resolve parameter ordering issue in Body decorator
docs: update authentication examples in README
```

## Testing

Before submitting a pull request:

1. Ensure your code builds without errors
2. Test your changes with the examples
3. Verify TypeScript types are correct
4. Check that your changes work with Next.js 13+ and 14+

## Submitting a Pull Request

1. Push your changes to your fork
2. Create a pull request against the `main` branch
3. Fill out the pull request template
4. Wait for review and address any feedback

### Pull Request Guidelines

- Keep PRs focused on a single feature or fix
- Include a clear description of the changes
- Reference any related issues
- Update documentation as needed
- Ensure all checks pass

## Feature Requests

Have an idea for a new feature? We'd love to hear it!

1. Check if the feature has already been requested
2. Open a new issue with the "feature request" label
3. Describe the feature and its use case
4. Discuss implementation details if applicable

## Bug Reports

Found a bug? Help us fix it!

1. Check if the bug has already been reported
2. Open a new issue with the "bug" label
3. Include:
   - Clear description of the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Your environment (Node version, Next.js version, etc.)
   - Code samples if applicable

## Documentation

Documentation improvements are always welcome!

- Fix typos or unclear wording
- Add examples
- Improve API documentation
- Write tutorials or guides

## Questions?

If you have questions about contributing:

- Open a discussion on GitHub
- Check existing issues and discussions
- Reach out to the maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Code of Conduct

Be respectful and considerate of others. We want this to be a welcoming community for everyone.
