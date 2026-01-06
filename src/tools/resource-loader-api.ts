import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ResourceLoaderClient } from "../../helpers/resourceLoader.js";
import { ResourceLoaderConfig } from "../../types/resourceLoader.js";

/**
 * Registers the Resource Loader API tools and resources on the MCP server
 */

export async function registerResourceLoaderAPIServer(
  server: McpServer,
  config: ResourceLoaderConfig
) {
  const resourceLoaderClient = new ResourceLoaderClient(config);

  // Add a load_resources tool
  server.registerTool(
    "resource_loader_api-load",
    {
      title: "Load Resources",
      description:
        "Load resource loader content via the Resource Loader API. Returns the loaded resources results.",
      inputSchema: {
        resourceLoaderContent: z
          .any()
          .describe("JSON containing resource loader content"),
        dryrun: z
          .boolean()
          .describe("Whether to simulate the request without sending it"),
      },
    },
    async ({ resourceLoaderContent, dryrun }) => {
      if (!resourceLoaderContent) {
        throw new Error("resourceLoaderContent is required");
      }

      console.error(`[Tool] load_resources called`);

      if (dryrun) {
        console.error(`[Tool] Dry run mode - not sending request`);
        return {
          content: [
            {
              type: "text",
              text: `Dry run mode - resource loader content:\n\n${resourceLoaderContent}`,
            },
          ],
        };
      }

      if (resourceLoaderContent.needs_clarification) {
        console.error(`[Tool] Resource loader content needs clarification`);
        return {
          content: [
            {
              type: "text",
              text: `The provided resource loader content needs clarification. Please provide valid content.\n\nQuestions to clarify:\n\n
              ${resourceLoaderContent.questions
                .map((element: any, index: number) => {
                  return `${index + 1} - ${element}\n`;
                })
                .join("")}

              `,
            },
          ],
        };
      }

      try {
        const response = await resourceLoaderClient.loadResources(
          resourceLoaderContent.payload
        );

        console.error(
          `[Tool] Successfully loaded resources with ${
            response?.results?.length || 0
          } results`
        );

        return {
          content: [
            {
              type: "text",
              text: `Loaded resources:\n\n${JSON.stringify(response, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        console.error(`[Tool] Error loading resources:`, error);
        throw error;
      }
    }
  );
}
