#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { parseArgs } from "node:util";
import type { FlagshipConfig } from "../types/flagship.js";
import type { ResourceLoaderConfig } from "../types/resourceLoader.js";
import { registerDecisionAPIServer } from "./tools/decision-api.js";
import { registerQuickGuidesPrompts } from "./prompts/quickstart-guide.js";
import { registerDocResources as registerFlagshipDocResources } from "./resources/documentation.js";
import { registerResourceLoaderAPIServer } from "./tools/resource-loader-api.js";
import { registerResourceLoaderPrompts } from "./prompts/campaign-intaker.js";

// Parse command-line arguments
const { values } = parseArgs({
  options: {
    "flagship-env-id": {
      type: "string",
    },
    "flagship-api-key": {
      type: "string",
    },
    "resource-loader-account-id": {
      type: "string",
    },
    "resource-loader-token": {
      type: "string",
    },
  },
  allowPositionals: true,
});

// Create configurations from CLI args
const flagshipConfig: FlagshipConfig = {
  env_id: values["flagship-env-id"] || process.env.FLAGSHIP_ENV_ID || "",
  api_key: values["flagship-api-key"] || process.env.FLAGSHIP_API_KEY || "",
};

const resourceLoaderConfig: ResourceLoaderConfig = {
  account_id:
    values["resource-loader-account-id"] ||
    process.env.RESOURCE_LOADER_ACCOUNT_ID ||
    "",
  token:
    values["resource-loader-token"] || process.env.RESOURCE_LOADER_TOKEN || "",
};

// Log configuration
console.error("=".repeat(60));
console.error("AB Tasty MCP Server - CLI Mode");
console.error(`  Environment ID: ${flagshipConfig.env_id || "(not set)"}`);
console.error(
  `  API Key: ${
    flagshipConfig.api_key
      ? flagshipConfig.api_key.substring(0, 8) + "..."
      : "(not set)"
  }`
);
console.error(
  `  Resource Loader Account ID: ${
    resourceLoaderConfig.account_id || "(not set)"
  }`
);
console.error(
  `  Resource Loader Token: ${
    resourceLoaderConfig.token
      ? resourceLoaderConfig.token.substring(0, 8) + "..."
      : "(not set)"
  }`
);
console.error("=".repeat(60));

if (!flagshipConfig.env_id || !flagshipConfig.api_key) {
  console.error("WARNING: Flagship credentials not properly configured!");
  console.error(
    "Please provide --flagship-env-id and --flagship-api-key arguments."
  );
}

// Create the MCP server
const server = new McpServer({
  name: "ABTasty",
  version: "0.1.0",
  description: "MCP Server integrating AB Tasty features",
});

// Register all tools, prompts, and resources
await registerDecisionAPIServer(server, flagshipConfig);
await registerQuickGuidesPrompts(server, flagshipConfig);
await registerFlagshipDocResources(server, flagshipConfig);

await registerResourceLoaderAPIServer(server, resourceLoaderConfig);
await registerResourceLoaderPrompts(server);

// Create stdio transport and connect
const transport = new StdioServerTransport();
await server.connect(transport);

console.error("AB Tasty MCP Server running on stdio");
