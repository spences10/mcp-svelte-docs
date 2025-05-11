# mcp-svelte-docs

A Model Context Protocol (MCP) server that provides a comprehensive
reference guide for Svelte 5, helping LLMs provide accurate guidance
when users are working with Svelte. While it includes migration
patterns from Svelte 4 to Svelte 5, it also serves as a detailed
reference for Svelte 5 features, common mistakes, and best practices.

## Config

Claude Desktop (via WSL)

```json
{
  "mcpServers": {
   "mcp-wsl-exec": {
      "command": "wsl.exe",
      "args": [
        "bash",
        "-c",
        "npx -y mcp-wsl-exec"
      ]
    }
  }
}
```

Windsurf (via WSL)

```json
{
  "mcpServers": {
    "mcp-svelte-docs": {
      "command": "wsl.exe",
      "args": [
        "bash",
        "-c",
        "npx -y mcp-svelte-docs"
      ]
    }
  ]
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

Built on:

- [Model Context Protocol](https://github.com/modelcontextprotocol)
- [Svelte](https://svelte.dev)
