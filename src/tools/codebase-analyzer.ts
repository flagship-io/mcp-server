import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * Registers the Codebase Analyzer tools on the MCP server.
 *
 * Uses the @abtasty/codebase-analyzer-typescript package to scan
 * directories for feature flag usage across AB Tasty and competitor SDKs.
 */
export async function registerCodebaseAnalyzerServer(
  server: McpServer
): Promise<void> {
  // Tool: analyze a codebase directory for feature flags
  server.registerTool(
    "codebase_analyzer_analyze",
    {
      title: "Analyze Codebase for Feature Flags",
      description:
        "Scan a directory for feature flag usage across AB Tasty (Flagship SDK) and competitor platforms (LaunchDarkly, OpenFeature, Optimizely, Split, VWO). Returns detected flags with their keys, default values, types, and file locations.",
      inputSchema: {
        directory: z
          .string()
          .describe("Absolute path to the directory to scan for feature flags"),
        platform: z
          .enum(["launchdarkly", "openfeature", "optimizely", "split", "vwo"])
          .optional()
          .describe(
            "Optional competitor platform to detect. If not provided, scans for AB Tasty / Flagship SDK patterns only."
          ),
        repository_url: z
          .string()
          .optional()
          .describe(
            "Optional repository URL for generating file links in results (e.g., https://github.com/org/repo)"
          ),
        repository_branch: z
          .string()
          .optional()
          .describe("Optional branch name for file links (defaults to 'main')")
      }
    },
    async ({ directory, platform, repository_url, repository_branch }) => {
      if (!directory) {
        throw new Error("directory is required");
      }

      console.error(`[Tool] codebase_analyzer_analyze called`);
      console.error(`[Tool] Directory: ${directory}`);
      if (platform) console.error(`[Tool] Platform: ${platform}`);

      let analyzer: any;
      try {
        analyzer = await import("@abtasty/codebase-analyzer-typescript");
      } catch {
        return {
          content: [
            {
              type: "text" as const,
              text: `❌ ERROR: @abtasty/codebase-analyzer-typescript package not found.

Install it with:
  npm install @abtasty/codebase-analyzer-typescript

Or install globally:
  npm install -g @abtasty/codebase-analyzer-typescript`
            }
          ]
        };
      }

      try {
        const configOptions: Record<string, any> = {
          directory,
          repositoryURL: repository_url || "https://github.com/example/repo",
          repositoryBranch: repository_branch || "main"
        };

        // Load competitor platform regexes if specified
        if (platform) {
          const platformRegexes = analyzer.getPlatformRegexes(platform);
          if (!platformRegexes) {
            return {
              content: [
                {
                  type: "text" as const,
                  text: `❌ ERROR: Unknown platform "${platform}". Available platforms: launchdarkly, openfeature, optimizely, split, vwo`
                }
              ]
            };
          }
          configOptions.searchCustomRegex = JSON.stringify(platformRegexes);
          console.error(
            `[Tool] Loaded regex patterns for platform: ${platform}`
          );
        }

        const config = analyzer.createConfig(configOptions);
        const results = analyzer.extractFlagsInfo(config);

        // Build summary
        let totalFlags = 0;
        const filesWithFlags: any[] = [];

        for (const fileResult of results) {
          if (fileResult.results && fileResult.results.length > 0) {
            filesWithFlags.push(fileResult);
            totalFlags += fileResult.results.length;
          }
        }

        // Build response
        const summary: Record<string, any> = {
          total_flags: totalFlags,
          files_with_flags: filesWithFlags.length,
          total_files_scanned: results.length
        };

        // Group by type
        const byType: Record<string, number> = {};
        for (const f of filesWithFlags) {
          for (const flag of f.results) {
            byType[flag.flagType] = (byType[flag.flagType] || 0) + 1;
          }
        }
        summary.flags_by_type = byType;

        const response = {
          summary,
          files: filesWithFlags.map((f: any) => ({
            file: f.file,
            fileURL: f.fileURL,
            flags: f.results.map((flag: any) => ({
              flagKey: flag.flagKey,
              flagDefaultValue: flag.flagDefaultValue,
              flagType: flag.flagType,
              lineNumber: flag.lineNumber
            }))
          }))
        };

        console.error(
          `[Tool] Analysis complete: ${totalFlags} flag(s) in ${filesWithFlags.length} file(s) (${results.length} files scanned)`
        );

        return {
          content: [
            {
              type: "text" as const,
              text: `Codebase analysis results for: ${directory}${
                platform ? ` (platform: ${platform})` : ""
              }\n\n${JSON.stringify(response, null, 2)}`
            }
          ]
        };
      } catch (error) {
        console.error(`[Tool] Error analyzing codebase:`, error);
        throw error;
      }
    }
  );
}
