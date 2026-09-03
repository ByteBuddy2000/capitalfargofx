import { NextResponse } from 'next/server';

const fallbackPrices = { BTC: 64000, ETH: 3400, USDT: 1 };

export async function GET() {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether&vs_currencies=usd',
      { next: { revalidate: 60 } },
    );

    if (!response.ok) throw new Error(`Price provider returned ${response.status}`);

    const data = (await response.json()) as Record<string, { usd?: number }>;
    const prices = {
      BTC: Number(data.bitcoin?.usd) || fallbackPrices.BTC,
      ETH: Number(data.ethereum?.usd) || fallbackPrices.ETH,
      USDT: Number(data.tether?.usd) || fallbackPrices.USDT,
    };

    return NextResponse.json({ prices, source: 'coingecko' });
  } catch (error: unknown) {
    console.error('Failed to fetch crypto prices:', error);
    return NextResponse.json({ prices: fallbackPrices, source: 'fallback' });
  }
}