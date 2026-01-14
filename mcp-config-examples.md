# MCP Configuration Examples

This file provides configuration examples for connecting to the AB Tasty MCP Server from various MCP-compatible IDEs and clients.

## VS Code (Cline Extension)

Create or update `.vscode/mcp.json` in your workspace:

```json
{
  "servers": {
    "ABTasty": {
      "type": "http",
      "url": "http://localhost:3000/mcp",
      "headers": {
        "X-Flagship-Env-Id": "your_env_id_here",
        "X-Flagship-Api-Key": "your_api_key_here",
        "X-Resource-Loader-Account-Id": "your_account_id_here",
        "X-Resource-Loader-Token": "your_token_here"
      }
    }
  },
  "inputs": []
}
```

## Cursor

Add to your Cursor settings (`~/.cursor/mcp_settings.json` or via Settings > MCP):

```json
{
  "mcpServers": {
    "ABTasty": {
      "type": "http",
      "url": "http://localhost:3000/mcp",
      "headers": {
        "X-Flagship-Env-Id": "your_env_id_here",
        "X-Flagship-Api-Key": "your_api_key_here",
        "X-Resource-Loader-Account-Id": "your_account_id_here",
        "X-Resource-Loader-Token": "your_token_here"
      }
    }
  }
}
```

## Claude Desktop

Add to `claude_desktop_config.json`:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "ABTasty": {
      "type": "http",
      "url": "http://localhost:3000/mcp",
      "headers": {
        "X-Flagship-Env-Id": "your_env_id_here",
        "X-Flagship-Api-Key": "your_api_key_here",
        "X-Resource-Loader-Account-Id": "your_account_id_here",
        "X-Resource-Loader-Token": "your_token_here"
      }
    }
  }
}
```

## Continue (VS Code Extension)

Add to `.continue/config.json` in your workspace:

```json
{
  "mcpServers": [
    {
      "name": "ABTasty",
      "type": "http",
      "url": "http://localhost:3000/mcp",
      "headers": {
        "X-Flagship-Env-Id": "your_env_id_here",
        "X-Flagship-Api-Key": "your_api_key_here",
        "X-Resource-Loader-Account-Id": "your_account_id_here",
        "X-Resource-Loader-Token": "your_token_here"
      }
    }
  ]
}
```

## Configuration Notes

### Required Headers

- `X-Flagship-Env-Id`: Your AB Tasty environment ID (required)
- `X-Flagship-Api-Key`: Your AB Tasty API key (required)

### Optional Headers (for Resource Loader features)

- `X-Resource-Loader-Account-Id`: Your AB Tasty account ID
- `X-Resource-Loader-Token`: Your resource loader authentication token

### Getting Your Credentials

1. **Flagship Credentials**:

   - Log in to [AB Tasty Platform](https://app2.abtasty.com/settings/feature-experimentation/environment)
   - Go to Settings > Environments
   - Copy your Environment ID and API Key

2. **Resource Loader Credentials**:
   - Navigate to your account settings
   - Generate or copy your authentication token

### Security Considerations

- **Never commit credentials** to version control
- Use environment variables for sensitive values
- Consider using a secrets manager for production deployments
- Restrict access to configuration files containing credentials

### Testing Your Connection

After configuring your client:

1. Start the MCP server:

   ```bash
   npm start
   ```

2. Verify the server is running:

   ```bash
   curl http://localhost:3000/mcp
   ```

3. In your MCP client, test the connection by:
   - Asking about available tools
   - Running a simple command like `decision_api_get_campaigns`

### Troubleshooting

- **Connection refused**: Ensure the server is running on port 3000
- **Invalid credentials**: Verify your environment ID and API key are correct
- **404 errors**: Check the URL endpoint is `/mcp` (not just the base URL)
- **CORS issues**: The server is designed for MCP clients, not browser requests

## Remote Server Configuration

If running the MCP server on a remote host:

```json
{
  "servers": {
    "ABTasty": {
      "type": "http",
      "url": "https://your-server.com:3000/mcp",
      "headers": {
        "X-Flagship-Env-Id": "your_env_id_here",
        "X-Flagship-Api-Key": "your_api_key_here"
      }
    }
  }
}
```

**Important**: Always use HTTPS for remote connections to protect credentials in transit.

## Multiple Environments

You can configure multiple server instances for different environments:

```json
{
  "servers": {
    "ABTasty-production": {
      "type": "http",
      "url": "http://localhost:3000/mcp",
      "headers": {
        "X-Flagship-Env-Id": "prod_env_id",
        "X-Flagship-Api-Key": "prod_api_key"
      }
    },
    "ABTasty-staging": {
      "type": "http",
      "url": "http://localhost:3001/mcp",
      "headers": {
        "X-Flagship-Env-Id": "staging_env_id",
        "X-Flagship-Api-Key": "staging_api_key"
      }
    }
  }
}
```
