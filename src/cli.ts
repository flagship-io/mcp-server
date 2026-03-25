#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { parseArgs } from "node:util";

import { registerDecisionAPIServer } from "./tools/decision-api.js";
import { registerQuickGuidesPrompts } from "./prompts/quickstart-guide.js";
import { registerDocResources as registerFlagshipDocResources } from "./resources/documentation.js";
import { registerResourceLoaderAPIServer } from "./tools/resource-loader-api.js";
import { registerResourceLoaderPrompts } from "./prompts/resource-loader-prompts.js";
import { registerCodebaseAnalyzerServer } from "./tools/codebase-analyzer.js";
import { registerCodebaseAnalyzerPrompts } from "./prompts/codebase-analyzer-prompts.js";
import { FlagshipConfig } from "../types/abtasty-fear.js";
import { ResourceLoaderConfig } from "../types/resource-loader.js";

import { VERSION } from "../version.js";

// Parse command-line arguments
const { values } = parseArgs({
  options: {
    "fear-env-id": {
      type: "string"
    },
    "fear-api-key": {
      type: "string"
    },
    "resource-loader-we-account-id": {
      type: "string"
    },
    "resource-loader-we-token": {
      type: "string"
    },
    "resource-loader-fear-account-id": {
      type: "string"
    },
    "resource-loader-fear-account-environment-id": {
      type: "string"
    },
    "resource-loader-fear-rca-token": {
      type: "string"
    }
  },
  allowPositionals: true
});

// Create configurations from CLI args
const flagshipConfig: FlagshipConfig = {
  env_id: values["fear-env-id"] || process.env.FEAR_ENV_ID || "",
  api_key: values["fear-api-key"] || process.env.FEAR_API_KEY || ""
};

const resourceLoaderConfig: ResourceLoaderConfig = {
  we_account_id:
    values["resource-loader-we-account-id"] ||
    process.env.RESOURCE_LOADER_WE_ACCOUNT_ID ||
    "",
  we_token:
    values["resource-loader-we-token"] ||
    process.env.RESOURCE_LOADER_WE_TOKEN ||
    "",
  fear_rca_account_id:
    values["resource-loader-fear-account-id"] ||
    process.env.RESOURCE_LOADER_FEAR_ACCOUNT_ID ||
    "",
  fear_rca_account_environment_id:
    values["resource-loader-fear-account-environment-id"] ||
    process.env.RESOURCE_LOADER_FEAR_ACCOUNT_ENVIRONMENT_ID ||
    "",
  fear_rca_token:
    values["resource-loader-fear-rca-token"] ||
    process.env.RESOURCE_LOADER_FEAR_RCA_TOKEN ||
    ""
};

// Log configuration
console.error("=".repeat(60));
console.error("AB Tasty MCP Server - CLI Mode");
console.error(`  FE&R Environment ID: ${flagshipConfig.env_id || "(not set)"}`);
console.error(
  `  FE&R API Key: ${
    flagshipConfig.api_key
      ? flagshipConfig.api_key.substring(0, 8) + "..."
      : "(not set)"
  }`
);
console.error(
  `  Resource Loader WE Account ID: ${
    resourceLoaderConfig.we_account_id || "(not set)"
  }`
);
console.error(
  `  Resource Loader WE Token: ${
    resourceLoaderConfig.we_token
      ? resourceLoaderConfig.we_token.substring(0, 8) + "..."
      : "(not set)"
  }`
);
console.error(
  `  Resource Loader FE&R Account ID: ${
    resourceLoaderConfig.fear_rca_account_id || "(not set)"
  }`
);
console.error(
  `  Resource Loader FE&R Env ID: ${
    resourceLoaderConfig.fear_rca_account_environment_id || "(not set)"
  }`
);
console.error(
  `  Resource Loader FE&R Token: ${
    resourceLoaderConfig.fear_rca_token
      ? resourceLoaderConfig.fear_rca_token.substring(0, 8) + "..."
      : "(not set)"
  }`
);
console.error("=".repeat(60));

if (!flagshipConfig.env_id || !flagshipConfig.api_key) {
  console.error("WARNING: FE&R credentials not properly configured!");
  console.error("Please provide --fear-env-id and --fear-api-key arguments.");
}

// Create the MCP server
const server = new McpServer({
  name: "ABTasty",
  version: VERSION,
  description: "MCP Server integrating AB Tasty features"
});

// Register all tools, prompts, and resources
await registerDecisionAPIServer(server, flagshipConfig);
await registerQuickGuidesPrompts(server, flagshipConfig);
await registerFlagshipDocResources(server);

await registerResourceLoaderAPIServer(server, resourceLoaderConfig);
await registerResourceLoaderPrompts(server);

await registerCodebaseAnalyzerServer(server);
await registerCodebaseAnalyzerPrompts(server);

// Create stdio transport and connect
const transport = new StdioServerTransport();
await server.connect(transport);

console.error("AB Tasty MCP Server running on stdio");
