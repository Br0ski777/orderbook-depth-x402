import type { Hono } from "hono";


// ATXP: requirePayment only fires inside an ATXP context (set by atxpHono middleware).
// For raw x402 requests, the existing @x402/hono middleware handles the gate.
// If neither protocol is active (ATXP_CONNECTION unset), tryRequirePayment is a no-op.
async function tryRequirePayment(price: number): Promise<void> {
  if (!process.env.ATXP_CONNECTION) return;
  try {
    const { requirePayment } = await import("@atxp/server");
    const BigNumber = (await import("bignumber.js")).default;
    await requirePayment({ price: BigNumber(price) });
  } catch (e: any) {
    if (e?.code === -30402) throw e;
  }
}

const RPC_URLS: Record<string, string> = {
  base: "https://mainnet.base.org",
  ethereum: "https://eth.llamarpc.com",
};

// Uniswap V3 Pool ABI (minimal)
const SLOT0_SELECTOR = "0x3850c7bd"; // slot0()
const LIQUIDITY_SELECTOR = "0x1a686502"; // liquidity()
const FEE_SELECTOR = "0xddca3f43"; // fee()
const TOKEN0_SELECTOR = "0x0dfe1681"; // token0()
const TOKEN1_SELECTOR = "0xd21220a7"; // token1()

async function ethCall(rpcUrl: string, to: string, data: string): Promise<string> {
  const resp = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_call",
      params: [{ to, data }, "latest"],
      id: 1,
    }),
  });
  const result = await resp.json() as any;
  if (result.error) throw new Error(result.error.message);
  return result.result;
}

function decodeSqrtPriceX96(hex: string): number {
  // slot0 returns: sqrtPriceX96 (uint160), tick (int24), ...
  // First 32 bytes = sqrtPriceX96
  const sqrtPriceX96 = BigInt("0x" + hex.slice(2, 66));
  const price = Number(sqrtPriceX96 * sqrtPriceX96) / Number(BigInt(2) ** BigInt(192));
  return price;
}

function decodeLiquidity(hex: string): bigint {
  return BigInt(hex);
}

function decodeFee(hex: string): number {
  return parseInt(hex, 16);
}

function decodeAddress(hex: string): string {
  return "0x" + hex.slice(26, 66);
}

export function registerRoutes(app: Hono) {
  app.get("/api/depth", async (c) => {
    await tryRequirePayment(0.005);
    const pool = c.req.query("pool");
    const chain = (c.req.query("chain") || "base").toLowerCase();

    if (!pool || !pool.match(/^0x[a-fA-F0-9]{40}$/)) {
      return c.json({ error: "Missing or invalid pool address (0x...)" }, 400);
    }

    const rpcUrl = RPC_URLS[chain];
    if (!rpcUrl) {
      return c.json({ error: `Unsupported chain: ${chain}. Supported: base, ethereum` }, 400);
    }

    try {
      // Fetch pool data in parallel
      const [slot0Raw, liquidityRaw, feeRaw, token0Raw, token1Raw] = await Promise.all([
        ethCall(rpcUrl, pool, SLOT0_SELECTOR),
        ethCall(rpcUrl, pool, LIQUIDITY_SELECTOR),
        ethCall(rpcUrl, pool, FEE_SELECTOR),
        ethCall(rpcUrl, pool, TOKEN0_SELECTOR),
        ethCall(rpcUrl, pool, TOKEN1_SELECTOR),
      ]);

      const priceRatio = decodeSqrtPriceX96(slot0Raw);
      const liquidity = decodeLiquidity(liquidityRaw);
      const fee = decodeFee(feeRaw);
      const token0 = decodeAddress(token0Raw);
      const token1 = decodeAddress(token1Raw);

      // For price display, assume token1 is the quote (USDC/WETH pattern)
      // Price = token1/token0
      const currentPrice = priceRatio;

      // Estimate depth at various price impact levels
      // Simplified: liquidity * price_change_percentage gives approximate depth
      const liquidityNum = Number(liquidity);
      const sqrtPrice = Math.sqrt(currentPrice);

      // Depth calculation: dx = L * (1/sqrt(Pa) - 1/sqrt(Pb)) for token0
      // Simplified estimation using liquidity and price impact
      const depths: Record<string, { priceImpact: string; depthUsd: number; depthFormatted: string }> = {};

      for (const pct of [1, 2, 5, 10]) {
        // Approximate USD depth at this impact level
        const priceShift = currentPrice * (pct / 100);
        const depthEstimate = liquidityNum * Math.sqrt(priceShift) / 1e12; // Normalize
        const depthUsd = Math.abs(depthEstimate);

        depths[`${pct}pct`] = {
          priceImpact: `${pct}%`,
          depthUsd: Math.round(depthUsd * 100) / 100,
          depthFormatted: formatUsd(depthUsd),
        };
      }

      const feeTierMap: Record<number, string> = {
        100: "0.01%",
        500: "0.05%",
        3000: "0.3%",
        10000: "1%",
      };

      return c.json({
        pool,
        chain,
        token0,
        token1,
        currentPrice: currentPrice,
        feeTier: fee,
        feeTierFormatted: feeTierMap[fee] || `${fee / 10000}%`,
        liquidity: liquidity.toString(),
        depth: depths,
        totalLiquidityRaw: liquidityNum,
        analyzedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      return c.json({ error: "Failed to analyze pool", details: err.message }, 502);
    }
  });
}

function formatUsd(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}
