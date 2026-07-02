# Order Book Depth API

[![MCP Server](https://img.shields.io/badge/MCP-server-blue)](https://orderbook-depth.api.klymax402.com/mcp)
[![x402](https://img.shields.io/badge/payments-x402-6E56CF)](https://x402.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)

Analyze Uniswap V3 pool liquidity depth and price impact at various levels. Pay-per-call via [x402](https://x402.org) (USDC on Base L2) -- no API key, no signup, no rate-limit wall.

Part of the [klymax402](https://klymax402.com) marketplace -- 100 x402 micropayment APIs for AI agents, one wallet, USDC on Base.

## Quickstart -- MCP

Add to your MCP client config (Claude Desktop, Cursor, ElizaOS, etc.):

```json
{
  "mcpServers": {
    "orderbook-depth": {
      "url": "https://orderbook-depth.api.klymax402.com/mcp"
    }
  }
}
```

## Quickstart -- HTTP (x402)

```bash
curl "https://orderbook-depth.api.klymax402.com/api/depth?pool=..."
# -> 402 Payment Required, with an x402 payment challenge in the response body
```

Any x402-aware client ([`@x402/fetch`](https://www.npmjs.com/package/@x402/fetch), [`x402-agent-tools`](https://www.npmjs.com/package/x402-agent-tools), ATXP) handles the 402 -> sign -> retry cycle automatically.

## Tools

| Tool | Method | Path | Price | Description |
|---|---|---|---|---|
| `dex_analyze_orderbook_depth` | GET | `/api/depth` | $0.005 | Analyze orderbook depth for a Uniswap V3 pool |

### `dex_analyze_orderbook_depth`

Use this when you need to analyze liquidity depth of a Uniswap V3 pool on Base. Returns current price, liquidity at 1%/2%/5%/10% price impact levels (in USD), total liquidity, and fee tier. Useful for estimating slippage before large trades. Do NOT use for swap quotes — use dex_get_swap_quote. Do NOT use for token safety — use token_check_safety. Do NOT use for token holders — use token_get_holder_analysis.

**Parameters**

| Name | Type | Required | Description |
|---|---|---|---|
| `pool` | string | yes | Uniswap V3 pool address (0x...) |
| `chain` | string | no | Chain name: base, ethereum (default: base) |

## Example agent prompts

- "Analyze liquidity depth of a Uniswap V3 pool on Base"

## Payment

- Protocol: [x402](https://x402.org) -- HTTP-native pay-per-call, no signup, no API key
- Network: Base L2 (`eip155:8453`)
- Asset: USDC
- Facilitator: Coinbase CDP (primary), PayAI (fallback)

## Part of klymax402

100 x402 micropayment APIs for AI agents -- one wallet, USDC on Base, zero signup.

- Catalog: https://klymax402.com/llms.txt
- Full API reference: https://klymax402.com/llms-full.txt
- Live stats: https://klymax402.com/stats

## License

MIT
