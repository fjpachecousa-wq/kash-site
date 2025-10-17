import { customAlphabet } from "nanoid";

const nano = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 8);

function makeKashId() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate() + 0).padStart(2, "0");
  return `KASH-${yyyy}${mm}${dd}-${nano()}`;
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
    const kashId = makeKashId();
    return res.status(201).json({ kashId });
  } catch (e) {
    if (import.meta.env && import.meta.env.DEV) console.error("create-case error:", e);
    return res.status(500).json({ error: "Internal error" });
  }
}
