import axios, { AxiosInstance } from "axios";
import { ResourceLoaderConfig } from "../types/resourceLoader.js";

/**
 * Resource Loader API Client
 * Handles communication with the Resource Loader API
 */
export class ResourceLoaderClient {
  private config: ResourceLoaderConfig;
  private clients: Map<string, AxiosInstance>;

  constructor(config: ResourceLoaderConfig) {
    this.config = {
      we_account_id: config.we_account_id,
      we_token: config.we_token,
      fear_rca_account_id: config.fear_rca_account_id,
      fear_rca_account_environment_id: config.fear_rca_account_environment_id,
      fear_rca_token: config.fear_rca_token,
    };

    this.clients = new Map([
      ["web-exp", this.createClient(this.config.we_token)],
      ["feat-exp", this.createClient(this.config.fear_rca_token)],
    ]);
  }

  /**
   * Factory method to create an Axios client instance
   * @private
   */
  private createClient(token?: string): AxiosInstance {
    return axios.create({
      baseURL: "https://resource-loader-api.abtasty.com/v1",
      headers: {
        Authorization: "Bearer " + token,
        "x-sdk-client": "abtasty-mcp-server",
        "x-sdk-version": "1.0.0",
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Get the appropriate client for the API type
   * @private
   */
  private getClient(apiType: string): AxiosInstance {
    const client = this.clients.get(apiType);
    if (!client) {
      throw new Error(`Unknown API type: ${apiType}`);
    }
    return client;
  }

  /**
   * Load Web Exp resources via Resource Loader API
   */
  async loadWebExpResources(resourceLoaderContent: any): Promise<any> {
    return this.loadResources(resourceLoaderContent, "web-exp", {
      account_id: this.config.we_account_id!,
    });
  }

  /**
   * Load Feat Exp resources via Resource Loader API
   */
  async loadFeatExpResources(resourceLoaderContent: any): Promise<any> {
    return this.loadResources(resourceLoaderContent, "feat-exp", {
      account_id: this.config.fear_rca_account_id!,
      account_environment_id: this.config.fear_rca_account_environment_id!,
    });
  }

  private async loadResources(
    resourceLoaderContent: any,
    apiType: string,
    params: Record<string, string>
  ): Promise<any> {
    try {
      // Handle both string and object inputs
      let resources;
      if (typeof resourceLoaderContent === "string") {
        resources = JSON.parse(resourceLoaderContent);
      } else if (typeof resourceLoaderContent === "object") {
        resources = resourceLoaderContent;
      } else {
        throw new Error(
          `Invalid resourceLoaderContent type: ${typeof resourceLoaderContent}`
        );
      }

      const payload = {
        version: 1,
        resources: [resources],
      };

      console.error("[ResourceLoader] Sending request to Resource Loader API");
      console.error(
        "[ResourceLoader] Payload:",
        JSON.stringify(payload, null, 2)
      );

      const response = await this.getClient(apiType).post(
        `/${apiType}/resource-loader`,
        payload,
        { params }
      );

      console.error("[ResourceLoader] Response status:", response.status);
      console.error(
        "[ResourceLoader] Response data:",
        JSON.stringify(response.data, null, 2)
      );

      return response.data;
    } catch (error: any) {
      console.error("[ResourceLoader] Error details:", error);

      if (error.response) {
        console.error(
          "[ResourceLoader] Response status:",
          error.response.status
        );
        console.error(
          "[ResourceLoader] Response data:",
          JSON.stringify(error.response.data, null, 2)
        );
        throw new Error(
          `Failed to load resource: ${error.response.status} ${
            error.response.statusText
          }\nDetails: ${JSON.stringify(error.response.data, null, 2)}`
        );
      }
      throw new Error(`Failed to load resource: ${error.message}`);
    }
  }
}
