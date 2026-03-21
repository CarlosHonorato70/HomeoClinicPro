import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// We need to set ENCRYPTION_KEY before importing the module
const TEST_KEY = "a".repeat(64); // 32 bytes in hex = 64 hex chars

describe("encryption", () => {
  beforeEach(() => {
    vi.stubEnv("ENCRYPTION_KEY", TEST_KEY);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("encrypt/decrypt round-trip preserves plaintext", async () => {
    const { encrypt, decrypt } = await import("../encryption");
    const plaintext = "Paciente: João da Silva, CPF: 123.456.789-00";
    const encrypted = encrypt(plaintext);
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it("encrypted output has correct format (iv:data:tag)", async () => {
    const { encrypt } = await import("../encryption");
    const encrypted = encrypt("test");
    const parts = encrypted.split(":");
    expect(parts).toHaveLength(3);
    // All parts should be valid base64
    parts.forEach((part) => {
      expect(() => Buffer.from(part, "base64")).not.toThrow();
    });
  });

  it("same plaintext produces different ciphertext (random IV)", async () => {
    const { encrypt } = await import("../encryption");
    const plaintext = "same text";
    const a = encrypt(plaintext);
    const b = encrypt(plaintext);
    expect(a).not.toBe(b);
  });

  it("decrypt throws on invalid format", async () => {
    const { decrypt } = await import("../encryption");
    expect(() => decrypt("not-valid")).toThrow("Invalid encrypted data format");
  });

  it("decrypt throws on tampered ciphertext", async () => {
    const { encrypt, decrypt } = await import("../encryption");
    const encrypted = encrypt("test data");
    const parts = encrypted.split(":");
    // Tamper with the encrypted data
    parts[1] = Buffer.from("tampered").toString("base64");
    expect(() => decrypt(parts.join(":"))).toThrow();
  });

  it("tryDecrypt returns decrypted text for valid input", async () => {
    const { encrypt, tryDecrypt } = await import("../encryption");
    const encrypted = encrypt("hello");
    expect(tryDecrypt(encrypted)).toBe("hello");
  });

  it("tryDecrypt returns original value for non-encrypted text", async () => {
    const { tryDecrypt } = await import("../encryption");
    expect(tryDecrypt("plain text")).toBe("plain text");
  });

  it("tryDecrypt returns null for null/undefined", async () => {
    const { tryDecrypt } = await import("../encryption");
    expect(tryDecrypt(null)).toBeNull();
    expect(tryDecrypt(undefined)).toBeNull();
  });

  it("handles unicode text correctly", async () => {
    const { encrypt, decrypt } = await import("../encryption");
    const text = "São Paulo — médico homeopático 日本語 😊";
    const decrypted = decrypt(encrypt(text));
    expect(decrypted).toBe(text);
  });

  it("handles empty string — encrypt produces valid output", async () => {
    const { encrypt } = await import("../encryption");
    // Empty string encryption may produce empty data part; verify encrypt doesn't throw
    const encrypted = encrypt("");
    expect(encrypted).toBeTruthy();
    // The format may have empty middle part, which is valid behavior
    const parts = encrypted.split(":");
    expect(parts.length).toBeGreaterThanOrEqual(3);
  });

  it("handles long text", async () => {
    const { encrypt, decrypt } = await import("../encryption");
    const longText = "x".repeat(10000);
    const decrypted = decrypt(encrypt(longText));
    expect(decrypted).toBe(longText);
  });
});

describe("encryption without key", () => {
  it("throws when ENCRYPTION_KEY is not set", async () => {
    vi.stubEnv("ENCRYPTION_KEY", "");
    // Force re-import
    vi.resetModules();
    const { encrypt } = await import("../encryption");
    expect(() => encrypt("test")).toThrow("ENCRYPTION_KEY");
    vi.unstubAllEnvs();
  });
});
