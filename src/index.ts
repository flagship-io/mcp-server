import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { FlagshipConfig } from "../types/abtasty_fear.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import { randomUUID } from "crypto";
import { registerDecisionAPIServer } from "./tools/decision-api.js";
import { registerQuickGuidesPrompts } from "./prompts/quickstart-guide.js";
import { registerDocResources as registerFlagshipDocResources } from "./resources/documentation.js";
import { ResourceLoaderConfig } from "../types/resourceLoader.js";
import { registerResourceLoaderAPIServer } from "./tools/resource-loader-api.js";
import { registerResourceLoaderPrompts } from "./prompts/campaign-intaker.js";

// Set up Express and HTTP transport
const app = express();
app.use(express.json());

// Store server instances per session - each session gets isolated credentials
interface SessionData {
  transport: StreamableHTTPServerTransport;
  server: McpServer;
}
const sessions: { [sessionId: string]: SessionData } = {};

app.post("/mcp", async (req, res) => {
  try {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    let sessionData: SessionData;

    if (sessionId && sessions[sessionId]) {
      // Reuse existing session
      sessionData = sessions[sessionId];
    } else if (!sessionId) {
      // New session - create server with credentials from headers
      const flagshipConfig: FlagshipConfig = {
        env_id: (req.headers["x-fear-env-id"] as string) || "",
        api_key: (req.headers["x-fear-api-key"] as string) || "",
      };

      const resourceLoaderConfig: ResourceLoaderConfig = {
        we_account_id:
          (req.headers["x-resource-loader-we-account-id"] as string) || "",
        fear_rca_account_id:
          (req.headers["x-resource-loader-fear-account-id"] as string) || "",
        fear_rca_account_environment_id:
          (req.headers[
            "x-resource-loader-fear-account-environment-id"
          ] as string) || "",
        we_token: (req.headers["x-resource-loader-we-token"] as string) || "",
        fear_rca_token:
          (req.headers["x-resource-loader-fear-rca-token"] as string) || "",
      };

      // Log configuration (masking API key for security)
      console.error("=".repeat(60));
      console.error("FE&R MCP Server - New Session:");
      console.error(
        `  Environment ID: ${flagshipConfig.env_id || "(not set)"}`
      );
      console.error(
        `  API Key: ${
          flagshipConfig.api_key
            ? flagshipConfig.api_key.substring(0, 8) + "..."
            : "(not set)"
        }`
      );
      console.error("=".repeat(60));

      if (!flagshipConfig.env_id || !flagshipConfig.api_key) {
        console.error("WARNING: Flagship credentials not properly configured!");
        console.error(
          "Please provide x-fear-env-id and x-fear-api-key headers."
        );
      }

      // Create transport with session ID generator
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (newSessionId) => {
          // Store session data
          sessions[newSessionId] = sessionData;
          console.error(`Session initialized: ${newSessionId}`);
        },
        enableJsonResponse: true,
      });

      const server = new McpServer({
        name: "abtasty-mcp-server",
        version: "1.0.0",
        description: "MCP Server integrating AB Tasty features",
      });

      await registerDecisionAPIServer(server, flagshipConfig);
      await registerQuickGuidesPrompts(server, flagshipConfig);
      await registerFlagshipDocResources(server);

      await registerResourceLoaderAPIServer(server, resourceLoaderConfig);
      await registerResourceLoaderPrompts(server);

      sessionData = { transport, server };

      // Clean up on close
      transport.onclose = () => {
        if (transport.sessionId) {
          console.error(`Session closed: ${transport.sessionId}`);
          delete sessions[transport.sessionId];
        }
      };

      // Connect server to transport
      await server.connect(transport);
    } else {
      // Invalid: sessionId provided but not found
      res.status(400).json({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Invalid session ID",
        },
        id: null,
      });
      return;
    }

    // Handle the request
    await sessionData.transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("Error handling MCP request:", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Internal server error",
        },
        id: null,
      });
    }
  }
});

const port = parseInt(process.env.PORT || "3000");
app
  .listen(port, () => {
    console.log(`Demo MCP Server running on http://localhost:${port}/mcp`);
  })
  .on("error", (error) => {
    console.error("Server error:", error);
    process.exit(1);
  });
