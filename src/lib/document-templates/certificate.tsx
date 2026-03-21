import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: "Helvetica",
    fontSize: 12,
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: "#0d9488",
    paddingBottom: 12,
    marginBottom: 30,
  },
  clinicName: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#0d9488",
  },
  clinicInfo: {
    fontSize: 9,
    color: "#666",
    marginTop: 4,
  },
  title: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginBottom: 30,
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  body: {
    lineHeight: 1.8,
    textAlign: "justify",
    marginBottom: 20,
  },
  date: {
    textAlign: "right",
    marginTop: 30,
    fontSize: 11,
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: "#333",
    width: 200,
    marginTop: 60,
    alignSelf: "center",
  },
  signatureText: {
    fontSize: 10,
    textAlign: "center",
    marginTop: 4,
  },
});

export interface CertificateData {
  clinicName: string;
  clinicAddress?: string;
  clinicPhone?: string;
  doctorName: string;
  doctorCrm: string;
  patientName: string;
  date: string;
  city: string;
  content: string; // The certificate text body
  daysOff?: number;
}

export function CertificatePDF({ data }: { data: CertificateData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.clinicName}>{data.clinicName}</Text>
          {data.clinicAddress && (
            <Text style={styles.clinicInfo}>{data.clinicAddress}</Text>
          )}
          {data.clinicPhone && (
            <Text style={styles.clinicInfo}>Tel: {data.clinicPhone}</Text>
          )}
        </View>

        <Text style={styles.title}>Atestado Médico</Text>

        <Text style={styles.body}>{data.content}</Text>

        <Text style={styles.date}>
          {data.city}, {data.date}
        </Text>

        <View style={styles.signatureLine} />
        <Text style={styles.signatureText}>{data.doctorName}</Text>
        <Text style={styles.signatureText}>CRM: {data.doctorCrm}</Text>
      </Page>
    </Document>
  );
}
