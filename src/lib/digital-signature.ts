import crypto from "crypto";
import { prisma } from "./prisma";

/**
 * Generate SHA-256 hash of document content.
 */
export function hashDocument(content: string): string {
  return crypto.createHash("sha256").update(content, "utf8").digest("hex");
}

/**
 * Sign a document by creating an immutable signature record.
 * This is a preparatory implementation for future ICP-Brasil integration.
 */
export async function signDocument(params: {
  documentId: string;
  signerId: string;
  signerName: string;
  signerCrm?: string;
  content: string;
}) {
  const hash = hashDocument(params.content);

  const signature = await prisma.documentSignature.create({
    data: {
      documentId: params.documentId,
      signerId: params.signerId,
      signerName: params.signerName,
      signerCrm: params.signerCrm,
      hash,
    },
  });

  return signature;
}

/**
 * Verify document integrity by comparing content hash against stored signature.
 */
export async function verifyDocument(
  documentId: string,
  content: string
): Promise<{
  valid: boolean;
  signatures: {
    signerName: string;
    signerCrm: string | null;
    signedAt: Date;
    hashMatch: boolean;
  }[];
}> {
  const currentHash = hashDocument(content);

  const signatures = await prisma.documentSignature.findMany({
    where: { documentId },
    orderBy: { signedAt: "desc" },
  });

  return {
    valid: signatures.length > 0 && signatures.every((s) => s.hash === currentHash),
    signatures: signatures.map((s) => ({
      signerName: s.signerName,
      signerCrm: s.signerCrm,
      signedAt: s.signedAt,
      hashMatch: s.hash === currentHash,
    })),
  };
}
