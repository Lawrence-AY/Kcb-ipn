import express, { Request, Response } from "express";
import { env } from "./config/env";
import { getRegistrationsCollection, serverTimestamp } from "./services/firebase";

const app = express();

app.use(express.json({ limit: "10mb" }));

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "OK",
    service: "kcb-ipn",
    timestamp: new Date().toISOString(),
  });
});

app.post("/kcb/ipn", async (req: Request, res: Response) => {
  try {
    if (!req.is("application/json")) {
      return res.status(415).send("Unsupported Media Type");
    }

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
    } = req.body || {};

    if (!requestId || !transactionReference) {
      return res.json({
        transactionID: "N/A",
        statusCode: 1,
        statusMessage: "Invalid payload",
      });
    }

    await getRegistrationsCollection().doc(String(requestId)).set(
      {
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
        phone: customerMobileNumber,
        name: customerName,
        amount: transactionAmount,
        invoice_number: customerReference,
        status: "completed",
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      },
      { merge: true }
    );

    console.log("Firebase IPN saved:", { requestId, transactionReference });

    return res.json({
      transactionID: transactionReference,
      statusCode: 0,
      statusMessage: "Notification received",
    });
  } catch (error) {
    console.error(error);

    return res.json({
      transactionID: "ERROR",
      statusCode: 1,
      statusMessage: "Server error",
    });
  }
});

app.all("*", (_req: Request, res: Response) => {
  res.status(405).json({ error: "Not allowed" });
});

app.listen(env.PORT, () => {
  console.log(`KCB IPN Express server running on port ${env.PORT}`);
});

export default app;
