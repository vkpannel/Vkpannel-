export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  const { action, requestId } = req.body || {};

  if (!action || !requestId) {
    return res.status(400).json({
      error: "Action and requestId are required"
    });
  }

  if (!["approve", "reject"].includes(action)) {
    return res.status(400).json({
      error: "Invalid action"
    });
  }

  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Authentication required"
    });
  }

  const accessToken = authHeader.replace("Bearer ", "");

  try {
    // Verify the logged-in Supabase user
    const userResponse = await fetch(
      `${process.env.SUPABASE_URL}/auth/v1/user`,
      {
        headers: {
          apikey: process.env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    const user = await userResponse.json();

    if (!userResponse.ok || !user?.id) {
      return res.status(401).json({
        error: "Invalid authentication"
      });
    }

    // Only the configured admin can approve/reject
    if (user.id !== process.env.ADMIN_USER_ID) {
      return res.status(403).json({
        error: "Admin access required"
      });
    }

    // Reject request
    if (action === "reject") {
      const response = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/deposit_requests?id=eq.${encodeURIComponent(requestId)}&status=eq.pending`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            Prefer: "return=representation"
          },
          body: JSON.stringify({
            status: "rejected"
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({
          error: data?.message || "Failed to reject request"
        });
      }

      if (!data.length) {
        return res.status(409).json({
          error: "Request is no longer pending"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Deposit request rejected"
      });
    }

// Approve request using secure database function
const response = await fetch(
  `${process.env.SUPABASE_URL}/rest/v1/rpc/approve_deposit`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
    },
    body: JSON.stringify({
      p_request_id: requestId
    })
  }
);

const data = await response.json();

if (!response.ok) {
  return res.status(response.status).json({
    error: data?.message || data?.hint || "Failed to approve deposit"
  });
}

return res.status(200).json({
  success: true,
  message: "Deposit approved"
});
