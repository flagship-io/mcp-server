import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { GENERATED_PROMPTS } from "../prompts/generated/codebaseAnalyzer.generated.js";

/**
 * Registers codebase analyzer prompts as MCP prompts
 */
export async function registerCodebaseAnalyzerPrompts(
  server: McpServer
): Promise<void> {
  try {
    console.error(
      `Loading ${GENERATED_PROMPTS.length} codebase analyzer prompt(s)...`
    );

    for (const prompt of GENERATED_PROMPTS) {
      console.error(`  - Registering prompt: ${prompt.name}`);

      server.registerPrompt(
        prompt.name,
        {
          title: prompt.title,
          description: prompt.description
        },
        async () => {
          return {
            messages: [
              {
                role: "assistant",
                content: {
                  type: "text",
                  text: "After analyzing the codebase, use the `codebase_analyzer_analyze` MCP tool to scan the directory for feature flag usage."
                }
              },
              {
                role: "user",
                content: {
                  type: "text",
                  text: prompt.content
                }
              }
            ]
          };
        }
      );
    }

    console.error("✓ All codebase analyzer prompts registered successfully");
  } catch (error) {
    console.error("Error registering codebase analyzer prompts:", error);
    throw error;
  }
}
