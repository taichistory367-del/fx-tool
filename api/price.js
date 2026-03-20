const SYMBOL_MAP = {
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
  GOLD:   'XAU/USD',
  SILVER: 'XAG/USD',
  JP225:  'N225',
  US30:   'DJI',
  US100:  'IXIC',
  US500:  'SPX',
  OIL:    'WTI',
  BTCUSD: 'BTC/USD',
  ETHUSD: 'ETH/USD',
};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json', ...CORS_HEADERS });
  res.end(JSON.stringify(body));
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    res.end();
    return;
  }

  const pair   = (req.query.pair || 'USDJPY').toUpperCase();
  const symbol = SYMBOL_MAP[pair];

  if (!symbol) {
    return json(res, 400, { error: '未対応の通貨ペアです', pair });
  }

  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey) {
    return json(res, 500, { error: 'APIキーが設定されていません' });
  }

  const url = 'https://api.twelvedata.com/price?symbol=' + encodeURIComponent(symbol) + '&apikey=' + apiKey;

  let raw;
  try {
    const response = await fetch(url);
    raw = await response.json();
  } catch (err) {
    return json(res, 500, { error: 'Twelve Data への接続に失敗しました', details: err.message });
  }

  if (raw.status === 'error' || raw.code) {
    return json(res, 400, {
      error:   'Twelve Data がエラーを返しました',
      details: raw.message || raw.status || JSON.stringify(raw),
    });
  }

  const price = parseFloat(raw.price);
  if (isNaN(price) || price <= 0) {
    return json(res, 400, {
      error:   '価格データが取得できませんでした',
      details: JSON.stringify(raw),
    });
  }

  return json(res, 200, { pair, symbol, price });
};