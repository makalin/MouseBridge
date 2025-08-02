# Building MouseBridge

This document provides detailed instructions for building MouseBridge from source on macOS and Windows.

## Prerequisites

### macOS
- **Rust**: Install via [rustup](https://rustup.rs/)
- **Xcode Command Line Tools**: `xcode-select --install`
- **Node.js**: Version 16 or later
- **npm**: Usually comes with Node.js

### Windows
- **Rust**: Install via [rustup](https://rustup.rs/)
- **Visual Studio Build Tools**: Install with C++ workload
- **Node.js**: Version 16 or later
- **npm**: Usually comes with Node.js

### Linux
- **Rust**: Install via [rustup](https://rustup.rs/)
- **Build essentials**: `sudo apt-get install build-essential` (Ubuntu/Debian)
- **Node.js**: Version 16 or later
- **npm**: Usually comes with Node.js

## Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/makalin/MouseBridge.git
   cd MouseBridge
   ```

2. **Install Rust dependencies**:
   ```bash
   cargo install tauri-cli
   ```

3. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

## Development Build

To run MouseBridge in development mode:

```bash
cargo tauri dev
```

This will:
- Start the Vite development server
- Compile the Rust backend
- Open the application window
- Enable hot reloading for both frontend and backend changes

## Production Build

### macOS
```bash
cargo tauri build --target aarch64-apple-darwin  # Apple Silicon
cargo tauri build --target x86_64-apple-darwin   # Intel Mac
```

### Windows
```bash
cargo tauri build --target x86_64-pc-windows-msvc
```

### Linux
```bash
cargo tauri build --target x86_64-unknown-linux-gnu
```

## Build Outputs

After a successful build, you'll find the following files in `src-tauri/target/release/`:

### macOS
- `MouseBridge.app` - macOS application bundle
- `MouseBridge.dmg` - Disk image for distribution

### Windows
- `MouseBridge.exe` - Windows executable
- `MouseBridge.msi` - Windows installer

### Linux
- `MouseBridge` - Linux executable
- `MouseBridge.AppImage` - AppImage for distribution

## Cross-Platform Building

### Building for macOS from Linux/Windows
```bash
rustup target add aarch64-apple-darwin x86_64-apple-darwin
cargo tauri build --target aarch64-apple-darwin
cargo tauri build --target x86_64-apple-darwin
```

### Building for Windows from Linux/macOS
```bash
rustup target add x86_64-pc-windows-msvc
cargo tauri build --target x86_64-pc-windows-msvc
```

## Troubleshooting

### Common Issues

1. **Permission Denied (macOS)**:
   ```bash
   sudo xcode-select --reset
   ```

2. **Missing WebRTC dependencies**:
   ```bash
   # macOS
   brew install pkg-config
   
   # Ubuntu/Debian
   sudo apt-get install pkg-config
   ```

3. **Node.js version issues**:
   ```bash
   # Use nvm to manage Node.js versions
   nvm install 18
   nvm use 18
   ```

4. **Rust toolchain issues**:
   ```bash
   rustup update
   rustup default stable
   ```

### Platform-Specific Notes

#### macOS
- Requires Xcode Command Line Tools
- May need accessibility permissions for mouse control
- Supports both Intel and Apple Silicon architectures

#### Windows
- Requires Visual Studio Build Tools with C++ workload
- May need to run as administrator for mouse control
- Supports x86_64 architecture

#### Linux
- May require additional packages for X11/Wayland support
- May need to run with sudo for mouse control
- Supports multiple architectures

## Code Signing (macOS)

For distribution on macOS, you'll need to code sign your application:

1. **Get an Apple Developer Certificate**
2. **Update `tauri.conf.json`**:
   ```json
   {
     "tauri": {
       "bundle": {
         "macOS": {
           "identity": "Your Developer ID"
         }
       }
     }
   }
   ```

## Notarization (macOS)

For distribution outside the App Store:

1. **Install `notarytool`** (Xcode 13+)
2. **Notarize your app**:
   ```bash
   xcrun notarytool submit MouseBridge.app --wait
   ```

## Release Process

1. **Update version numbers**:
   - `package.json`
   - `src-tauri/Cargo.toml`
   - `src-tauri/tauri.conf.json`

2. **Build for all platforms**:
   ```bash
   cargo tauri build --target aarch64-apple-darwin
   cargo tauri build --target x86_64-apple-darwin
   cargo tauri build --target x86_64-pc-windows-msvc
   cargo tauri build --target x86_64-unknown-linux-gnu
   ```

3. **Create GitHub release** with all build artifacts

## Continuous Integration

The project includes GitHub Actions workflows for:
- Automated testing
- Cross-platform builds
- Release creation

See `.github/workflows/` for configuration details. 