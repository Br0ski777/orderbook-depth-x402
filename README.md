# Order Book Depth API

[![MCP Server](https://img.shields.io/badge/MCP-server-blue)](https://orderbook-depth.api.klymax402.com/mcp)
[![x402](https://img.shields.io/badge/payments-x402-6E56CF)](https://x402.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)

Uniswap V3 liquidity depth analysis -- price impact at 1/2/5/10% levels. Slippage estimation pre-trade. Pay-per-call via [x402](https://x402.org) (USDC on Base L2) -- no API key, no signup, no rate-limit wall.

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
| `dex_analyze_orderbook_depth` | GET | `/api/depth` | $0.012 | Analyze orderbook depth for a Uniswap V3 pool |
| `dex_analyze_orderbook_depth` | POST | `/api/depth` | $0.012 | Analyze orderbook depth for a Uniswap V3 pool (POST variant) |

### `dex_analyze_orderbook_depth`

Use this when you need to analyze liquidity depth of a Uniswap V3 pool before a large trade. Returns depth analysis in JSON.

**Parameters**

| Name | Type | Required | Description |
|---|---|---|---|
| `pool` | string | yes | Uniswap V3 pool address (0x...) |
| `chain` | string | no | Chain name: base, ethereum (default: base) |

**Returns**

- `currentPrice` -- current pool price
- `depth1pct` -- USD liquidity available within 1% price impact
- `depth2pct` -- USD liquidity available within 2% price impact
- `depth5pct` -- USD liquidity available within 5% price impact
- `depth10pct` -- USD liquidity available within 10% price impact
- `totalLiquidity` -- total pool liquidity in USD
- `feeTier` -- pool fee tier (0.01%, 0.05%, 0.3%, 1%)
- `token0/token1` -- pool token pair symbols

Example response:

```json
{"currentPrice":3128.50,"depth1pct":850000,"depth2pct":2100000,"depth5pct":5400000,"depth10pct":9800000,"totalLiquidity":15200000,"feeTier":"0.3%","token0":"USDC","token1":"WETH"}
```

**When to use**: executing large on-chain trades to estimate slippage and determine optimal trade size. Essential for MEV-aware agents and OTC sizing.

**Not for**: swap quotes (use `dex_get_swap_quote`), token safety (use `token_check_safety`), token holders (use `token_get_holder_analysis`).

### `dex_analyze_orderbook_depth`

Use this when you need to analyze liquidity depth of a Uniswap V3 pool before a large trade. Returns depth analysis in JSON. POST variant of dex_analyze_orderbook_depth -- same params passed as JSON body instead of query string.

**Parameters**

| Name | Type | Required | Description |
|---|---|---|---|
| `pool` | string | yes | Uniswap V3 pool address (0x...) |
| `chain` | string | no | Chain name: base, ethereum (default: base) |

**Returns**

- `currentPrice` -- current pool price
- `depth1pct` -- USD liquidity available within 1% price impact
- `depth2pct` -- USD liquidity available within 2% price impact
- `depth5pct` -- USD liquidity available within 5% price impact
- `depth10pct` -- USD liquidity available within 10% price impact
- `totalLiquidity` -- total pool liquidity in USD
- `feeTier` -- pool fee tier (0.01%, 0.05%, 0.3%, 1%)
- `token0/token1` -- pool token pair symbols

Example response:

```json
{"currentPrice":3128.50,"depth1pct":850000,"depth2pct":2100000,"depth5pct":5400000,"depth10pct":9800000,"totalLiquidity":15200000,"feeTier":"0.3%","token0":"USDC","token1":"WETH"}
```

**When to use**: executing large on-chain trades to estimate slippage and determine optimal trade size. Essential for MEV-aware agents and OTC sizing.

**Not for**: swap quotes (use `dex_get_swap_quote`), token safety (use `token_check_safety`), token holders (use `token_get_holder_analysis`).

## Example agent prompts

- "Analyze liquidity depth of a Uniswap V3 pool before a large trade"
- "Analyze liquidity depth of a Uniswap V3 pool before a large trade"

## Payment

- Protocol: [x402](https://x402.org) -- HTTP-native pay-per-call, no signup, no API key
- Network: Base L2 (`eip155:8453`)
- Asset: USDC
- Facilitator: Coinbase CDP (primary), PayAI (fallback)
- Also reachable via [ATXP](https://atxp.ai) (OAuth-wrapped x402, RFC 9728 protected-resource metadata)

## Part of klymax402

100 x402 micropayment APIs for AI agents -- one wallet, USDC on Base, zero signup.

- Catalog: https://klymax402.com/llms.txt
- Full API reference: https://klymax402.com/llms-full.txt
- Live stats: https://klymax402.com/stats

## License

MIT
