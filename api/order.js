export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  const apiUrl = process.env.SMM_API_URL;
  const apiKey = process.env.SMM_API_KEY;

  const { service, link, quantity } = req.body || {};

  if (!service || !link || !quantity) {
    return res.status(400).json({
      error: "Service, link and quantity are required"
    });
  }

  if (!apiUrl || !apiKey) {
    return res.status(500).json({
      error: "SMM API configuration is missing"
    });
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        key: apiKey,
        action: "add",
        service: String(service),
        link: String(link),
        quantity: String(quantity)
      })
    });

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(502).json({
        error: "SMM provider returned invalid response",
        response: text.slice(0, 300)
      });
    }

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({
      error: "Failed to place order"
    });
  }
}
