# Changelog

All notable changes to MouseBridge will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup with Tauri + React
- Cross-platform mouse sharing functionality
- WebRTC-based secure communication
- Server and client modes
- Modern React UI with Tailwind CSS
- Configuration management system
- Platform-specific input handling
- Security fingerprint verification

### Changed
- N/A

### Deprecated
- N/A

### Removed
- N/A

### Fixed
- N/A

### Security
- End-to-end encryption using WebRTC DTLS
- Security fingerprint verification for connections
- Trusted device management

## [0.1.0] - 2024-01-01

### Added
- Initial release of MouseBridge
- Basic mouse sharing between macOS and Windows
- WebRTC communication protocol
- Simple GUI for server/client configuration
- Cross-platform compatibility layer

---

## Version History

- **0.1.0** - Initial release with basic functionality
- **Unreleased** - Development version with enhanced features

## Release Notes

### Version 0.1.0
This is the initial release of MouseBridge, providing basic mouse sharing functionality between macOS and Windows systems. The application uses WebRTC for secure, low-latency communication and includes a simple GUI for configuration.

**Key Features:**
- Server mode for sharing mouse input
- Client mode for receiving mouse input
- WebRTC-based secure communication
- Cross-platform compatibility
- Simple configuration interface

**Known Limitations:**
- Limited to mouse input (no keyboard support yet)
- Basic screen layout options
- Manual connection setup required
- No automatic discovery of devices

**Future Plans:**
- Keyboard support
- Automatic device discovery
- Advanced screen layout configuration
- Mobile device support
- Plugin system for extensions 