---
summary: "Testing guide for WeChat and WeChat Work channels"
read_when:
  - Testing WeChat or WeChat Work channel functionality
  - Verifying channel integration
  - Running automated tests
---
# Testing WeChat and WeChat Work Channels

This guide covers testing the WeChat and WeChat Work (WeCom) channel implementations.

## Prerequisites

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Build the project**:
   ```bash
   pnpm build
   ```

## Running Tests

### Unit Tests

Run all tests for WeChat and WeCom channels:

```bash
# Run WeChat extension tests
pnpm test extensions/wechat/src/channel.test.ts

# Run WeCom extension tests
pnpm test extensions/wecom/src/channel.test.ts

# Run WeChat source tests
pnpm test src/wechat/accounts.test.ts

# Run WeCom source tests
pnpm test src/wecom/accounts.test.ts
pnpm test src/wecom/api.test.ts

# Run all channel-related tests together
pnpm test extensions/wechat/src/channel.test.ts extensions/wecom/src/channel.test.ts src/wechat/accounts.test.ts src/wecom/accounts.test.ts src/wecom/api.test.ts
```

### Test Coverage

Check test coverage for the channels:

```bash
pnpm test:coverage -- extensions/wechat -- extensions/wecom -- src/wechat -- src/wecom
```

## Test Categories

### Extension Plugin Tests (`extensions/*/src/channel.test.ts`)

These tests verify the channel plugin interface:

- **Plugin metadata**: ID, labels, docs paths, aliases
- **Capabilities**: Supported features (chat types, media, reactions, etc.)
- **Account management**: List, resolve, default account
- **Security**: DM policy resolution
- **Groups**: Mention requirements, tool policies
- **Messaging**: Target normalization, ID validation
- **Status**: Issue collection, configuration validation

### Source Code Tests (`src/*/accounts.test.ts`)

These tests verify core channel logic:

- **Account resolution**: Parsing configuration, applying defaults
- **Account listing**: Filtering enabled accounts
- **Configuration validation**: Required fields, default values

### API Tests (`src/wecom/api.test.ts`)

Tests for WeCom API client:

- **Access token management**: Caching, refresh, expiration
- **Message sending**: API calls, error handling
- **Webhook verification**: Signature validation, message decryption

## Manual Testing

### WeChat Channel

1. **Configure WeChat account** in `~/.clawdbot/config.json5`:
   ```json5
   {
     channels: {
       wechat: {
         enabled: true,
         puppet: "wechaty-puppet-wechat",
         qrCode: true,
         dmPolicy: "pairing",
         allowFrom: ["*"],
       }
     }
   }
   ```

2. **Start the gateway**:
   ```bash
   moltbot gateway run
   ```

3. **Scan QR code** displayed in terminal to login to WeChat

4. **Test DM messages**:
   - Send a message to any WeChat contact
   - Verify bot responds according to DM policy

5. **Test group messages**:
   - Add bot to a WeChat group
   - Mention the bot to trigger responses
   - Verify group policies are respected

### WeChat Work (WeCom) Channel

1. **Create WeChat Work application**:
   - Go to https://work.weixin.qq.com/
   - Create an application (internal or third-party)
   - Note Corp ID, Agent ID, and Secret

2. **Configure WeCom account** in `~/.clawdbot/config.json5`:
   ```json5
   {
     channels: {
       wecom: {
         enabled: true,
         corpId: "ww1234567890abcdef",
         agentId: 1000001,
         secret: "your-secret-here",
         apiType: "webhook",
         webhookUrl: "https://your-domain.com/api/wecom/webhook",
         webhookToken: "your-webhook-token",
         encodingAESKey: "your-encoding-aes-key",
         dmPolicy: "pairing",
         groupPolicy: "open",
       }
     }
   }
   ```

3. **Configure webhook** in WeChat Work admin console:
   - Set webhook URL to your publicly accessible endpoint
   - Set token for signature verification
   - Set encoding AES key for message encryption

4. **Start the gateway**:
   ```bash
   moltbot gateway run
   ```

5. **Test DM messages**:
   - Send a message to the bot in WeChat Work
   - Verify bot responds according to DM policy

6. **Test group messages**:
   - Add bot to a WeChat Work group/department
   - Mention the bot to trigger responses
   - Verify group policies are respected

## Verification Checklist

### WeChat Channel

- [ ] QR code login works
- [ ] Bot receives direct messages
- [ ] Bot responds to direct messages
- [ ] Bot receives group messages
- [ ] Bot responds to group mentions
- [ ] Group policies are respected (requireMention, allowFrom)
- [ ] DM policies are respected (pairing, allowlist, open)
- [ ] Message formatting is correct
- [ ] Media files are handled properly

### WeChat Work Channel

- [ ] Access token is obtained successfully
- [ ] Webhook receives messages
- [ ] Webhook signature verification works
- [ ] Message decryption works
- [ ] Bot receives direct messages
- [ ] Bot responds to direct messages
- [ ] Bot receives group messages
- [ ] Bot responds to group mentions
- [ ] Group policies are respected (requireMention, allowFrom)
- [ ] DM policies are respected (pairing, allowlist, open)
- [ ] Message formatting is correct
- [ ] Markdown messages work
- [ ] Text card messages work
- [ ] Media files are handled properly

## Debugging

### Enable verbose logging

```bash
moltbot gateway run --verbose
```

### Check channel status

```bash
moltbot channels status
moltbot channels status --probe
```

### View logs

- Gateway logs: Check terminal output or log files
- Channel-specific logs: Look for `[WeChat]` or `[WeCom]` prefixes

### Common Issues

#### WeChat

**Issue: QR code login fails**
- Verify WeChaty puppet is compatible
- Check network connectivity
- Ensure WeChat account is not restricted

**Issue: Bot doesn't receive messages**
- Verify bot is logged in
- Check WeChaty puppet connection status
- Review gateway logs for errors

#### WeChat Work

**Issue: Access token errors**
- Verify Corp ID and Secret are correct
- Check if API is rate limited
- Ensure token refresh mechanism is working

**Issue: Webhook not receiving messages**
- Verify webhook URL is accessible from internet
- Check firewall settings
- Verify token and encoding AES key match WeCom configuration

**Issue: Message decryption fails**
- Verify encoding AES key is correct
- Check if webhook messages are properly encrypted
- Review gateway logs for decryption errors

## Integration Testing

### Test with Gateway

1. Start gateway with channel enabled
2. Send test messages via WeChat/WeCom
3. Verify responses are correct
4. Check status output: `moltbot channels status --probe`

### Test with CLI

Send messages via CLI to verify outbound messaging:

```bash
# WeChat
moltbot message send --channel wechat --to "user-id" "Hello from CLI"

# WeChat Work
moltbot message send --channel wecom --to "user-id" "Hello from CLI"
```

### Test with Agent

Configure an agent to use the channel and test:

```json5
{
  agent: {
    channel: "wechat" // or "wecom"
  }
}
```

Send messages to verify agent integration.

## Automated Testing CI

Tests run automatically in CI via:

```bash
pnpm test
```

To run only channel tests locally:

```bash
pnpm test -- --grep "WeChat|WeCom"
```

## Related Documentation

- [WeChat channel documentation](/channels/wechat)
- [WeChat Work channel documentation](/channels/wecom)
- [Channel configuration](/configuration#channels)
- [Testing overview](/testing)
- [Gateway documentation](/gateway)
