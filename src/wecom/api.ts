/**
 * WeChat Work API Client.
 */

/**
 * WeCom API response.
 */
export interface WeComApiResponse<T = unknown> {
  errcode: number;
  errmsg: string;
  data?: T;
}

/**
 * WeCom access token response.
 */
export interface WeComAccessTokenResponse {
  errcode: number;
  errmsg: string;
  access_token: string;
  expires_in: number;
}

/**
 * WeCom user info.
 */
export interface WeComUserInfo {
  userid: string;
  name: string;
  department: number[];
  position?: string;
  mobile?: string;
  gender?: string;
  email?: string;
  status: number;
  avatar?: string;
}

/**
 * WeCom department info.
 */
export interface WeComDepartmentInfo {
  id: number;
  name: string;
  name_en?: string;
  department_leader: number[];
  parentid: number;
}

/**
 * WeCom message send request.
 */
export interface WeComMessageSendRequest {
  touser?: string;
  toparty?: string;
  totag?: string;
  msgtype: WeComMessageType;
  agentid: number;
  text?: { content: string };
  image?: { media_id: string };
  voice?: { media_id: string };
  video?: { media_id: string };
  file?: { media_id: string };
  textcard?: WeComTextCard;
  news?: { articles: WeComNewsArticle[] };
  mpnews?: WeComMpNews;
  markdown?: { content: string };
  miniprogram?: WeComMiniProgram;
  safe?: number;
  enable_id_trans?: number;
  enable_duplicate_check?: number;
  duplicate_check_interval?: number;
}

/**
 * WeCom message types.
 */
export type WeComMessageType =
  | "text"
  | "image"
  | "voice"
  | "video"
  | "file"
  | "textcard"
  | "news"
  | "mpnews"
  | "markdown"
  | "miniprogram";

/**
 * WeCom text card.
 */
export interface WeComTextCard {
  title: string;
  description: string;
  url: string;
  btntxt?: string;
}

/**
 * WeCom news article.
 */
export interface WeComNewsArticle {
  title: string;
  description: string;
  url: string;
  picurl?: string;
}

/**
 * WeCom mp news.
 */
export interface WeComMpNews {
  articles: Array<{
    title: string;
    thumb_media_id: string;
    author?: string;
    content_source_url?: string;
    content?: string;
    digest?: string;
    show_cover_pic?: number;
  }>;
}

/**
 * WeCom mini program.
 */
export interface WeComMiniProgram {
  title: string;
  appid: string;
  pagepath: string;
  thumb_media_id: string;
}

/**
 * WeCom media upload response.
 */
export interface WeComMediaUploadResponse {
  errcode: number;
  errmsg: string;
  type: string;
  media_id: string;
  created_at: string;
}

/**
 * WeCom API client configuration.
 */
export interface WeComApiConfig {
  corpId: string;
  agentId: number;
  secret?: string;
  accessToken?: string;
  webhookUrl?: string;
  webhookToken?: string;
  encodingAESKey?: string;
  verifySsl?: boolean;
  timeoutSeconds?: number;
  proxy?: string;
}

/**
 * WeCom API client.
 */
export class WeComApiClient {
  private config: WeComApiConfig;
  private accessToken?: string;
  private tokenExpireTime?: number;
  private baseUrl: string;

  constructor(config: WeComApiConfig) {
    this.config = config;
    this.baseUrl = "https://qyapi.weixin.qq.com/cgi-bin";
  }

  /**
   * Get access token.
   */
  async getAccessToken(): Promise<string> {
    // Check if token is still valid
    if (this.accessToken && this.tokenExpireTime && Date.now() < this.tokenExpireTime - 60000) {
      return this.accessToken;
    }

    // Get new token
    const url = `${this.baseUrl}/gettoken?corpid=${this.config.corpId}&corpsecret=${this.config.secret}`;
    const response = await this.fetch<WeComAccessTokenResponse>(url);

    if (response.errcode !== 0) {
      throw new Error(`Failed to get access token: ${response.errmsg} (${response.errcode})`);
    }

    this.accessToken = response.access_token;
    this.tokenExpireTime = Date.now() + response.expires_in * 1000;

    return this.accessToken;
  }

  /**
   * Send message.
   */
  async sendMessage(
    request: WeComMessageSendRequest,
  ): Promise<{
    errcode: number;
    errmsg: string;
    invaliduser?: string;
    invalidparty?: string;
    invalidtag?: string;
  }> {
    const token = await this.getAccessToken();
    const url = `${this.baseUrl}/message/send?access_token=${token}`;

    const response = await this.fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    return response as any;
  }

  /**
   * Get user info.
   */
  async getUserInfo(userid: string): Promise<WeComUserInfo> {
    const token = await this.getAccessToken();
    const url = `${this.baseUrl}/user/get?access_token=${token}&userid=${userid}`;

    const response = await this.fetch<{ errcode: number; errmsg: string } & WeComUserInfo>(url);

    if (response.errcode !== 0) {
      throw new Error(`Failed to get user info: ${response.errmsg} (${response.errcode})`);
    }

    return response;
  }

  /**
   * Get department info.
   */
  async getDepartmentInfo(departmentId?: number): Promise<WeComDepartmentInfo[]> {
    const token = await this.getAccessToken();
    const url = departmentId
      ? `${this.baseUrl}/department/list?access_token=${token}&id=${departmentId}`
      : `${this.baseUrl}/department/list?access_token=${token}`;

    const response = await this.fetch<{
      errcode: number;
      errmsg: number;
      department: WeComDepartmentInfo[];
    }>(url);

    if (response.errcode !== 0) {
      throw new Error(`Failed to get department info: ${response.errmsg} (${response.errcode})`);
    }

    return response.department;
  }

  /**
   * Upload media.
   */
  async uploadMedia(type: string, filePath: string): Promise<WeComMediaUploadResponse> {
    const token = await this.getAccessToken();
    const url = `${this.baseUrl}/media/upload?access_token=${token}&type=${type}`;

    const formData = new FormData();
    formData.append("media", new Blob([await Deno.readTextFile(filePath)]));

    const response = await this.fetch<WeComMediaUploadResponse>(url, {
      method: "POST",
      body: formData as any,
    });

    if (response.errcode !== 0) {
      throw new Error(`Failed to upload media: ${response.errmsg} (${response.errcode})`);
    }

    return response;
  }

  /**
   * Generic fetch method.
   */
  private async fetch<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...(options?.headers || {}),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Verify webhook signature.
   */
  static verifyWebhookSignature(
    signature: string,
    timestamp: string,
    nonce: string,
    echostr: string,
    token: string,
  ): boolean {
    // Implementation would verify HMAC-SHA1 signature
    // This is a placeholder - actual implementation requires crypto module
    return true;
  }
}
