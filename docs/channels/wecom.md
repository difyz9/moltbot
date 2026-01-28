---
summary: "WeChat Work (WeCom) bot support status, capabilities, and configuration"
read_when:
  - Working on WeChat Work channel features
---
# WeChat Work (WeCom)

Status: beta support for DMs + groups via WeChat Work API.

## Quick setup (beginner)

1. Create WeChat Work application
2. Configure credentials
3. Start gateway

## What it is

- A WeChat Work (企业微信) enterprise channel owned by the Gateway
- Uses official WeChat Work API
- Supports webhook for real-time message delivery
- Deterministic routing: replies go back to WeCom

## Setup (fast path)

### 1. Create WeChat Work application

1. Go to [WeChat Work Admin Console](https://work.weixin.qq.com/)
2. Log in with your enterprise account
3. Navigate to "Application Management" (应用管理) → "Create Application" (创建应用)
4. Choose "Internal Application" (自建应用) or "Third-party Application" (第三方应用)
5. Fill in application details:
   - Application Name: Your bot name
   - Application Introduction: Bot description
   - Application Logo: Bot icon
6. After creation, note down:
   - **Corp ID** (企业ID): From "My Enterprise" (我的企业) → "Enterprise Info" (企业信息)
   - **Agent ID** (应用ID): From application details
   - **Agent Secret** (应用Secret): From application details → "Secret" (查看Secret)

### 2. Configure webhook

1. In the WeChat Work application settings, find "Receive Messages" (接收消息)
2. Set the mode to "API Callback" (API回调模式)
3. Configure your webhook URL (e.g., `https://your-domain.com/api/wecom/callback`)
4. Set the **Token** (used for signature verification)
5. Set the **EncodingAESKey** (used for message encryption)
6. Click "Save" (保存)

### 3. Configure Moltbot

Add WeCom configuration to your `~/.clawdbot/config.json5`:

```json5
{
  channels: {
    wecom: {
      enabled: true,
      name: "My WeCom Bot",

      // WeChat Work credentials
      corpId: "ww1234567890abcdef",
      agentId: 1000001,
      secret: "your-secret-here",

      // Webhook configuration
      apiType: "webhook",
      webhookUrl: "https://your-domain.com/api/wecom/webhook",
      webhookToken: "your-webhook-token",
      encodingAESKey: "your-encoding-aes-key",

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

### 4. Start gateway

Start gateway to begin WeCom integration:

```bash
moltbot gateway run
```

The gateway will:
1. Initialize WeCom API client
2. Set up webhook endpoint
3. Start receiving messages

## How it works

### Authentication

WeChat Work uses API-based authentication:

1. Gateway uses Corp ID + Agent Secret to get access token
2. Access token is cached and automatically refreshed
3. Webhook receives encrypted messages
4. Gateway decrypts and processes messages

### Message handling

- **Direct messages**: Received from individual WeCom users
- **Group messages**: Received from WeCom departments/chats
- **Mentions**: In groups, bot only responds when mentioned (unless configured otherwise)
- **Media**: Images, videos, files are supported

### Target types

WeCom supports three target types for sending messages:

- **User** (`touser`): Send to specific user ID
- **Department** (`toparty`): Send to all members of a department
- **Tag** (`totag`): Send to users with a specific tag

## Configuration

### Account configuration

Basic WeCom account setup:

```json5
{
  channels: {
    wecom: {
      enabled: true,
      name: "WeCom Bot",

      // Required credentials
      corpId: "ww1234567890abcdef",
      agentId: 1000001,
      secret: "your-secret-here",

      // Webhook configuration
      apiType: "webhook",
      webhookUrl: "https://your-domain.com/api/wecom/webhook",
      webhookToken: "your-webhook-token",
      encodingAESKey: "your-encoding-aes-key",

      // DM policy
      dmPolicy: "pairing",
      allowFrom: ["*"],

      // Group policy
      groupPolicy: "open",
    }
  }
}
```

### Multi-account support

Configure multiple WeCom accounts:

```json5
{
  channels: {
    wecom: {
      defaultAccountId: "account1",
      accounts: {
        account1: {
          enabled: true,
          name: "Enterprise WeCom",
          corpId: "ww1234567890abcdef",
          agentId: 1000001,
          secret: "secret1",
          dmPolicy: "open",
        },
        account2: {
          enabled: true,
          name: "Partner WeCom",
          corpId: "ww0987654321fedcba",
          agentId: 1000002,
          secret: "secret2",
          dmPolicy: "pairing",
          allowFrom: ["partner-user-id"],
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
    wecom: {
      groups: {
        "*": {
          requireMention: true,
        },
        "department-id": {
          requireMention: false,
          tools: ["weather", "time"],
          departmentId: "2",
        }
      }
    }
  }
}
```

### Streaming configuration

WeCom has limited streaming support:

```json5
{
  channels: {
    wecom: {
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
- Media files (images, videos, audio, files)
- Markdown messages
- Text card messages
- Multi-account support
- Message history context
- Webhook for real-time delivery
- Department-based messaging
- Tag-based messaging

### Limitations

- **No streaming**: WeCom does not support real-time streaming; messages are sent as complete blocks
- **No reactions**: WeCom message reactions are not supported
- **No message editing**: Once sent, messages cannot be edited
- **No message deletion**: Messages cannot be unsent
- **Limited threading**: WeCom groups do not support threaded conversations
- **API rate limits**: WeCom API has rate limits (usually 100 calls per minute)
- **Access token expiration**: Tokens expire after 2 hours and must be refreshed

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

## Message types

WeCom supports various message types:

- **text**: Plain text messages
- **image**: Image messages (requires media upload)
- **voice**: Voice messages (requires media upload)
- **video**: Video messages (requires media upload)
- **file**: File messages (requires media upload)
- **markdown**: Markdown-formatted messages
- **textcard**: Card-style messages with title, description, and button

### Sending media

To send media, first upload it:

1. Upload media using the API
2. Get media_id from response
3. Send message with media_id

## API reference

### WeChat Work API endpoints

- **Get Access Token**: `https://qyapi.weixin.qq.com/cgi-bin/gettoken`
- **Send Message**: `https://qyapi.weixin.qq.com/cgi-bin/message/send`
- **Get User Info**: `https://qyapi.weixin.qq.com/cgi-bin/user/get`
- **Get Department Info**: `https://qyapi.weixin.qq.com/cgi-bin/department/list`
- **Upload Media**: `https://qyapi.weixin.qq.com/cgi-bin/media/upload`

### Error codes

Common error codes:
- `0`: Success
- `40014`: Invalid access token
- `40031`: Invalid receiver ID
- `45009`: Message too long (max 2048 bytes)
- `45015`: Invalid media type
- `45016`: Invalid media ID

## Troubleshooting

### Webhook not receiving messages

1. Verify webhook URL is accessible from internet
2. Check firewall allows incoming connections
3. Verify token and encoding AES key match WeCom configuration
4. Check gateway logs for webhook errors

### Access token errors

1. Verify corpId and secret are correct
2. Check token expiration (tokens expire after 2 hours)
3. Ensure API is not rate limited

### Messages not received

1. Verify `dmPolicy` and `groupPolicy` settings
2. Check `allowFrom` configuration for DMs
3. Ensure application has permissions to receive messages
4. Check webhook is properly configured in WeCom admin console

### API rate limits

If you hit rate limits:

1. Implement request queuing
2. Reduce message frequency
3. Consider using multiple applications for load balancing

## Privacy and security

- DM policy defaults to `pairing`, requiring approval for unknown senders
- Group policy defaults to `open`, allowing messages from all groups
- Webhook messages are encrypted using AES key
- Always review your `allowFrom` configuration
- Store secrets securely (consider using secret managers like agenix)

## Advanced usage

### Using access token directly

For testing or automated deployments, you can provide access token directly:

```json5
{
  channels: {
    wecom: {
      corpId: "ww1234567890abcdef",
      agentId: 1000001,
      accessToken: "your-access-token",
    }
  }
}
```

Note: Tokens expire after 2 hours and must be refreshed manually.

### Department-based routing

Send messages to entire departments:

```bash
moltbot message send --channel wecom --to wecom:department:2 "Hello team!"
```

### Tag-based routing

Send messages to users with specific tags:

```bash
moltbot message send --channel wecom --to wecom:tag:developer "Attention developers!"
```

## Related docs

- [Channel configuration](/configuration#channels)
- [DM policy](/configuration#dm-policy)
- [Group configuration](/configuration#groups)
- [Multi-account setup](/configuration#multi-accounts)
- [Gateway setup](/gateway)
- [WeChat Work API Documentation](https://developer.work.weixin.qq.com/document/path/90665)
