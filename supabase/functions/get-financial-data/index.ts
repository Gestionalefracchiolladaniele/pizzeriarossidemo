import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate via X-Api-Key header
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing X-Api-Key header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify API key against pizzeria_settings
    const { data: settings, error: settingsError } = await supabase
      .from("pizzeria_settings")
      .select("api_key")
      .eq("api_key", apiKey)
      .maybeSingle();

    if (settingsError || !settings) {
      return new Response(JSON.stringify({ error: "Invalid API key" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse query params for date range
    const url = new URL(req.url);
    const from = url.searchParams.get("from"); // YYYY-MM-DD
    const to = url.searchParams.get("to"); // YYYY-MM-DD
    const period = url.searchParams.get("period") || "today"; // today, week, month, all

    let query = supabase.from("orders").select("*");

    if (from && to) {
      query = query.gte("created_at", `${from}T00:00:00`).lte("created_at", `${to}T23:59:59`);
    } else {
      const now = new Date();
      let startDate: string;
      switch (period) {
        case "week": {
          const d = new Date(now);
          d.setDate(d.getDate() - 7);
          startDate = d.toISOString().split("T")[0];
          break;
        }
        case "month": {
          const d = new Date(now);
          d.setMonth(d.getMonth() - 1);
          startDate = d.toISOString().split("T")[0];
          break;
        }
        case "all":
          startDate = "2000-01-01";
          break;
        default: // today
          startDate = now.toISOString().split("T")[0];
      }
      query = query.gte("created_at", `${startDate}T00:00:00`);
    }

    const { data: orders, error: ordersError } = await query.order("created_at", { ascending: false });

    if (ordersError) {
      throw ordersError;
    }

    // Aggregate financial data
    const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total), 0) || 0;
    const totalOrders = orders?.length || 0;
    const deliveryFees = orders?.reduce((sum, o) => sum + Number(o.delivery_fee || 0), 0) || 0;
    const subtotals = orders?.reduce((sum, o) => sum + Number(o.subtotal), 0) || 0;

    // Group by date
    const byDate: Record<string, { revenue: number; orders: number; delivery_fees: number }> = {};
    orders?.forEach((o) => {
      const date = o.created_at.split("T")[0];
      if (!byDate[date]) byDate[date] = { revenue: 0, orders: 0, delivery_fees: 0 };
      byDate[date].revenue += Number(o.total);
      byDate[date].orders += 1;
      byDate[date].delivery_fees += Number(o.delivery_fee || 0);
    });

    // Group by status
    const byStatus: Record<string, number> = {};
    orders?.forEach((o) => {
      byStatus[o.status] = (byStatus[o.status] || 0) + 1;
    });

    const response = {
      summary: {
        total_revenue: totalRevenue,
        total_orders: totalOrders,
        total_delivery_fees: deliveryFees,
        total_subtotals: subtotals,
        average_order_value: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      },
      by_date: byDate,
      by_status: byStatus,
      orders: orders?.map((o) => {
        // Parse items to readable format
        const itemsList = Array.isArray(o.items)
          ? (o.items as any[]).map((item: any) => ({
              name: item.name || "Sconosciuto",
              quantity: item.quantity || 1,
              price: item.price || 0,
              total: (item.quantity || 1) * (item.price || 0),
            }))
          : [];

        const itemsSummary = itemsList
          .map((i) => `${i.quantity}x ${i.name}`)
          .join(", ");

        return {
          id: o.id,
          order_number: o.order_number,
          created_at: o.created_at,
          date: o.created_at.split("T")[0],
          time: o.created_at.split("T")[1]?.substring(0, 5) || "",
          status: o.status,
          delivery_type: o.delivery_type,
          customer_name: o.customer_name,
          items_summary: itemsSummary,
          items_detail: itemsList,
          subtotal: o.subtotal,
          delivery_fee: o.delivery_fee,
          total: o.total,
        };
      }),
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in get-financial-data:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
