# KCB IPN Express Backend

Node.js and Express backend for receiving KCB IPN callbacks.

## Setup

```bash
npm install
```

Add these values in `.env`:

```env
PORT=3002
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
FIRESTORE_DATABASE_ID=(default)
FIRESTORE_REGISTRATIONS_COLLECTION=registrations
```

## Run Locally

```bash
npm run dev
```

For production-style local run:

```bash
npm run build
npm start
```

## Endpoints

Health check:

```http
GET http://localhost:3002/health
```

KCB IPN:

```http
POST http://localhost:3002/kcb/ipn
Content-Type: application/json
```

Example body:

```json
{
  "transactionReference": "KCB123456",
  "requestId": "REQ123456",
  "channelCode": "207",
  "timestamp": "2026-09-04T12:00:00Z",
  "transactionAmount": 1,
  "currency": "KES",
  "customerReference": "KCBTILLNO-YOURACCREF",
  "customerName": "Test User",
  "customerMobileNumber": "254713863322",
  "balance": 0,
  "narration": "school fee payment",
  "creditAccountIdentifier": "KCBTILLNO",
  "organizationShortCode": "",
  "tillNumber": "KCBTILLNO"
}
```
