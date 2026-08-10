import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const {
      service,
      link,
      quantity,
      userId,
      charge
    } = req.body;

    if (!service || !link || !quantity || !userId || charge == null) {
      return res.status(400).json({
        error: "Missing required fields"
      });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SECRET_KEY;

    const apiUrl = process.env.SMM_API_URL;
    const apiKey = process.env.SMM_API_KEY;

    if (!supabaseUrl || !supabaseKey || !apiUrl || !apiKey) {
      return res.status(500).json({
        error: "Server configuration missing"
      });
    }

    const supabase = createClient(
      supabaseUrl,
      supabaseKey
    );

    // Get user's current balance
    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("balance")
        .eq("id", userId)
        .single();

    if (profileError || !profile) {
      return res.status(400).json({
        error: "User profile not found"
      });
    }

    const balance = Number(profile.balance || 0);
    const orderCharge = Number(charge);

    if (!Number.isFinite(orderCharge) || orderCharge <= 0) {
      return res.status(400).json({
        error: "Invalid order charge"
      });
    }

    if (balance < orderCharge) {
      return res.status(400).json({
        error: "Insufficient balance"
      });
    }

    // Send order to SMM provider
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        key: apiKey,
        action: "add",
        service: String(service),
        link: String(link),
        quantity: String(quantity)
      })
    });

    const providerData = await response.json();

    if (!response.ok || providerData.error) {
      return res.status(400).json({
        error:
          providerData.error ||
          "Provider rejected the order"
      });
    }

    const providerOrderId =
      providerData.order
        ? String(providerData.order)
        : null;

    // Deduct balance
    const newBalance = balance - orderCharge;

    const { error: balanceError } =
      await supabase
        .from("profiles")
        .update({
          balance: newBalance
        })
        .eq("id", userId);

    if (balanceError) {
      return res.status(500).json({
        error:
          "Order was accepted but balance update failed"
      });
    }

    // Save order history
    const { data: savedOrder, error: orderError } =
      await supabase
        .from("orders")
        .insert({
          user_id: userId,
          service: String(service),
          link: String(link),
          quantity: Number(quantity),
          charge: orderCharge,
          provider_order_id: providerOrderId,
          status: "Pending"
        })
        .select()
        .single();

    if (orderError) {
      return res.status(500).json({
        error:
          "Order placed but history could not be saved"
      });
    }

    return res.status(200).json({
      success: true,
      order: savedOrder,
      newBalance
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to place order"
    });
  }
}
