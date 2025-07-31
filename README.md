# MouseBridge

**Share a single mouse seamlessly between your Mac, Linux and PC.**

MouseBridge is a fast, secure, and open-source application that allows you to control multiple computers (macOS and Windows) using a single mouse. Move your cursor across screens as if they were one, with low-latency performance and encrypted communication. Perfect for hybrid workflows involving Mac, Linux and Windows PCs.

## Features

- **Seamless Mouse Sharing**: Move your mouse cursor between Mac and PC screens effortlessly.
- **Low Latency**: Built with Rust and WebRTC for real-time performance.
- **Secure**: End-to-end DTLS encryption for all network traffic.
- **Cross-Platform**: Supports macOS and Windows with native input emulation.
- **Lightweight GUI**: Configure server/client settings via a Tauri-based interface.
- **Open Source**: Licensed under MIT, welcoming contributions.

## How It Works

MouseBridge runs as a server on the computer with the mouse and a client on the other device. Mouse movements and clicks are captured on the server, transmitted via WebRTC, and emulated on the client. The GUI simplifies setup, letting you connect devices by hostname or IP.

## Installation

### Prerequisites

- **Rust**: Install via [rustup](https://rustup.rs/).
- **macOS**: Xcode Command Line Tools (`xcode-select --install`).
- **Windows**: Visual Studio Build Tools (C++ workload).
- **Node.js**: For Tauri frontend development (`npm` required).

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/makalin/MouseBridge.git
   cd MouseBridge
   ```

2. Install dependencies:
   ```bash
   cargo install tauri-cli
   npm install
   ```

3. Build and run:
   ```bash
   cargo tauri dev
   ```

4. For production builds:
   ```bash
   cargo tauri build
   ```

Precompiled binaries for macOS and Windows will be available in the [Releases](https://github.com/makalin/MouseBridge/releases) section.

## Usage

1. Launch MouseBridge on both devices.
2. On the device with the mouse (server):
   - Select "Server" mode in the GUI.
   - Note the displayed hostname or IP.
3. On the other device (client):
   - Select "Client" mode.
   - Enter the server’s hostname/IP and connect.
4. Authorize the connection using the displayed fingerprint (first-time only).
5. Move your mouse to the edge of the server screen to control the client.

## Configuration

- **Port**: Defaults to UDP 4242. Ensure it’s open in your firewall.
- **Screen Layout**: Configure in the GUI to define where the cursor transitions.
- **Persistence**: Save authorized devices in `~/.mousebridge/config.json`.

## Building from Source

See [BUILDING.md](BUILDING.md) for detailed instructions on compiling for macOS and Windows.

## Contributing

We welcome contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on reporting issues, submitting pull requests, and coding standards.

## Roadmap

- Clipboard sharing.
- Keyboard support.
- Linux compatibility.
- Mobile device support (Android/iOS).
- Hotkey to lock cursor to one screen.

## License

MIT License. See [LICENSE](LICENSE) for details.

## Acknowledgments

Inspired by projects like [Deskflow](https://github.com/deskflow/deskflow) and [Lan Mouse](https://github.com/feschber/lan-mouse). Built with love using Rust, WebRTC, and Tauri.

## Support

For issues, feature requests, or discussions, open an issue on [GitHub](https://github.com/makalin/MouseBridge/issues).

---
*MouseBridge: One mouse, two systems, zero hassle.*
