import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FlagshipConfig } from "../../types/flagship.js";
import { FlagshipClient } from "../../helpers/flagship.js";

export async function registerDecisionAPIServer(
  server: McpServer,
  config: FlagshipConfig
) {
  const flagshipClient = new FlagshipClient(config);

  // Add a get_campaigns tool
  server.registerTool(
    "decision_api_get_campaigns",
    {
      title: "Get Campaigns",
      description:
        "Get all campaigns (feature flags) for a visitor with their context. Returns campaign variations and modifications.",
      inputSchema: {
        visitor_id: z
          .string()
          .describe("The unique identifier for the visitor"),
        context: z
          .record(z.any())
          .describe("The visitor context (key-value pairs for targeting)"),
        trigger_hit: z
          .boolean()
          .describe("Whether to send a hit to analytics (default: false)"),
      },
    },
    async ({ visitor_id, context, trigger_hit }) => {
      if (!visitor_id) {
        throw new Error("visitor_id is required");
      }

      console.error(`[Tool] get_campaigns called for visitor: ${visitor_id}`);
      console.error(`[Tool] Context:`, JSON.stringify(context || {}));
      console.error(`[Tool] Trigger hit:`, trigger_hit || false);

      try {
        const response = await flagshipClient.getCampaigns({
          visitor_id,
          context,
          trigger_hit: trigger_hit || false,
        });

        console.error(
          `[Tool] Successfully retrieved ${
            response?.campaigns?.length || 0
          } campaigns`
        );

        return {
          content: [
            {
              type: "text",
              text: `Campaigns for visitor: ${visitor_id}\n\n${JSON.stringify(
                response,
                null,
                2
              )}`,
            },
          ],
        };
      } catch (error) {
        console.error(`[Tool] Error getting campaigns:`, error);
        throw error;
      }
    }
  );

  // Add a get_flags tool
  server.registerTool(
    "decision_api_get_flags",
    {
      title: "Get Flags",
      description:
        "Get all feature flags with their values and metadata for a visitor. Returns a simplified key-value format.",
      inputSchema: {
        visitor_id: z
          .string()
          .describe("The unique identifier for the visitor"),
        context: z
          .record(z.any())
          .describe("The visitor context (key-value pairs for targeting)"),
        trigger_hit: z
          .boolean()
          .describe("Whether to send a hit to analytics (default: false)"),
      },
    },
    async ({ visitor_id, context, trigger_hit }) => {
      if (!visitor_id) {
        throw new Error("visitor_id is required");
      }

      console.error(`[Tool] get_flags called for visitor: ${visitor_id}`);
      console.error(`[Tool] Context:`, JSON.stringify(context || {}));
      console.error(`[Tool] Trigger hit:`, trigger_hit || false);

      try {
        const flags = await flagshipClient.getFlags({
          visitor_id,
          context,
          trigger_hit: trigger_hit || false,
        });

        console.error(
          `[Tool] Successfully retrieved ${Object.keys(flags).length} flags`
        );

        return {
          content: [
            {
              type: "text",
              text: `Feature flags for visitor: ${visitor_id}\n\n${JSON.stringify(
                flags,
                null,
                2
              )}`,
            },
          ],
        };
      } catch (error) {
        console.error(`[Tool] Error getting flags:`, error);
        throw error;
      }
    }
  );

  server.registerTool(
    "decision_api_get_campaign",
    {
      title: "Get Campaign",
      description:
        "Get a specific campaign by its ID for a visitor with their context. Returns campaign variation and modifications.",
      inputSchema: {
        visitor_id: z
          .string()
          .describe("The unique identifier for the visitor"),
        campaign_id: z
          .string()
          .describe("The unique identifier for the campaign"),
        context: z
          .record(z.any())
          .describe("The visitor context (key-value pairs for targeting)"),
        trigger_hit: z
          .boolean()
          .describe("Whether to send a hit to analytics (default: false)"),
      },
    },
    async ({ visitor_id, campaign_id, context, trigger_hit }) => {
      if (!visitor_id) {
        throw new Error("visitor_id is required");
      }
      if (!campaign_id) {
        throw new Error("campaign_id is required");
      }

      console.error(
        `[Tool] get_campaign called for visitor: ${visitor_id}, campaign: ${campaign_id}`
      );
      console.error(`[Tool] Context:`, JSON.stringify(context || {}));
      console.error(`[Tool] Trigger hit:`, trigger_hit || false);

      try {
        const response = await flagshipClient.getCampaign({
          visitor_id,
          campaign_id,
          context,
          trigger_hit: trigger_hit || false,
        });

        console.error(`[Tool] Successfully retrieved campaign`);

        return {
          content: [
            {
              type: "text",
              text: `Campaign ${campaign_id} for visitor: ${visitor_id}\n\n${JSON.stringify(
                response,
                null,
                2
              )}`,
            },
          ],
        };
      } catch (error) {
        console.error(`[Tool] Error getting campaign:`, error);
        throw error;
      }
    }
  );

  // Add an activate_campaign tool
  server.registerTool(
    "decision_api_activate_campaign",
    {
      title: "Activate Campaign",
      description:
        "Activate a campaign by sending an activation hit for a visitor.",
      inputSchema: {
        visitor_id: z
          .string()
          .describe("The unique identifier for the visitor"),
        variation_group_id: z
          .string()
          .describe("The unique identifier for the variation group"),
        variation_id: z
          .string()
          .describe("The unique identifier for the variation"),
      },
    },
    async ({ visitor_id, variation_group_id, variation_id }) => {
      if (!visitor_id) {
        throw new Error("visitor_id is required");
      }
      if (!variation_group_id) {
        throw new Error("variation_group_id is required");
      }
      if (!variation_id) {
        throw new Error("variation_id is required");
      }

      console.error(
        `[Tool] activate_campaign called for visitor: ${visitor_id}, variation_group: ${variation_group_id}, variation: ${variation_id}`
      );

      try {
        await flagshipClient.activateCampaign(
          visitor_id,
          variation_group_id,
          variation_id
        );

        console.error(`[Tool] Successfully activated campaign`);

        return {
          content: [
            {
              type: "text",
              text: `Successfully activated campaign for visitor: ${visitor_id}\nVariation Group: ${variation_group_id}\nVariation: ${variation_id}`,
            },
          ],
        };
      } catch (error) {
        console.error(`[Tool] Error activating campaign:`, error);
        throw error;
      }
    }
  );

  // Add a dynamic environment info resource
  server.registerResource(
    "decision_api_environment_info",
    new ResourceTemplate("flagship://environment/info", { list: undefined }),
    {
      title: "Environment Info Resource", // Display name for UI
      description:
        "Provides information about the Flagship environment configuration.",
    },
    async (uri) => {
      try {
        const environment = await flagshipClient.loadEnvironment();

        const info = {
          environment_id: config.env_id,
          panic_mode: environment?.isPanic || false,
          campaigns_count: environment?.campaigns?.length || 0,
          campaigns:
            environment?.campaigns?.map((c: any) => ({
              id: c.id,
              name: c.name,
              type: c.type,
            })) || [],
        };

        return {
          contents: [
            {
              uri: uri.href,
              mimeType: "application/json",
              text: JSON.stringify(info, null, 2),
            },
          ],
        };
      } catch (error: any) {
        throw new Error(`Failed to load environment info: ${error.message}`);
      }
    }
  );
}
