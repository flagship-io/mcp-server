import axios, { AxiosInstance } from "axios";
import type {
  FlagshipConfig,
  DecisionRequest,
  DecisionResponse,
  Environment,
  CampaignActivation,
  FlagInfo,
} from "../types/flagship.js";

/**
 * Flagship Decision API Client
 * Handles communication with the Flagship Decision API
 */
export class FlagshipClient {
  private config: FlagshipConfig;
  private client: AxiosInstance;
  private environmentCache: Environment | null = null;
  private cacheTimestamp: number = 0;
  private pollingInterval: number;

  constructor(config: FlagshipConfig) {
    this.config = {
      api_url: "https://decision.flagship.io/v2",
      polling_interval: 60000, // 60 seconds
      timeout: 5000,
      ...config,
    };

    this.pollingInterval = this.config.polling_interval || 60000;

    this.client = axios.create({
      baseURL: this.config.api_url,
      timeout: this.config.timeout,
      headers: {
        "x-api-key": this.config.api_key,
        "x-sdk-client": "flagship-mcp-server",
        "x-sdk-version": "1.0.0",
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Load environment configuration from CDN
   */
  async loadEnvironment(): Promise<Environment> {
    // Return cached environment if still valid
    const now = Date.now();
    if (
      this.environmentCache &&
      now - this.cacheTimestamp < this.pollingInterval
    ) {
      return this.environmentCache;
    }

    try {
      const response = await this.client.get(
        `/${this.config.env_id}/campaigns`,
        {
          params: {
            mode: "normal",
            exposeAllKeys: true,
          },
        }
      );

      this.environmentCache = response.data;
      this.cacheTimestamp = now;

      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          `Failed to load environment: ${error.response.status} ${error.response.statusText}`
        );
      }
      throw new Error(`Failed to load environment: ${error.message}`);
    }
  }

  /**
   * Get campaigns for a visitor
   */
  async getCampaigns(request: DecisionRequest): Promise<DecisionResponse> {
    try {
      const response = await this.client.post(
        `/${this.config.env_id}/campaigns`,
        {
          visitor_id: request.visitor_id,
          context: request.context || {},
          trigger_hit: request.trigger_hit || false,
        }
      );

      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          `Failed to get campaigns: ${error.response.status} ${error.response.statusText}`
        );
      }
      throw new Error(`Failed to get campaigns: ${error.message}`);
    }
  }

  /**
   * Get flags in simplified format
   */
  async getFlags(request: DecisionRequest): Promise<Record<string, FlagInfo>> {
    try {
      const response = await this.client.post(
        `/${this.config.env_id}/campaigns`,
        {
          visitor_id: request.visitor_id,
          context: request.context || {},
          trigger_hit: request.trigger_hit || false,
        }
      );

      const decisionResponse: DecisionResponse = response.data;
      return this.convertToFlagsFormat(decisionResponse);
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          `Failed to get flags: ${error.response.status} ${error.response.statusText}`
        );
      }
      throw new Error(`Failed to get flags: ${error.message}`);
    }
  }

  /**
   * Get a specific campaign
   */
  async getCampaign(request: DecisionRequest): Promise<DecisionResponse> {
    if (!request.campaign_id) {
      throw new Error("campaign_id is required");
    }

    try {
      const response = await this.client.post(
        `/${this.config.env_id}/campaigns/${request.campaign_id}`,
        {
          visitor_id: request.visitor_id,
          context: request.context || {},
          trigger_hit: false,
        }
      );

      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          `Failed to get campaign: ${error.response.status} ${error.response.statusText}`
        );
      }
      throw new Error(`Failed to get campaign: ${error.message}`);
    }
  }

  /**
   * Activate a campaign (send activation hit)
   */
  async activateCampaign(
    visitorId: string,
    variationGroupId: string,
    variationId: string
  ): Promise<void> {
    try {
      const activation: CampaignActivation = {
        vid: visitorId,
        cid: this.config.env_id,
        caid: variationGroupId,
        vaid: variationId,
        qt: Date.now(),
      };

      await this.client.post("/activate", activation);
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          `Failed to activate campaign: ${error.response.status} ${error.response.statusText}`
        );
      }
      throw new Error(`Failed to activate campaign: ${error.message}`);
    }
  }

  /**
   * Convert decision response to flags format
   */
  private convertToFlagsFormat(
    decisionResponse: DecisionResponse
  ): Record<string, FlagInfo> {
    const flags: Record<string, FlagInfo> = {};

    for (const campaign of decisionResponse.campaigns || []) {
      if (
        campaign.variation?.modifications?.value &&
        typeof campaign.variation.modifications.value === "object"
      ) {
        const modifications = campaign.variation.modifications.value;

        for (const [key, value] of Object.entries(modifications)) {
          flags[key] = {
            value,
            metadata: {
              campaignId: campaign.id,
              campaignName: campaign.name,
              type: campaign.type,
              variationGroupId: campaign.variationGroupId || "",
              variationGroupName: campaign.variationGroupName,
              variationId: campaign.variation.id,
              variationName: campaign.variation.name,
              reference: campaign.variation.reference,
              slug: campaign.slug,
            },
          };
        }
      }
    }

    return flags;
  }
}
