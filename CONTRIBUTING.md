# Contributing to MouseBridge

Thank you for your interest in contributing to MouseBridge! This document provides guidelines and information for contributors.

## Code of Conduct

This project is committed to providing a welcoming and inclusive environment for all contributors. Please be respectful and considerate in all interactions.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a feature branch** for your changes
4. **Make your changes** following the coding standards
5. **Test your changes** thoroughly
6. **Submit a pull request** with a clear description

## Development Setup

### Prerequisites
- Rust (latest stable)
- Node.js (v16 or later)
- Platform-specific build tools (see [BUILDING.md](BUILDING.md))

### Setup Steps
```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/MouseBridge.git
cd MouseBridge

# Install dependencies
cargo install tauri-cli
npm install

# Start development server
cargo tauri dev
```

## Coding Standards

### Rust
- Follow the [Rust Style Guide](https://doc.rust-lang.org/1.0.0/style/style/naming/README.html)
- Use `cargo fmt` to format code
- Use `cargo clippy` to check for common issues
- Write tests for new functionality
- Document public APIs with doc comments

### TypeScript/React
- Use TypeScript for type safety
- Follow ESLint rules
- Use Prettier for formatting
- Write functional components with hooks
- Use proper TypeScript interfaces

### General
- Write clear, descriptive commit messages
- Keep functions small and focused
- Add comments for complex logic
- Handle errors gracefully
- Consider cross-platform compatibility

## Testing

### Rust Tests
```bash
# Run all tests
cargo test

# Run tests with output
cargo test -- --nocapture

# Run specific test
cargo test test_name
```

### Frontend Tests
```bash
# Run tests (when implemented)
npm test

# Run tests in watch mode
npm test -- --watch
```

### Integration Tests
```bash
# Test the full application
cargo tauri dev -- --test
```

## Pull Request Guidelines

### Before Submitting
1. **Test thoroughly** on multiple platforms
2. **Update documentation** if needed
3. **Add tests** for new functionality
4. **Check for linting errors**
5. **Ensure builds pass** on all platforms

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested on macOS
- [ ] Tested on Windows
- [ ] Tested on Linux
- [ ] Added unit tests
- [ ] Added integration tests

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

## Issue Reporting

### Bug Reports
When reporting bugs, please include:
- **Platform and version** information
- **Steps to reproduce** the issue
- **Expected vs actual behavior**
- **Screenshots or logs** if applicable
- **Environment details** (OS, Rust version, etc.)

### Feature Requests
For feature requests, please include:
- **Clear description** of the feature
- **Use case** and motivation
- **Proposed implementation** (if you have ideas)
- **Alternative solutions** considered

## Areas for Contribution

### High Priority
- **Cross-platform compatibility** improvements
- **Performance optimizations**
- **Security enhancements**
- **User experience** improvements
- **Documentation** updates

### Medium Priority
- **Additional protocols** (UDP, TCP fallback)
- **Advanced configuration** options
- **Logging and debugging** tools
- **Automated testing** improvements

### Low Priority
- **UI/UX enhancements**
- **Additional input devices** support
- **Plugin system** for extensions
- **Mobile companion apps**

## Architecture Overview

### Backend (Rust)
- `src-tauri/src/bridge.rs` - Main bridge service
- `src-tauri/src/network.rs` - WebRTC communication
- `src-tauri/src/input.rs` - Cross-platform input handling
- `src-tauri/src/platform.rs` - Platform-specific code
- `src-tauri/src/config.rs` - Configuration management

### Frontend (React/TypeScript)
- `src/App.tsx` - Main application component
- `src/components/` - Reusable UI components
- `src/hooks/` - Custom React hooks
- `src/utils/` - Utility functions

## Communication

- **GitHub Issues** for bug reports and feature requests
- **GitHub Discussions** for general questions and ideas
- **Pull Requests** for code contributions
- **Releases** for announcements

## Release Process

1. **Version bump** in all relevant files
2. **Changelog update** with new features/fixes
3. **Cross-platform builds** and testing
4. **GitHub release** creation
5. **Distribution** of binaries

## License

By contributing to MouseBridge, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be recognized in:
- **README.md** contributors section
- **GitHub contributors** page
- **Release notes** for significant contributions

Thank you for contributing to MouseBridge! 🎉 