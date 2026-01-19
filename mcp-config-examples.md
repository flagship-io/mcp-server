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
        "X-Fear-Env-Id": "your_env_id_here",
        "X-Fear-Api-Key": "your_api_key_here",
        "X-Resource-Loader-We-Account-Id": "your_we_account_id_here",
        "X-Resource-Loader-We-Token": "your_we_token_here",
        "X-Resource-Loader-Fear-Account-Id": "your_fe_account_id_here",
        "X-Resource-Loader-Fear-Account-Environment-Id": "your_fe_env_id_here",
        "X-Resource-Loader-Fear-Rca-Token": "your_fe_token_here"
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
        "X-Fear-Env-Id": "your_env_id_here",
        "X-Fear-Api-Key": "your_api_key_here",
        "X-Resource-Loader-We-Account-Id": "your_we_account_id_here",
        "X-Resource-Loader-We-Token": "your_we_token_here",
        "X-Resource-Loader-Fear-Account-Id": "your_fear_account_id_here",
        "X-Resource-Loader-Fear-Account-Environment-Id": "your_fear_env_id_here",
        "X-Resource-Loader-Fear-Rca-Token": "your_fear_rca_token_here"
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
        "X-Fear-Env-Id": "your_env_id_here",
        "X-Fear-Api-Key": "your_api_key_here",
        "X-Resource-Loader-We-Account-Id": "your_we_account_id_here",
        "X-Resource-Loader-We-Token": "your_we_token_here",
        "X-Resource-Loader-Fear-Account-Id": "your_fe_account_id_here",
        "X-Resource-Loader-Fear-Account-Environment-Id": "your_fe_env_id_here",
        "X-Resource-Loader-Fear-Rca-Token": "your_fe_token_here"
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
        "X-Fear-Env-Id": "your_env_id_here",
        "X-Fear-Api-Key": "your_api_key_here",
        "X-Resource-Loader-We-Account-Id": "your_we_account_id_here",
        "X-Resource-Loader-We-Token": "your_we_token_here",
        "X-Resource-Loader-Fear-Account-Id": "your_fe_account_id_here",
        "X-Resource-Loader-Fear-Account-Environment-Id": "your_fe_env_id_here",
        "X-Resource-Loader-Fear-Rca-Token": "your_fe_token_here"
      }
    }
  ]
}
```

## Configuration Notes

### Required Headers

- `X-Fear-Env-Id`: Your AB Tasty environment ID (required)
- `X-Fear-Api-Key`: Your AB Tasty API key (required)

### Optional Headers (for Resource Loader features)

**For Web Experimentation & Personalization:**

- `X-Resource-Loader-We-Account-Id`: Your AB Tasty Web Experimentation account ID
- `X-Resource-Loader-We-Token`: Your Web Experimentation resource loader authentication token

**For Feature Experimentation & Rollout:**

- `X-Resource-Loader-Fear-Account-Id`: Your AB Tasty Feature Experimentation account ID
- `X-Resource-Loader-Fear-Account-Environment-Id`: Your AB Tasty Feature Experimentation environment ID
- `X-Resource-Loader-Fear-Rca-Token`: Your Feature Experimentation resource loader authentication token

### Getting Your Credentials

1. **Feature Experimentation & Rollout Credentials**:

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
        "X-Fear-Env-Id": "your_env_id_here",
        "X-Fear-Api-Key": "your_api_key_here",
        "X-Resource-Loader-We-Account-Id": "your_we_account_id_here",
        "X-Resource-Loader-We-Token": "your_we_token_here"
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
        "X-Fear-Env-Id": "prod_env_id",
        "X-Fear-Api-Key": "prod_api_key",
        "X-Resource-Loader-We-Account-Id": "prod_we_account_id",
        "X-Resource-Loader-We-Token": "prod_we_token"
      }
    },
    "ABTasty-staging": {
      "type": "http",
      "url": "http://localhost:3001/mcp",
      "headers": {
        "X-Fear-Env-Id": "staging_env_id",
        "X-Fear-Api-Key": "staging_api_key",
        "X-Resource-Loader-Fear-Account-Id": "staging_fe_account_id",
        "X-Resource-Loader-Fear-Account-Environment-Id": "staging_fe_env_id",
        "X-Resource-Loader-Fear-Rca-Token": "staging_fe_token"
      }
    }
  }
}
```
