# MouseBridge Project Structure

This document provides an overview of the MouseBridge project structure and organization.

## Directory Structure

```
MouseBridge/
├── .gitignore                 # Git ignore rules
├── README.md                  # Main project documentation
├── LICENSE                    # MIT License
├── BUILDING.md               # Build instructions
├── CONTRIBUTING.md           # Contribution guidelines
├── CHANGELOG.md              # Version history
├── PROJECT_STRUCTURE.md      # This file
├── package.json              # Node.js dependencies and scripts
├── vite.config.ts            # Vite configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── postcss.config.js         # PostCSS configuration
├── tsconfig.json             # TypeScript configuration
├── tsconfig.node.json        # TypeScript Node.js configuration
├── index.html                # Main HTML file
├── src/                      # Frontend source code
│   ├── main.tsx             # React entry point
│   ├── App.tsx              # Main application component
│   ├── index.css            # Global styles
│   └── components/          # React components
│       ├── ServerMode.tsx   # Server mode interface
│       ├── ClientMode.tsx   # Client mode interface
│       └── SettingsPanel.tsx # Settings interface
└── src-tauri/               # Rust backend (Tauri)
    ├── Cargo.toml           # Rust dependencies
    ├── tauri.conf.json      # Tauri configuration
    ├── build.rs             # Build script
    ├── icons/               # Application icons
    │   ├── icon.icns        # macOS icon
    │   ├── icon.ico         # Windows icon
    │   ├── 32x32.png        # Small icon
    │   ├── 128x128.png      # Medium icon
    │   └── 128x128@2x.png   # High-DPI icon
    └── src/                 # Rust source code
        ├── main.rs          # Application entry point
        ├── lib.rs           # Library exports and Tauri commands
        ├── bridge.rs        # Main bridge service
        ├── config.rs        # Configuration management
        ├── input.rs         # Cross-platform input handling
        ├── network.rs       # Network communication
        ├── platform.rs      # Platform-specific code
        └── service.rs       # Application service layer
```

## Architecture Overview

### Frontend (React + TypeScript)

The frontend is built with React and TypeScript, using:
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Tauri API** for native functionality

#### Key Components

- **App.tsx**: Main application with navigation and state management
- **ServerMode.tsx**: Interface for running the server
- **ClientMode.tsx**: Interface for connecting to a server
- **SettingsPanel.tsx**: Configuration and system information

### Backend (Rust + Tauri)

The backend is built with Rust using Tauri framework:

#### Core Modules

- **bridge.rs**: Main service that coordinates server/client modes
- **config.rs**: Configuration management with JSON persistence
- **input.rs**: Cross-platform mouse input capture and emulation
- **network.rs**: WebRTC-based network communication
- **platform.rs**: Platform-specific abstractions
- **service.rs**: High-level application service layer

#### Key Features

- **Cross-platform compatibility**: macOS, Windows, and Linux support
- **Secure communication**: WebRTC with DTLS encryption
- **Real-time performance**: Low-latency mouse sharing
- **Configuration persistence**: JSON-based settings storage
- **Modern UI**: React-based interface with Tailwind CSS

## Technology Stack

### Frontend
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

### Backend
- **Rust**: Systems programming language
- **Tauri**: Desktop application framework
- **Tokio**: Async runtime
- **WebRTC**: Real-time communication
- **Serde**: Serialization framework

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Cargo**: Rust package manager
- **npm**: Node.js package manager

## Build System

### Development
```bash
cargo tauri dev
```

### Production
```bash
cargo tauri build
```

### Cross-platform
```bash
# macOS
cargo tauri build --target aarch64-apple-darwin
cargo tauri build --target x86_64-apple-darwin

# Windows
cargo tauri build --target x86_64-pc-windows-msvc

# Linux
cargo tauri build --target x86_64-unknown-linux-gnu
```

## Configuration

### Application Configuration
- Stored in platform-specific config directories
- JSON format with schema validation
- Automatic migration between versions
- User-editable settings

### Build Configuration
- **tauri.conf.json**: Tauri-specific settings
- **Cargo.toml**: Rust dependencies and metadata
- **package.json**: Node.js dependencies and scripts
- **vite.config.ts**: Frontend build configuration

## Security

### Network Security
- WebRTC DTLS encryption
- Security fingerprint verification
- Trusted device management
- Connection authorization

### Platform Security
- Sandboxed execution
- Minimal permissions required
- Secure configuration storage
- Input validation

## Performance

### Optimization Features
- Rust backend for performance
- WebRTC for low-latency communication
- Efficient input capture and emulation
- Minimal resource usage
- Optimized builds with LTO

### Monitoring
- Real-time connection status
- Latency measurement
- Error logging and reporting
- Performance metrics

## Testing

### Test Structure
- Unit tests for Rust modules
- Integration tests for Tauri commands
- Frontend component tests (planned)
- End-to-end tests (planned)

### Test Commands
```bash
# Rust tests
cargo test

# Frontend tests (when implemented)
npm test

# Integration tests
cargo tauri dev -- --test
```

## Deployment

### Distribution
- **macOS**: `.app` bundle and `.dmg` installer
- **Windows**: `.exe` executable and `.msi` installer
- **Linux**: Binary and `.AppImage` package

### Release Process
1. Version bump in all configuration files
2. Cross-platform builds
3. Code signing (macOS/Windows)
4. Notarization (macOS)
5. GitHub release creation

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines on:
- Code standards
- Testing requirements
- Pull request process
- Issue reporting
- Development setup

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details. 