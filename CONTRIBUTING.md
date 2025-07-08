# Contributing to React Native Background Task Manager

Thank you for your interest in contributing! This guide will help you get started with contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Documentation](#documentation)
- [Submitting Changes](#submitting-changes)
- [Release Process](#release-process)

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. We expect all contributors to:

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the project's goals
- Help maintain a positive community

## Getting Started

### Prerequisites

- Node.js 16 or higher
- React Native development environment
- Android SDK and tools
- Git

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/YOUR_USERNAME/react-native-background-task-manager.git
cd react-native-background-task-manager
```

3. Add the upstream remote:

```bash
git remote add upstream https://github.com/ORIGINAL_OWNER/react-native-background-task-manager.git
```

## Development Setup

### Install Dependencies

```bash
# Install root dependencies
npm install

# Install example app dependencies
cd example
npm install
cd ..
```

### Build the Library

```bash
# Build TypeScript and generate types
npm run prepare

# Run TypeScript compiler
npm run typescript

# Run linting
npm run lint

# Run tests
npm test
```

### Running Examples

```bash
# Start Metro bundler
npm start

# Run Android example (in another terminal)
npx react-native run-android

# Run with specific device
npx react-native run-android --deviceId YOUR_DEVICE_ID
```

## Making Changes

### Branch Naming

Use descriptive branch names:

- `feature/add-new-service-type` - New features
- `fix/permission-request-issue` - Bug fixes
- `docs/update-api-reference` - Documentation updates
- `refactor/improve-task-manager` - Code refactoring
- `test/add-service-tests` - Test additions

### Code Style

We use ESLint and Prettier for code formatting:

```bash
# Check formatting
npm run format:check

# Fix formatting
npm run format

# Check linting
npm run lint

# Fix linting issues
npm run lint:fix
```

### Commit Messages

Follow conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Build process or tool changes

Examples:
```
feat(service): add support for Android 15 service types

fix(permissions): resolve notification permission request on Android 13+

docs(api): update service configuration examples

test(task-manager): add comprehensive task scheduling tests
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- ForegroundService.test.ts
```

### Writing Tests

- Place tests in `__tests__/` directory
- Use descriptive test names
- Test both success and error cases
- Mock external dependencies

Example test structure:

```typescript
describe('ForegroundService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('startService', () => {
    it('should start service with valid options', async () => {
      // Test implementation
    });

    it('should throw error for invalid options', async () => {
      // Test implementation
    });
  });
});
```

### Testing on Device

```bash
# Check if service is running
adb shell dumpsys activity services | grep ForegroundService

# View logs
adb logcat | grep ReactNative

# Install and test APK
cd example/android
./gradlew assembleDebug
adb install app/build/outputs/apk/debug/app-debug.apk
```

## Documentation

### API Documentation

- Update `docs/API.md` for API changes
- Include code examples
- Document breaking changes
- Update TypeScript definitions

### README Updates

- Keep README.md concise and focused
- Update installation instructions if needed
- Add new features to feature list
- Update compatibility information

### Code Comments

- Use JSDoc for public methods
- Explain complex logic
- Document Android-specific behavior
- Include usage examples

Example:

```typescript
/**
 * Starts a foreground service with the specified configuration.
 * 
 * @param options - Service configuration options
 * @returns Promise that resolves when service starts
 * @throws Error if service fails to start or permissions are missing
 * 
 * @example
 * ```typescript
 * await ForegroundService.startService({
 *   taskName: 'DataSync',
 *   taskTitle: 'Syncing Data',
 *   taskDesc: 'Synchronizing with server...',
 *   serviceType: 'dataSync'
 * });
 * ```
 */
async startService(options: ForegroundServiceOptions): Promise<void>
```

## Submitting Changes

### Pre-submission Checklist

- [ ] Code follows project style guidelines
- [ ] Tests pass locally
- [ ] Documentation is updated
- [ ] Changes are backwards compatible (or breaking changes are documented)
- [ ] Commit messages follow conventional format
- [ ] Branch is up to date with main

### Pull Request Process

1. **Update your branch**:
```bash
git fetch upstream
git rebase upstream/main
```

2. **Create pull request**:
- Use descriptive title
- Fill out PR template
- Link related issues
- Add screenshots for UI changes

3. **PR Template**:
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass
- [ ] Manual testing completed
- [ ] Tested on device

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### Review Process

- Maintainers will review your PR
- Address feedback promptly
- Keep discussions focused and respectful
- Be open to suggestions and changes

## Release Process

### Version Management

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (0.1.0): New features, backwards compatible
- **PATCH** (0.0.1): Bug fixes, backwards compatible

### Release Steps

1. **Update version**:
```bash
npm version patch|minor|major
```

2. **Update CHANGELOG.md**:
- Add release notes
- Document breaking changes
- List new features and fixes

3. **Create release**:
```bash
git tag v1.0.0
git push origin v1.0.0
npm publish
```

### Pre-release Testing

Before major releases:

- Test on multiple Android versions
- Verify compatibility with latest React Native
- Run full test suite
- Test example applications
- Review documentation

## Platform-Specific Guidelines

### Android Development

- Follow Android development best practices
- Handle different API levels gracefully
- Test on various device manufacturers
- Consider battery optimization differences
- Respect Android's background execution limits

### Java/Kotlin Code

- Use meaningful variable names
- Add proper error handling
- Follow Android naming conventions
- Include JavaDoc comments
- Handle lifecycle events properly

### TypeScript/JavaScript

- Use strict TypeScript settings
- Provide comprehensive type definitions
- Handle platform differences
- Use async/await for promises
- Include proper error handling

## Getting Help

### Resources

- [React Native Documentation](https://reactnative.dev/)
- [Android Developer Guide](https://developer.android.com/)
- [Project Issues](https://github.com/paulkiren/react-native-background-task-manager/issues)
- [Discussions](https://github.com/paulkiren/react-native-background-task-manager/discussions)

### Communication

- GitHub Issues for bugs and feature requests
- GitHub Discussions for questions and ideas
- Pull Request comments for code-specific discussions

### Mentorship

New contributors are welcome! If you need help:

- Ask questions in GitHub Discussions
- Mention maintainers in issues
- Start with "good first issue" labels
- Review existing code and tests

## Recognition

Contributors will be:

- Added to AUTHORS file
- Mentioned in release notes
- Recognized in project documentation
- Invited to become maintainers (for significant contributions)

Thank you for contributing to React Native Background Task Manager! 🚀
