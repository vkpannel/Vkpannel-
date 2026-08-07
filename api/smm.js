export default async function handler(req, res) {
  const apiUrl = process.env.SMM_API_URL;
  const apiKey = process.env.SMM_API_KEY;

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        key: apiKey,
        action: "services",
      }),
    });

    const data = await response.json();

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch services",
    });
  }
}
