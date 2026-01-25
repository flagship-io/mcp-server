import {
  McpServer,
  ResourceTemplate
} from "@modelcontextprotocol/sdk/server/mcp.js";

interface DocResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

const NODEJS_DOCS: DocResource[] = [
  {
    uri: "docs://nodejs/installation",
    name: "Node.js SDK Installation",
    description: "Installation guide for the Flagship Node.js SDK",
    mimeType: "text/html"
  },
  {
    uri: "docs://nodejs/quick-start",
    name: "Node.js SDK Quick Start",
    description: "Quick start guide for the Flagship Node.js SDK",
    mimeType: "text/html"
  },
  {
    uri: "docs://nodejs/reference",
    name: "Node.js SDK Reference",
    description: "Complete API reference for the Flagship Node.js SDK",
    mimeType: "text/html"
  },
  {
    uri: "docs://nodejs/github",
    name: "Flagship TypeScript SDK Repository",
    description: "Official GitHub repository for the Flagship TypeScript SDK",
    mimeType: "text/html"
  }
];

const DOC_URL_MAP: Record<string, string> = {
  "docs://nodejs/installation":
    "https://docs.abtasty.com/server-side/sdks/js-sdk/javascript-installation",
  "docs://nodejs/quick-start":
    "https://docs.abtasty.com/server-side/sdks/js-sdk/javascript-quick-start",
  "docs://nodejs/reference":
    "https://docs.abtasty.com/server-side/sdks/js-sdk/js-reference",
  "docs://nodejs/github": "https://github.com/flagship-io/flagship-ts-sdk"
};

export async function registerDocResources(server: McpServer): Promise<void> {
  // Register documentation resources
  for (const doc of NODEJS_DOCS) {
    server.registerResource(
      `doc_${doc.uri.replace(/[^a-zA-Z0-9]/g, "_")}`,
      new ResourceTemplate(doc.uri, { list: undefined }),
      {
        title: doc.name,
        description: doc.description
      },
      async (uri) => {
        const actualUrl = DOC_URL_MAP[uri.href];

        if (!actualUrl) {
          throw new Error(`No URL mapping found for resource: ${uri.href}`);
        }

        try {
          const response = await fetch(actualUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch resource: ${response.statusText}`);
          }

          const content = await response.text();

          return {
            contents: [
              {
                uri: uri.href,
                mimeType: doc.mimeType,
                text: content
              }
            ]
          };
        } catch (error) {
          throw new Error(
            `Failed to fetch resource ${actualUrl}: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        }
      }
    );
  }

  console.error(`✓ Registered ${NODEJS_DOCS.length} documentation resources`);
}
