import type { ApiConfig } from "./shared";

export const API_CONFIG: ApiConfig = {
  name: "orderbook-depth",
  slug: "orderbook-depth",
  description: "Uniswap V3 liquidity depth analysis -- price impact at 1/2/5/10% levels. Slippage estimation pre-trade.",
  version: "1.0.0",
  routes: [
    {
      method: "GET",
      path: "/api/depth",
      price: "$0.005",
      description: "Analyze orderbook depth for a Uniswap V3 pool",
      toolName: "dex_analyze_orderbook_depth",
      toolDescription: `Use this when you need to analyze liquidity depth of a Uniswap V3 pool before a large trade. Returns depth analysis in JSON.

1. currentPrice: current pool price
2. depth1pct: USD liquidity available within 1% price impact
3. depth2pct: USD liquidity available within 2% price impact
4. depth5pct: USD liquidity available within 5% price impact
5. depth10pct: USD liquidity available within 10% price impact
6. totalLiquidity: total pool liquidity in USD
7. feeTier: pool fee tier (0.01%, 0.05%, 0.3%, 1%)
8. token0/token1: pool token pair symbols

Example output: {"currentPrice":3128.50,"depth1pct":850000,"depth2pct":2100000,"depth5pct":5400000,"depth10pct":9800000,"totalLiquidity":15200000,"feeTier":"0.3%","token0":"USDC","token1":"WETH"}

Use this BEFORE executing large on-chain trades to estimate slippage and determine optimal trade size. Essential for MEV-aware agents and OTC sizing.

Do NOT use for swap quotes -- use dex_get_swap_quote instead. Do NOT use for token safety -- use token_check_safety instead. Do NOT use for token holders -- use token_get_holder_analysis instead.`,
      inputSchema: {
        type: "object",
        properties: {
          pool: { type: "string", description: "Uniswap V3 pool address (0x...)" },
          chain: { type: "string", description: "Chain name: base, ethereum (default: base)" },
        },
        required: ["pool"],
      },
    },
  ],
};
