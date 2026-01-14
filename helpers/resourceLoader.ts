import axios, { AxiosInstance } from "axios";
import { ResourceLoaderConfig } from "../types/resourceLoader.js";

/**
 * Resource Loader API Client
 * Handles communication with the Resource Loader API
 */
export class ResourceLoaderClient {
  private config: ResourceLoaderConfig;
  private client: AxiosInstance;

  constructor(config: ResourceLoaderConfig) {
    this.config = {
      account_id: config.account_id,
      account_environment_id: config.account_environment_id,
      token: config.token,
    };

    this.client = axios.create({
      baseURL: "https://resource-loader-api.abtasty.com/v1",
      headers: {
        Authorization: "Bearer " + this.config.token,
        "x-sdk-client": "abtasty-mcp-server",
        "x-sdk-version": "0.1.0",
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Load resources via Resource Loader API
   */
  async loadResources(resourceLoaderContent: any): Promise<any> {
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

      const response = await this.client.post(
        `/web-exp/resource-loader`,
        payload,
        {
          params: {
            account_id: this.config.account_id,
          },
        }
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
