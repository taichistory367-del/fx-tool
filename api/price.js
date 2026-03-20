export default async function handler(req, res) {
  const pair = req.query.pair || "USD/JPY";
  const apiKey = "818bd1701115482e908967c6348a5a8e";

  const url = `https://api.twelvedata.com/price?symbol=${pair}&apikey=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "取得失敗" });
  }
}