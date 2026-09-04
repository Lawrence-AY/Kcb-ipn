import dotenv from "dotenv";

dotenv.config();

const readEnv = (key: string, fallback = "") =>
  String(process.env[key] || fallback).trim().replace(/^['"]|['"]$/g, "");

export const env = {
  PORT: Number(readEnv("PORT", "3001")),
  FIREBASE_PROJECT_ID: readEnv("FIREBASE_PROJECT_ID"),
  FIREBASE_CLIENT_EMAIL: readEnv("FIREBASE_CLIENT_EMAIL"),
  FIREBASE_PRIVATE_KEY: readEnv("FIREBASE_PRIVATE_KEY"),
  FIRESTORE_DATABASE_ID: readEnv("FIRESTORE_DATABASE_ID", "(default)"),
  FIRESTORE_REGISTRATIONS_COLLECTION: readEnv("FIRESTORE_REGISTRATIONS_COLLECTION", "registrations"),
};
