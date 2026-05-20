export interface Env {
  SUPABASE_URL: string
  SUPABASE_SERVICE_KEY: string
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    // ✅ ONLY allow POST /kcb/ipn
    if (url.pathname === "/kcb/ipn" && request.method === "POST") {
      return handleIPN(request, env)
    }

    // ❌ Block everything else
    return new Response(
      JSON.stringify({ error: "Not allowed" }),
      {
        status: 405,
        headers: { "Content-Type": "application/json" },
      }
    )
  },
}

// ----------------------
// HANDLE KCB IPN
// ----------------------
async function handleIPN(request: Request, env: Env): Promise<Response> {
  try {
    // 🔒 Enforce JSON
    if (!request.headers.get("content-type")?.includes("application/json")) {
      return new Response("Unsupported Media Type", { status: 415 })
    }

    const body = await request.json()

    const {
      transactionReference,
      requestId,
      channelCode,
      timestamp,
      transactionAmount,
      currency,
      customerReference,
      customerName,
      customerMobileNumber,
      balance,
      narration,
      creditAccountIdentifier,
      organizationShortCode,
      tillNumber,
    } = body

    // 🔴 Validate required fields
    if (!requestId || !transactionReference) {
      return Response.json({
        transactionID: "N/A",
        statusCode: 1,
        statusMessage: "Invalid payload",
      })
    }

    // ----------------------
    // SAVE TO SUPABASE
    // ----------------------
    const supabaseRes = await fetch(
      `${env.SUPABASE_URL}/rest/v1/registrations`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: env.SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
          Prefer: "resolution=merge-duplicates",
        },
        body: JSON.stringify({
          transaction_reference: transactionReference,
          request_id: requestId,
          channel_code: channelCode,
          ipn_timestamp: timestamp,
          transaction_amount: transactionAmount,
          currency,
          customer_reference: customerReference,
          customer_name: customerName,
          customer_mobile_number: customerMobileNumber,
          balance,
          narration,
          credit_account_identifier: creditAccountIdentifier,
          organization_shortcode: organizationShortCode,
          till_number: tillNumber,

          // reuse your existing schema
          phone: customerMobileNumber,
          name: customerName,
          amount: transactionAmount,
          invoice_number: customerReference,
          status: "completed",
        }),
      }
    )

    const result = await supabaseRes.text()
    console.log("Supabase response:", result)

    // ✅ ACK to KCB
    return Response.json({
      transactionID: transactionReference,
      statusCode: 0,
      statusMessage: "Notification received",
    })
  } catch (error) {
    console.error(error)

    return Response.json({
      transactionID: "ERROR",
      statusCode: 1,
      statusMessage: "Server error",
    })
  }
}