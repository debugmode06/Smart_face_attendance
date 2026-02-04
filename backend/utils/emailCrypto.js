import crypto from "crypto";

const ALGO = "aes-256-gcm";
const KEY = Buffer.from(process.env.EMAIL_ENC_KEY, "utf8"); // must be 32 bytes

export function encryptEmail(email) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, KEY, iv);

  let encrypted = cipher.update(email, "utf8", "base64");
  encrypted += cipher.final("base64");

  const authTag = cipher.getAuthTag().toString("base64");

  return `${iv.toString("base64")}:${authTag}:${encrypted}`;
}

export function decryptEmail(enc) {
  if (!enc || !enc.includes(":")) return null;

  try {
    const [ivB64, tagB64, dataB64] = enc.split(":");

    const iv = Buffer.from(ivB64, "base64");
    const tag = Buffer.from(tagB64, "base64");

    const decipher = crypto.createDecipheriv(ALGO, KEY, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(dataB64, "base64", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (e) {
    return null;
  }
}
