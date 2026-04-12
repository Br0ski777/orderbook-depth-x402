import type { ApiConfig } from "./shared";

export const API_CONFIG: ApiConfig = {
  name: "orderbook-depth",
  slug: "orderbook-depth",
  description: "Analyze Uniswap V3 pool liquidity depth and price impact at various levels.",
  version: "1.0.0",
  routes: [
    {
      method: "GET",
      path: "/api/depth",
      price: "$0.005",
      description: "Analyze orderbook depth for a Uniswap V3 pool",
      toolName: "dex_analyze_orderbook_depth",
      toolDescription: "Use this when you need to analyze liquidity depth of a Uniswap V3 pool on Base. Returns current price, liquidity at 1%/2%/5%/10% price impact levels (in USD), total liquidity, and fee tier. Useful for estimating slippage before large trades. Do NOT use for swap quotes — use dex_get_swap_quote. Do NOT use for token safety — use token_check_safety. Do NOT use for token holders — use token_get_holder_analysis.",
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
