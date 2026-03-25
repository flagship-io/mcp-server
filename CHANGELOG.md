# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2026-03-25

### Added

- **Codebase Analyzer**: New tool and prompts for detecting feature flag usage in codebases:
  - `codebase_analyzer_analyze`: Scan a directory for feature flag usage across AB Tasty (Flagship SDK) and competitor SDKs (LaunchDarkly, OpenFeature, Optimizely, Split, VWO). Returns detected flags with keys, default values, types, and file locations.
  - New `codebase-analyzer` prompt for guided feature flag detection and migration workflows

## [0.2.0] - 2026-01-14

### Changed

- **Resource Loader API**: Separated into platform-specific tools:
  - `resource_loader_api_load_webexp_resources`: For Web Experimentation & Personalization campaigns
  - `resource_loader_api_load_featexp_resources`: For Feature Experimentation & Rollout campaigns
- Updated header configuration to use platform-specific headers:
  - Web Experimentation: `x-resource-loader-we-account-id`, `x-resource-loader-we-token`
  - Feature Experimentation: `x-resource-loader-fear-account-id`, `x-resource-loader-fear-account-environment-id`, `x-resource-loader-fear-rca-token`

### Deprecated

- Generic `resource_loader_api-load` tool (replaced by platform-specific tools)

## [0.1.0] - 2026-01-06

### Added

- Initial release of AB Tasty MCP Server
- Decision API integration with tools:
  - `decision_api_get_campaigns`: Retrieve all campaigns for a visitor
  - `decision_api_get_campaign`: Get a specific campaign by ID
  - `decision_api_get_flags`: Get all feature flags for a visitor
  - `decision_api_activate_campaign`: Activate a campaign for a visitor
- Resource Loader API integration:
  - `resource_loader_api-load`: Load resource configurations
- Interactive prompts:
  - Quick Start Guide for Node.js SDK installation
  - Campaign Intaker for guided configuration
- Resources:
  - AB Tasty FE&R documentation access
- Session-based credential management
- Streamable HTTP transport support
- TypeScript support with full type definitions
- Comprehensive documentation and examples

### Security

- API key masking in logs
- Session-isolated credentials

[0.3.0]: https://github.com/flagship-io/mcp-server/releases/tag/v0.3.0
[0.2.0]: https://github.com/flagship-io/mcp-server/releases/tag/v0.2.0
[0.1.0]: https://github.com/flagship-io/mcp-server/releases/tag/v0.1.0
