export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const rawPair = req.query.pair || 'USD/JPY';

  // 画面の表示名 -> Twelve Data に渡す symbol
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

    'BTC/USD': 'BTC/USD',
    'ETH/USD': 'ETH/USD',

    // ここは通る銘柄名に差が出やすい
    'JP225Cash': 'N225',
    'US30Cash': 'DJI',
    'US100Cash': 'IXIC',
    'US500Cash': 'SPX',
    'OILCash': 'WTI'
  };

  const symbol = symbolMap[rawPair];

  if (!symbol) {
    return res.status(400).json({
      error: '未対応の通貨ペアです',
      pair: rawPair
    });
  }

  // 本番は環境変数推奨
  const apiKey = process.env.TWELVE_DATA_API_KEY || 'ここにあなたのAPIキー';

  if (!apiKey || apiKey === 'ここにあなたのAPIキー') {
    return res.status(500).json({
      error: 'APIキーが未設定です'
    });
  }

  try {
    const url = `https://api.twelvedata.com/price?symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    // Twelve Dataの標準エラー形式
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
}const apiKey = "818bd1701115482e908967c6348a5a8e";
