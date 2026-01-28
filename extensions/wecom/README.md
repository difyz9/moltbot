# WeChat Work (WeCom) Extension

WeChat Work (企业微信) channel plugin for Moltbot.

## Features

- Direct messages (DMs)
- Group messages
- Media files (images, videos, audio, files)
- Markdown messages
- Text card messages
- Multi-account support
- Webhook for real-time message delivery
- Department-based messaging
- Tag-based messaging

## Quick Setup

1. Create WeChat Work application at https://work.weixin.qq.com/
2. Configure credentials in your Moltbot config
3. Start the gateway

## Configuration

```json5
{
  channels: {
    wecom: {
      enabled: true,
      name: "My WeCom Bot",
      corpId: "ww1234567890abcdef",
      agentId: 1000001,
      secret: "your-secret-here",
      apiType: "webhook",
      webhookUrl: "https://your-domain.com/api/wecom/webhook",
      webhookToken: "your-webhook-token",
      encodingAESKey: "your-encoding-aes-key",
      dmPolicy: "pairing",
      groupPolicy: "open"
    }
  }
}
```

## Documentation

For detailed documentation, see https://docs.molt.bot/channels/wecom

## Limitations

- No streaming support (messages sent as complete blocks)
- No message reactions
- No message editing or deletion
- Limited threading support
- API rate limits apply

## License

MIT
