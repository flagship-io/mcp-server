import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { GENERATED_PROMPTS } from "../prompts/generated/quickGuides.generated.js";
import { FlagshipConfig } from "../../types/abtasty-fear.js";

/**
 * Registers all generated prompts as MCP prompts
 */
export async function registerQuickGuidesPrompts(
  server: McpServer,
  config: FlagshipConfig
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
        async (args: Record<string, string>) => {
          // Replace any argument placeholders in the content
          let content = prompt.content;

          // Replace placeholders with config values if available
          if (config.env_id) {
            content = content.replace(/<ENV_ID>/g, config.env_id);
          }

          if (config.api_key) {
            content = content.replace(/<API_KEY>/g, config.api_key);
          }

          // Replace visitor ID if provided in args
          if (args?.visitor_id) {
            content = content.replace(/<VISITOR_ID>/g, args.visitor_id);
          }

          // Replace any other custom argument placeholders
          for (const [key, value] of Object.entries(args || {})) {
            if (value && key !== "visitor_id") {
              const placeholder = `<${key.toUpperCase()}>`;
              content = content.replace(new RegExp(placeholder, "g"), value);
            }
          }

          return {
            messages: [
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
