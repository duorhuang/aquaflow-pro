# Request: Connect Antigravity to Stitch

**Date**: 2026-05-28  
**Reporter**: Developer/User

## Background
The user wants to connect **Antigravity** (this AI IDE/agent) to **Google Stitch** (https://stitch.withgoogle.com/), an AI-powered UI design tool by Google.

This integration allows the coding agent (Antigravity) and the design agent (Stitch) to work seamlessly together via the **Model Context Protocol (MCP)**, so that design tokens, screen layouts, and mockups can be read directly by the IDE to generate production-ready frontend code.

## Solution Analysis & Action Plan
1. **Identify the MCP Server Package**:
   - `stitch-mcp-auto` is a zero-config MCP server package specifically designed to connect Google Stitch to AI editors via MCP.
   
2. **Configure the MCP Server in Antigravity**:
   - We will write the configuration for the Stitch MCP server to `/Users/Duor/.gemini/antigravity-ide/mcp_config.json`.
   - The configuration schema for the MCP server:
     ```json
     {
       "mcpServers": {
         "stitch": {
           "command": "npx",
           "args": [
             "-y",
             "stitch-mcp-auto"
           ],
           "env": {
             "STITCH_API_KEY": "YOUR_STITCH_API_KEY"
           }
         }
       }
     }
     ```

3. **Verify/Setup Authentication**:
   - Since the user environment may not have the Google Cloud SDK (`gcloud`) installed, we utilize the **`STITCH_API_KEY`** environment variable directly in the configuration file.
   - The user generates an API Key on [stitch.withgoogle.com](https://stitch.withgoogle.com/) (Settings -> API Key -> Create Key) and enters it in `/Users/Duor/.gemini/antigravity-ide/mcp_config.json`.
