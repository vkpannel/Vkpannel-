export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  const { userId, amount, utr } = req.body || {};

  if (!userId || !amount || !utr) {
    return res.status(400).json({
      error: "User ID, amount and UTR are required"
    });
  }

  try {
    const response = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/deposit_requests`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": process.env.SUPABASE_SERVICE_ROLE_KEY,
          "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          "Prefer": "return=representation"
        },
        body: JSON.stringify({
          user_id: userId,
          amount: Number(amount),
          utr: String(utr),
          status: "pending"
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.message || "Failed to create deposit request"
      });
    }

    return res.status(200).json({
      success: true,
      request: data[0]
    });

  } catch (error) {
    return res.status(500).json({
      error: "Server error"
    });
  }
}
