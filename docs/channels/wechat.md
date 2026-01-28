---
summary: "WeChat bot support status, capabilities, and configuration"
read_when:
  - Working on WeChat channel features
---
# WeChat (Bot API)

Status: beta support for DMs + groups via WeChaty.

## Quick setup (beginner)

1. Install the WeChat extension
2. Configure WeChat credentials
3. Start the gateway

## What it is

- A WeChat Official Account channel owned by the Gateway
- Uses WeChaty library for WeChat integration
- Supports QR code login for authentication
- Deterministic routing: replies go back to WeChat

## Setup (fast path)

### 1. Install dependencies

The WeChat channel requires the `@moltbot/wechat` extension:

```bash
pnpm install
```

### 2. Configure

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

### 3. Start the gateway

Start the gateway to begin WeChat integration:

```bash
moltbot gateway run
```

On first start, WeChaty will display a QR code for login:

```
[WeChat] QR Code status: 2
[WeChat] Scan QR Code at: https://wechaty.js.org/qrcode/...
```

Scan the QR code with your WeChat app to log in.

## How it works

### Authentication

WeChat uses QR code login:

1. Gateway starts and requests a QR code from WeChaty
2. QR code URL is logged to console
3. Scan the QR code with your WeChat mobile app
4. Gateway establishes session and starts receiving messages

### Message handling

- **Direct messages**: Received from individual WeChat contacts
- **Group messages**: Received from WeChat groups
- **Mentions**: In groups, bot only responds when mentioned (unless configured otherwise)

### Media handling

- Images, videos, audio files are supported
- Media is downloaded and processed by the gateway
- Bot can send media files back to users

## Configuration

### Account configuration

Basic WeChat account setup:

```json5
{
  channels: {
    wechat: {
      enabled: true,
      name: "WeChat Bot",

      // Puppet implementation (default: wechaty-puppet-wechat)
      puppet: "wechaty-puppet-wechat",

      // Enable QR code login (default: true)
      qrCode: true,

      // DM policy: "pairing" | "allowlist" | "open" | "disabled"
      dmPolicy: "pairing",

      // Allow list for DMs (user IDs or wildcards)
      allowFrom: ["*"],

      // Group policy: "open" | "allowlist" | "disabled"
      groupPolicy: "open",

      // Message history limits
      historyLimit: 20,
      dmHistoryLimit: 10,
    }
  }
}
```

### Multi-account support

Configure multiple WeChat accounts:

```json5
{
  channels: {
    wechat: {
      defaultAccountId: "account1",
      accounts: {
        account1: {
          enabled: true,
          name: "Personal WeChat",
          puppet: "wechaty-puppet-wechat",
          dmPolicy: "open",
        },
        account2: {
          enabled: true,
          name: "Work WeChat",
          puppet: "wechaty-puppet-wechat",
          dmPolicy: "pairing",
          allowFrom: ["user1", "user2"],
        }
      }
    }
  }
}
```

### Group configuration

Configure group-specific behavior:

```json5
{
  channels: {
    wechat: {
      groups: {
        "*": {
          requireMention: true,
        },
        "specific-group-id": {
          requireMention: false,
          tools: ["weather", "time"],
        }
      }
    }
  }
}
```

### Streaming configuration

WeChat has limited streaming support:

```json5
{
  channels: {
    wechat: {
      // Streaming mode (default: "partial")
      streamMode: "off",

      // Disable block streaming for this account
      blockStreaming: true,

      // Chunking config for draft streaming
      draftChunk: {
        minChars: 100,
        maxChars: 500,
      },
    }
  }
}
```

## Features and limitations

### Supported features

- Direct messages (DMs)
- Group messages
- Media files (images, videos, audio)
- QR code login
- Multi-account support
- Message history context

### Limitations

- **No streaming**: WeChat does not support real-time streaming; messages are sent as complete blocks
- **No reactions**: WeChat message reactions are not supported
- **No message editing**: Once sent, messages cannot be edited
- **No message deletion**: Messages cannot be unsent
- **Limited threading**: WeChat groups do not support threaded conversations
- **QR login**: Requires QR code scanning on each new session

### Capabilities

```json5
{
  chatTypes: ["direct", "group"],
  polls: false,
  reactions: false,
  edit: false,
  unsend: false,
  reply: true,
  effects: false,
  groupManagement: false,
  threads: false,
  media: true,
  nativeCommands: false,
  blockStreaming: true
}
```

## Troubleshooting

### QR code not displaying

If the QR code URL is not displayed in logs:

1. Check that `qrCode: true` is set in configuration
2. Verify gateway logs for any errors
3. Ensure WeChaty puppet is properly installed

### Login timeout

If QR code login times out:

1. Restart the gateway: `moltbot gateway restart`
2. Make sure your WeChat app is up to date
3. Check network connectivity

### Messages not received

If messages are not being received:

1. Verify `dmPolicy` and `groupPolicy` settings
2. Check `allowFrom` configuration for DMs
3. Ensure the gateway is running: `moltbot gateway status`

### Connection issues

If connection drops frequently:

1. Check internet connection
2. Verify WeChaty is using the correct puppet
3. Review gateway logs for error messages

## Privacy and security

- DM policy defaults to `pairing`, requiring approval for unknown senders
- Group policy defaults to `open`, allowing messages from all groups
- Always review your `allowFrom` configuration
- QR code login requires physical access to your WeChat app

## Advanced usage

### Custom puppet

Use a custom WeChaty puppet:

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

### Webhook integration

While WeChaty doesn't natively support webhooks like Telegram, you can:

1. Use WeChaty's event system to forward messages
2. Integrate with custom webhooks in your code
3. Use WeChaty Service for cloud-based integration

## Related docs

- [Channel configuration](/configuration#channels)
- [DM policy](/configuration#dm-policy)
- [Group configuration](/configuration#groups)
- [Multi-account setup](/configuration#multi-accounts)
- [Gateway setup](/gateway)
