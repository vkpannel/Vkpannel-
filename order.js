export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  const apiUrl = process.env.SMM_API_URL;
  const apiKey = process.env.SMM_API_KEY;

  const { service, link, quantity } = req.body;

  if (!service || !link || !quantity) {
    return res.status(400).json({
      error: "Service, link and quantity are required"
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
        service: service,
        link: link,
        quantity: quantity
      })
    });

    const data = await response.json();

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({
      error: "Failed to place order"
    });
  }
}
