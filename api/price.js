export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { pair } = req.query;

  if (!pair) {
    return res.status(400).json({ error: 'pair is required' });
  }

  const symbolMap = {
    'USD/JPY': 'USD/JPY',
    'EUR/USD': 'EUR/USD',
    'GBP/USD': 'GBP/USD',
    'AUD/USD': 'AUD/USD',
    'NZD/USD': 'NZD/USD',
    'USD/CAD': 'USD/CAD',
    'AUD/CAD': 'AUD/CAD',
    'USD/CHF': 'USD/CHF',
    'EUR/AUD': 'EUR/AUD',
    'EUR/JPY': 'EUR/JPY',
    'GBP/JPY': 'GBP/JPY',
    'AUD/JPY': 'AUD/JPY',
    'NZD/JPY': 'NZD/JPY',
    'CAD/JPY': 'CAD/JPY',
    'CHF/JPY': 'CHF/JPY',
    'GOLD': 'XAU/USD',
    'SILVER': 'XAG/USD',
    'JP225Cash': 'N225',
    'US30Cash': 'DJI',
    'US100Cash': 'IXIC',
    'US500Cash': 'SPX',
    'BTC/USD': 'BTC/USD',
    'ETH/USD': 'ETH/USD',
    'OILCash': 'WTI'
  };

  const symbol = symbolMap[pair];

  if (!symbol) {
    return res.status(400).json({ error: 'unsupported pair' });
  }

  try {
    const apiKey = process.env.TWELVE_DATA_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'server api key is missing' });
    }

    const url = `https://api.twelvedata.com/price?symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || data.status === 'error' || !data.price) {
      return res.status(500).json({
        error: 'failed to fetch price',
        details: data
      });
    }

    return res.status(200).json({
      pair,
      symbol,
      price: Number(data.price)
    });
  } catch (error) {
    return res.status(500).json({
      error: 'internal server error',
      message: error.message
    });
  }
}