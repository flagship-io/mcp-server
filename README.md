# AB Tasty MCP Server

A Model Context Protocol (MCP) server that integrates AB Tasty's Feature Experimentation & Rollouts platform with AI assistants. This server provides tools for feature flag management, campaign retrieval, and guided SDK integration through the MCP protocol.

## Features

### Tools

- **Decision API Integration**: Retrieve campaigns and feature flags for visitors

  - `decision_api_get_campaigns`: Get all campaigns for a visitor with context
  - `decision_api_get_campaign`: Get a specific campaign by ID for a visitor
  - `decision_api_get_flags`: Get all feature flags for a visitor
  - `decision_api_activate_campaign`: Activate a campaign for a visitor

- **Resource Loader API**: Extract and analyze campaign configurations
  - `resource_loader_api-load`: Load campaign details and variations

### Prompts

- **Quick Start Guides**: Interactive prompts for AB Tasty SDK installation
  - Node.js SDK installation guide
- **Campaign Intaker**: Guided campaign configuration extraction and analysis

### Resources

- **Documentation**: Access to AB Tasty Flagship documentation directly through MCP

## Prerequisites

- Node.js 18+
- npm or yarn
- AB Tasty credentials:
  - Environment ID
  - API Key
  - (Optional) Account ID and token for Resource Loader features for Web Experimentation

## Installation

1. Clone the repository:

```bash
git clone https://github.com/flagship-io/mcp-server.git
cd mcp-server
```

2. Install dependencies:

```bash
yarn install
```

3. Build the project:

```bash
yarn build
```

## Usage

### Running the Server

Start the server on the default port (3000):

```bash
yarn start
```

Or specify a custom port:

```bash
PORT=8080 yarn start
```

The server will be available at `http://localhost:3000/mcp` (or your custom port).

### Configuration

The server accepts configuration through HTTP headers for each session:

#### Flagship (Feature Experimentation) Headers:

- `x-flagship-env-id`: Your AB Tasty environment ID
- `x-flagship-api-key`: Your AB Tasty API key

#### Resource Loader Headers (optional):

- `x-resource-loader-account-id`: Your AB Tasty account ID
- `x-resource-loader-token`: Your resource loader authentication token

### Connecting with MCP Clients

The server uses the Streamable HTTP transport protocol. Configure your MCP client to connect to the server endpoint:

```json
{
  "mcpServers": {
    "abtasty": {
      "url": "http://localhost:3000/mcp",
      "headers": {
        "x-flagship-env-id": "your_env_id",
        "x-flagship-api-key": "your_api_key"
      }
    }
  }
}
```

### Example: Using Tools

Once connected through an MCP client, you can use the available tools:

**Get campaigns for a visitor:**

```typescript
decision_api_get_campaigns({
  visitor_id: "user123",
  context: {
    age: 25,
    country: "US",
  },
  trigger_hit: true,
});
```

**Get feature flags:**

```typescript
decision_api_get_flags({
  visitor_id: "user123",
  context: {
    age: 25,
    country: "US",
  },
  trigger_hit: false,
});
```

**Load campaign details:**

```typescript
resource_loader_api-load({
  resourceLoaderContent: {
    payload: {...}
  },
  dryrun: false,
});
```

## Development

### Project Structure

```
├── src/
│   ├── index.ts              # Main server entry point
│   ├── tools/                # MCP tool implementations
│   │   ├── decision-api.ts   # Feature flag tools
│   │   └── resource-loader-api.ts
│   ├── prompts/              # Interactive prompt definitions
│   │   ├── quickstart-guide.ts
│   │   └── campaign-intaker.ts
│   └── resources/            # Resource providers
│       └── documentation.ts
├── helpers/                  # Utility functions
│   ├── flagship.ts          # AB Tasty SDK wrapper
│   └── resourceLoader.ts    # Campaign extraction utilities
├── types/                   # TypeScript type definitions
├── assistant-prompts/       # Markdown prompt templates
└── build/                   # Compiled output
```

### Development Scripts

```bash
# Generate prompt files
yarn generate:prompts

# Build the project
yarn build

# Build and run
yarn dev
```

### Building from Source

The build process:

1. Generates TypeScript files from markdown prompts
2. Bundles the application with esbuild
3. Copies assistant prompt files to the build directory

```bash
yarn build
```

## Architecture

### Session Management

The server maintains isolated sessions for each client connection:

- Each session has its own credentials (provided via headers)
- Sessions are identified by unique UUIDs
- Sessions are cleaned up when connections close

### Transport Layer

Uses the Streamable HTTP transport from the MCP SDK:

- Supports JSON-RPC 2.0 over HTTP
- Session-based connection management
- Automatic session initialization and cleanup

## Security Notes

- Credentials are session-scoped and not shared between sessions
- Always use HTTPS in production environments
- Store credentials securely and never commit them to version control

## API Documentation

### Tools

#### `decision_api_get_campaigns`

Retrieves all campaigns for a visitor.

**Parameters:**

- `visitor_id` (string): Unique visitor identifier
- `context` (object): Key-value pairs for targeting (optional)
- `trigger_hit` (boolean): Send analytics hit (default: false)

**Returns:** Array of campaigns with variations and modifications

#### `decision_api_get_campaign`

Retrieves a specific campaign by its ID for a visitor.

**Parameters:**

- `visitor_id` (string): Unique visitor identifier
- `campaign_id` (string): Campaign ID to retrieve
- `context` (object): Key-value pairs for targeting (optional)
- `trigger_hit` (boolean): Send analytics hit (default: false)

**Returns:** Campaign with variation and modifications

#### `decision_api_get_flags`

Retrieves all feature flags for a visitor.

**Parameters:**

- `visitor_id` (string): Unique visitor identifier
- `context` (object): Key-value pairs for targeting (optional)
- `trigger_hit` (boolean): Send analytics hit (default: false)

**Returns:** Object with flag keys and their values

#### `decision_api_activate_campaign`

Activates a campaign for a visitor.

**Parameters:**

- `visitor_id` (string): Unique visitor identifier
- `variation_group_id` (string): Variation group ID to activate
- `variation_id` (string): Variation ID to activate

**Returns:** Activation confirmation

#### `resource_loader_api-load`

Loads resources via the Resource Loader API.

**Parameters:**

- `resourceLoaderContent` (object): JSON containing resource loader content
- `dryrun` (boolean): Whether to simulate the request without sending it

**Returns:** Loaded resources results

## Troubleshooting

### Server won't start

- Check if port 3000 is already in use
- Verify Node.js version (18+ required)
- Ensure dependencies are installed: `yarn install`

### "Invalid credentials" errors

- Verify your environment ID and API key are correct
- Check that headers are properly set in your MCP client configuration
- Ensure credentials have the necessary permissions in AB Tasty

## License

[MIT License](./LICENSE)

## Support

For issues related to:

- **This MCP server**: Open an issue on GitHub
- **AB Tasty platform**: Contact [AB Tasty support](https://support.abtasty.com/)

## Resources

- **MCP protocol**: See [Model Context Protocol documentation](https://modelcontextprotocol.io/)
- **AB Tasty SDK**: See [AB Tasty SDK](https://docs.abtasty.com/server-side/sdks)
