import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ResourceLoaderClient } from "../../helpers/resource-loader.js";
import { ResourceLoaderConfig } from "../../types/resource-loader.js";

/**
 * Registers the Resource Loader API tools and resources on the MCP server
 */

/**
 * Helper function to handle resource loading logic
 * @private
 */
async function handleResourceLoading(
  resourceLoaderContent: any,
  dryrun: boolean,
  loadFunction: (content: any) => Promise<any>
) {
  if (!resourceLoaderContent) {
    throw new Error("resourceLoaderContent is required");
  }

  console.error(`[Tool] load_resources called`);

  if (dryrun) {
    console.error(`[Tool] Dry run mode - not sending request`);
    return {
      content: [
        {
          type: "text" as const,
          text: `Dry run mode - resource loader content:\n\n${resourceLoaderContent}`
        }
      ]
    };
  }

  if (resourceLoaderContent.needs_clarification) {
    console.error(`[Tool] Resource loader content needs clarification`);
    return {
      content: [
        {
          type: "text" as const,
          text: `The provided resource loader content needs clarification. Please provide valid content.\n\nQuestions to clarify:\n\n
              ${resourceLoaderContent.questions
                .map((element: any, index: number) => {
                  return `${index + 1} - ${element}\n`;
                })
                .join("")}

              `
        }
      ]
    };
  }

  try {
    // Pass the entire resourceLoaderContent object to the loadFunction
    const response = await loadFunction(resourceLoaderContent);

    console.error(
      `[Tool] Successfully loaded resources with ${
        response?.results?.length || 0
      } results`
    );

    return {
      content: [
        {
          type: "text" as const,
          text: `Loaded resources:\n\n${JSON.stringify(response, null, 2)}`
        }
      ]
    };
  } catch (error) {
    console.error(`[Tool] Error loading resources:`, error);
    throw error;
  }
}

/**
 * Common input schema for resource loader tools
 */
const resourceLoaderInputSchema = {
  resourceLoaderContent: z
    .any()
    .describe("JSON containing resource loader content"),
  dryrun: z
    .boolean()
    .describe("Whether to simulate the request without sending it")
};

export async function registerResourceLoaderAPIServer(
  server: McpServer,
  config: ResourceLoaderConfig
) {
  const resourceLoaderClient = new ResourceLoaderClient(config);

  // Add a we_load_resources tool
  server.registerTool(
    "resource_loader_api_load_webexp_resources",
    {
      title: "Load Web Experimentation & Personalization Resources",
      description:
        "Load Web experimentation resource loader content via the Resource Loader API. Returns the loaded resources results.",
      inputSchema: resourceLoaderInputSchema
    },
    async ({ resourceLoaderContent, dryrun }) =>
      handleResourceLoading(resourceLoaderContent, dryrun, (content) =>
        resourceLoaderClient.loadWebExpResources(content)
      )
  );

  // Add a fe_load_resources tool
  server.registerTool(
    "resource_loader_api_load_featexp_resources",
    {
      title: "Load Feature Experimentation and Rollout Resources",
      description:
        "Load Feature experimentation resource loader content via the Resource Loader API. Returns the loaded resources results.",
      inputSchema: resourceLoaderInputSchema
    },
    async ({ resourceLoaderContent, dryrun }) =>
      await handleResourceLoading(resourceLoaderContent, dryrun, (content) =>
        resourceLoaderClient.loadFeatureExpResources(content)
      )
  );
}
