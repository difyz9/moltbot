# WeChat Channel Extension for Moltbot

This extension adds WeChat support to Moltbot using the WeChaty library.

## Installation

The WeChat extension is included in the main Moltbot repository. No separate installation is required.

## Features

- **QR Code Login**: Authenticate using QR code scanning
- **Direct Messages**: Support for 1-on-1 conversations
- **Group Messages**: Support for WeChat groups
- **Media Support**: Send and receive images, videos, and audio
- **Multi-Account**: Configure multiple WeChat accounts
- **Message History**: Configurable history context for conversations

## Configuration

Add WeChat configuration to your `~/.clawdbot/config.json5`:

```json5
{
  channels: {
    wechat: {
      enabled: true,
      name: "My WeChat Bot",

      // WeChaty puppet configuration
      puppet: "wechaty-puppet-wechat",
      qrCode: true,

      // DM policy (default: "pairing")
      dmPolicy: "pairing",
      allowFrom: ["*"],

      // Group policy (default: "open")
      groupPolicy: "open",

      // History limits
      historyLimit: 20,
      dmHistoryLimit: 10,

      // Message settings
      textChunkLimit: 2048,
    }
  }
}
```

## Getting Started

1. **Install dependencies**: `pnpm install`

2. **Configure WeChat**: Add configuration to your config file

3. **Start the gateway**: `moltbot gateway run`

4. **Scan QR code**: A QR code URL will be displayed in the logs. Scan it with your WeChat app to log in.

## Puppets

WeChat channel uses WeChaty puppets for WeChat integration. The default puppet is `wechaty-puppet-wechat`.

### Available Puppets

- `wechaty-puppet-wechat`: Default puppet, based on WeChat web protocol
- `wechaty-puppet-service`: Cloud-based puppet service
- `wechaty-puppet-wechat4u`: Alternative web protocol implementation

To use a different puppet, install it and update your configuration:

```bash
pnpm add wechaty-puppet-service
```

```json5
{
  channels: {
    wechat: {
      puppet: "wechaty-puppet-service",
      puppetOptions: {
        token: "your-service-token",
      }
    }
  }
}
```

## Multi-Account Setup

Configure multiple WeChat accounts:

```json5
{
  channels: {
    wechat: {
      defaultAccountId: "personal",
      accounts: {
        personal: {
          enabled: true,
          name: "Personal WeChat",
          puppet: "wechaty-puppet-wechat",
          dmPolicy: "open",
        },
        work: {
          enabled: true,
          name: "Work WeChat",
          puppet: "wechaty-puppet-wechat",
          dmPolicy: "pairing",
          allowFrom: ["colleague1", "colleague2"],
        }
      }
    }
  }
}
```

## Limitations

- **No Streaming**: WeChat does not support real-time streaming. Messages are sent as complete blocks.
- **No Reactions**: WeChat message reactions are not supported.
- **No Message Editing**: Once sent, messages cannot be edited.
- **No Message Deletion**: Messages cannot be unsent.
- **QR Login Required**: Each new session requires QR code scanning.

## Troubleshooting

### QR Code Not Displaying

1. Check that `qrCode: true` is set in your configuration
2. Verify gateway logs for any errors
3. Ensure WeChaty and the puppet are properly installed

### Login Timeout

1. Restart the gateway: `moltbot gateway restart`
2. Make sure your WeChat app is up to date
3. Check network connectivity

### Messages Not Received

1. Verify `dmPolicy` and `groupPolicy` settings
2. Check `allowFrom` configuration for DMs
3. Ensure the gateway is running: `moltbot gateway status`

## Development

### Project Structure

```
extensions/wechat/
├── index.ts              # Plugin entry point
├── package.json          # NPM dependencies
├── moltbot.plugin.json   # Plugin manifest
├── README.md             # This file
└── src/
    ├── channel.ts        # Channel plugin implementation
    ├── runtime.ts       # Runtime bindings
    └── types.ts        # Type definitions
```

### Core Implementation

The core WeChat functionality is implemented in `src/wechat/`:

- `bot.ts`: WeChat bot instance management
- `bot-handlers.ts`: Message event handlers
- `send.ts`: Message sending logic
- `accounts.ts`: Account configuration management
- `monitor.ts`: Connection and message monitoring
- `probe.ts`: Connection probing
- `audit.ts`: Account auditing
- `format.ts`: Message formatting
- `targets.ts`: Target resolution

### Testing

Run tests for the WeChat channel:

```bash
pnpm test src/wechat/
```

## Contributing

Contributions are welcome! Please follow the project's contribution guidelines.

## License

This extension is part of Moltbot and follows the same license.

## References

- [WeChaty Documentation](https://docs.chatie.io/)
- [WeChaty GitHub](https://github.com/wechaty/wechaty)
- [Moltbot Documentation](https://docs.molt.bot)
