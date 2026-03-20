export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const rawPair = req.query.pair || 'USDJPY';

  const symbolMap = {
    USDJPY: 'USD/JPY',
    EURJPY: 'EUR/JPY',
    GBPJPY: 'GBP/JPY',
    AUDJPY: 'AUD/JPY',
    NZDJPY: 'NZD/JPY',
    CADJPY: 'CAD/JPY',
    CHFJPY: 'CHF/JPY',

    EURUSD: 'EUR/USD',
    GBPUSD: 'GBP/USD',
    AUDUSD: 'AUD/USD',
    NZDUSD: 'NZD/USD',
    USDCAD: 'USD/CAD',
    AUDCAD: 'AUD/CAD',
    USDCHF: 'USD/CHF',
    EURAUD: 'EUR/AUD',

    GOLD: 'XAU/USD',
    SILVER: 'XAG/USD',

    JP225: 'N225',
    US30: 'DJI',
    US100: 'IXIC',
    US500: 'SPX',

    BTCUSD: 'BTC/USD',
    ETHUSD: 'ETH/USD',

    OIL: 'WTI'
  };

  const symbol = symbolMap[rawPair];

  if (!symbol) {
    return res.status(400).json({
      error: '未対応の通貨ペアです',
      pair: rawPair
    });
  }

  const apiKey = process.env.TWELVE_DATA_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: 'APIキーが未設定です'
    });
  }

  try {
    const url = `https://api.twelvedata.com/price?symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || data.status === 'error') {
      return res.status(400).json({
        error: '価格取得に失敗しました',
        pair: rawPair,
        symbol,
        details: data
      });
    }

    if (!data.price) {
      return res.status(400).json({
        error: '価格データが無効です',
        pair: rawPair,
        symbol,
        details: data
      });
    }

    return res.status(200).json({
      pair: rawPair,
      symbol,
      price: Number(data.price)
    });
  } catch (error) {
    return res.status(500).json({
      error: 'サーバーエラー',
      message: error.message
    });
  }
}