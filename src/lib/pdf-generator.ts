import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { PrescriptionPDF, type PrescriptionData } from "./document-templates/prescription";
import { CertificatePDF, type CertificateData } from "./document-templates/certificate";

export type DocumentType = "prescription" | "certificate" | "report" | "tcle" | "referral";

/**
 * Generate a PDF buffer from structured document data.
 */
export async function generatePDF(
  type: DocumentType,
  data: Record<string, unknown>
): Promise<Buffer> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let component: React.ReactElement<any>;

  switch (type) {
    case "prescription":
      component = React.createElement(PrescriptionPDF, {
        data: data as unknown as PrescriptionData,
      });
      break;

    case "certificate":
      component = React.createElement(CertificatePDF, {
        data: data as unknown as CertificateData,
      });
      break;

    // Other templates can be added here
    default:
      throw new Error(`Unsupported document type: ${type}`);
  }

  const buffer = await renderToBuffer(component);
  return Buffer.from(buffer);
}
