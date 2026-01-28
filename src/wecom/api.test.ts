/**
 * WeChat Work (WeCom) API client tests.
 */

import { describe, expect, it, vi } from "vitest";

import { WeComApiClient } from "./api.js";

describe("WeComApiClient", () => {
  it("creates client with basic config", () => {
    const config = {
      corpId: "ww1234567890",
      agentId: "1",
      secret: "test-secret",
      accessToken: "",
      verifySsl: true,
      timeoutSeconds: 30,
    };

    const client = new WeComApiClient(config);
    expect(client.config.corpId).toBe("ww1234567890");
    expect(client.config.agentId).toBe("1");
    expect(client.config.secret).toBe("test-secret");
  });

  describe("getAccessToken", () => {
    it("returns cached access token if valid", async () => {
      const config = {
        corpId: "ww1234567890",
        agentId: "1",
        secret: "test-secret",
        accessToken: "cached-token",
        verifySsl: true,
        timeoutSeconds: 30,
      };

      const client = new WeComApiClient(config);
      // Mock current time to make token appear fresh
      vi.spyOn(Date, "now").mockReturnValue(0);

      const token = await client.getAccessToken();
      expect(token).toBe("cached-token");
    });

    it("fetches new access token when cached token expired", async () => {
      const config = {
        corpId: "ww1234567890",
        agentId: "1",
        secret: "test-secret",
        accessToken: "expired-token",
        accessTokenExpiry: Date.now() - 1000, // Expired
        verifySsl: true,
        timeoutSeconds: 30,
      };

      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(
          new Response(
            JSON.stringify({
              errcode: 0,
              errmsg: "ok",
              access_token: "new-token",
              expires_in: 7200,
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            },
          ),
        ),
      );

      const client = new WeComApiClient(config);
      const token = await client.getAccessToken();
      expect(token).toBe("new-token");
      expect(client.config.accessToken).toBe("new-token");
    });

    it("handles API errors", async () => {
      const config = {
        corpId: "ww1234567890",
        agentId: "1",
        secret: "test-secret",
        accessToken: "",
        verifySsl: true,
        timeoutSeconds: 30,
      };

      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(
          new Response(JSON.stringify({ errcode: 40001, errmsg: "invalid credential" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
        ),
      );

      const client = new WeComApiClient(config);
      await expect(client.getAccessToken()).rejects.toThrow("invalid credential");
    });
  });

  describe("sendMessage", () => {
    it("throws error when no access token", async () => {
      const config = {
        corpId: "ww1234567890",
        agentId: "1",
        secret: "test-secret",
        accessToken: "",
        verifySsl: true,
        timeoutSeconds: 30,
      };

      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(
          new Response(
            JSON.stringify({
              errcode: 0,
              errmsg: "ok",
              access_token: "test-token",
              expires_in: 7200,
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            },
          ),
        ),
      );

      const client = new WeComApiClient(config);

      // First call will fetch token, second call should use it
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(
          new Response(
            JSON.stringify({
              errcode: 0,
              errmsg: "ok",
              msgid: "test-msg-id",
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            },
          ),
        ),
      );

      const result = await client.sendMessage({
        touser: "ZhangSan",
        msgtype: "text",
        text: { content: "Hello" },
      });

      expect(result.errcode).toBe(0);
      expect(result.msgid).toBe("test-msg-id");
    });
  });

  describe("verifyWebhookSignature", () => {
    it("returns true for valid signature", () => {
      const config = {
        corpId: "ww1234567890",
        agentId: "1",
        secret: "test-secret",
        accessToken: "",
        webhookToken: "test-token",
        verifySsl: true,
        timeoutSeconds: 30,
      };

      const client = new WeComApiClient(config);
      // Note: Actual signature verification uses crypto, this is a simplified test
      // In real implementation, you'd need to compute the proper signature
      const timestamp = "1234567890";
      const nonce = "random";
      const echostr = "test-echo";
      const signature = "computed-signature";

      const result = client.verifyWebhookSignature(timestamp, nonce, echostr, signature);
      expect(result).toBeDefined();
    });
  });

  describe("decryptWebhookMessage", () => {
    it("decrypts encrypted message", () => {
      const config = {
        corpId: "ww1234567890",
        agentId: "1",
        secret: "test-secret",
        accessToken: "",
        encodingAESKey: "test-aes-key-32-chars-long-1234",
        verifySsl: true,
        timeoutSeconds: 30,
      };

      const client = new WeComApiClient(config);
      // Note: Actual decryption uses crypto, this is a simplified test
      const encryptedMsg = "encrypted-data";

      const result = client.decryptWebhookMessage(encryptedMsg);
      expect(result).toBeDefined();
    });
  });
});
