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
  loadFunction: (content: any) => Promise<any>,
  promptName: string
) {
  if (!resourceLoaderContent) {
    throw new Error("resourceLoaderContent is required");
  }

  console.error(`[Tool] load_resources called`);

  // Validate the structure - must have resources array
  if (
    !resourceLoaderContent.resources ||
    !Array.isArray(resourceLoaderContent.resources)
  ) {
    console.error(
      `[Tool] Invalid resourceLoaderContent structure - missing or invalid 'resources' array`
    );
    return {
      content: [
        {
          type: "text" as const,
          text: `❌ ERROR: Invalid resource loader content structure.

The resourceLoaderContent must be generated using the '${promptName}' prompt.

Expected structure:
{
  "needs_clarification": boolean,
  "questions": string[],
  "resources": [
    {
      "type": "project|campaign|flag|goal|targeting-key|variation|modification",
      "$_ref": "reference_id",
      "action": "create|update|delete",
      "payload": { ... }
    }
  ]
}

🔧 How to fix:
1. Use the '${promptName}' prompt with your campaign brief
2. The prompt will generate the correct JSON structure
3. Pass that JSON as the resourceLoaderContent parameter

Your current structure is missing the 'resources' array or has an incorrect format.`
        }
      ]
    };
  }

  // Validate each resource has the correct structure
  const invalidResources = resourceLoaderContent.resources.filter(
    (resource: any, index: number) => {
      const hasType = typeof resource.type === "string";
      const hasRef = typeof resource.$_ref === "string";
      const hasAction = typeof resource.action === "string";
      const hasPayload = typeof resource.payload === "object";

      if (!hasType || !hasRef || !hasAction || !hasPayload) {
        console.error(`[Tool] Invalid resource at index ${index}:`, {
          hasType,
          hasRef,
          hasAction,
          hasPayload,
          resource
        });
        return true;
      }
      return false;
    }
  );

  if (invalidResources.length > 0) {
    console.error(
      `[Tool] Found ${invalidResources.length} invalid resource(s)`
    );
    return {
      content: [
        {
          type: "text" as const,
          text: `❌ ERROR: Invalid resource structure detected.

Each resource in the 'resources' array must have ALL of these properties:
- "type": string (e.g., "campaign", "project", "flag")
- "$_ref": string (e.g., "c1", "p1")
- "action": string (e.g., "create", "update")
- "payload": object (resource-specific data)

🔧 How to fix:
Use the '${promptName}' prompt to generate the correct structure.

Example of CORRECT resource format:
{
  "type": "campaign",
  "$_ref": "c1",
  "action": "create",
  "payload": {
    "name": "My Campaign",
    ...
  }
}

Example of INCORRECT formats (DO NOT USE):
❌ {"projects": [...]}
❌ {"campaign": {"c1": {...}}}
❌ {"name": "...", "type": "..."}

Found ${invalidResources.length} invalid resource(s) in your request.`
        }
      ]
    };
  }

  if (dryrun) {
    console.error(`[Tool] Dry run mode - not sending request`);
    return {
      content: [
        {
          type: "text" as const,
          text: `✅ Dry run mode - resource loader content validated successfully:\n\n${JSON.stringify(resourceLoaderContent, null, 2)}`
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
    // Pass the resources array from resourceLoaderContent to the loadFunction
    const response = await loadFunction(resourceLoaderContent.resources);

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
    .object({
      needs_clarification: z
        .boolean()
        .describe("Whether clarification is needed"),
      questions: z
        .array(z.string())
        .describe("Array of clarification questions"),
      resources: z
        .array(
          z.object({
            type: z
              .string()
              .describe("Resource type (e.g., 'campaign', 'project', 'flag')"),
            $_ref: z
              .string()
              .describe("Resource reference ID (e.g., 'c1', 'p1')"),
            action: z
              .string()
              .describe("Action to perform (e.g., 'create', 'update')"),
            payload: z.record(z.any()).describe("Resource-specific data")
          })
        )
        .describe("Array of resource operations"),
      version: z
        .number()
        .optional()
        .describe("Version number (required for Feature Experimentation)")
    })
    .describe(
      "Resource loader content generated by the corresponding resource extractor prompt. Must include 'resources' array with properly structured resource objects."
    ),
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
        "Load Web experimentation resource loader content via the Resource Loader API. Returns the loaded resources results. IMPORTANT: You MUST use the 'we_resource_extractor' prompt first to generate the resourceLoaderContent parameter from the user's campaign brief. Do NOT construct the JSON manually.",
      inputSchema: resourceLoaderInputSchema
    },
    async ({ resourceLoaderContent, dryrun }) =>
      handleResourceLoading(
        resourceLoaderContent,
        dryrun,
        (content) => resourceLoaderClient.loadWebExpResources(content),
        "we_resource_extractor"
      )
  );

  // Add a fe_load_resources tool
  server.registerTool(
    "resource_loader_api_load_featexp_resources",
    {
      title: "Load Feature Experimentation and Rollout Resources",
      description:
        "Load Feature experimentation resource loader content via the Resource Loader API. Returns the loaded resources results. IMPORTANT: You MUST use the 'fear_resource_extractor' prompt first to generate the resourceLoaderContent parameter from the user's campaign brief. Do NOT construct the JSON manually.",
      inputSchema: resourceLoaderInputSchema
    },
    async ({ resourceLoaderContent, dryrun }) =>
      await handleResourceLoading(
        resourceLoaderContent,
        dryrun,
        (content) => resourceLoaderClient.loadFeatureExpResources(content),
        "fear_resource_extractor"
      )
  );
}
