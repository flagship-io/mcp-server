import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { GENERATED_PROMPTS } from "../prompts/generated/resourceLoader.generated.js";

/**
 * Registers all generated prompts as MCP prompts
 */
export async function registerResourceLoaderPrompts(
  server: McpServer
): Promise<void> {
  try {
    console.error(`Loading ${GENERATED_PROMPTS.length} prompt(s)...`);

    for (const prompt of GENERATED_PROMPTS) {
      console.error(`  - Registering prompt: ${prompt.name}`);

      // Build the args schema from metadata
      const argsSchema: Record<string, z.ZodTypeAny> = {};

      server.registerPrompt(
        prompt.name,
        {
          title: prompt.title,
          description: prompt.description,
          argsSchema:
            Object.keys(argsSchema).length > 0 ? argsSchema : undefined
        },
        async () => {
          // Replace any argument placeholders in the content
          let content = prompt.content;

          return {
            messages: [
              {
                role: "assistant",
                content: {
                  type: "text",
                  text: "After generating the resource JSON, call the appropriate MCP tool to load the resources: Use `resource_loader_api_load_webexp_resources` for Web Experimentation campaigns or `resource_loader_api_load_featexp_resources` for Feature Experimentation campaigns."
                }
              },
              {
                role: "user",
                content: {
                  type: "text",
                  text: content
                }
              }
            ]
          };
        }
      );
    }

    console.error("✓ All prompts registered successfully");
  } catch (error) {
    console.error("Error registering prompts:", error);
    throw error;
  }
}
