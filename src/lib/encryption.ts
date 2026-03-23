/**
 * HomeoClinic Pro — Propriedade de Carlos Honorato
 * Protegido pela Lei 9.609/1998 (Lei do Software)
 * Todos os direitos reservados. Copia e distribuicao proibidas.
 */
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error("ENCRYPTION_KEY environment variable is required");
  }
  return Buffer.from(key, "hex");
}

export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "base64");
  encrypted += cipher.final("base64");
  const authTag = cipher.getAuthTag();

  return `${iv.toString("base64")}:${encrypted}:${authTag.toString("base64")}`;
}

export function decrypt(encrypted: string): string {
  const key = getKey();
  const [ivB64, dataB64, tagB64] = encrypted.split(":");

  if (!ivB64 || !dataB64 || !tagB64) {
    throw new Error("Formato de dados criptografados inválido");
  }

  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(tagB64, "base64");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(dataB64, "base64", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

export function tryDecrypt(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    return decrypt(value);
  } catch {
    return value;
  }
}
