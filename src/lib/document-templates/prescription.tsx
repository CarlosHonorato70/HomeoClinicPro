import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 11,
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: "#0d9488",
    paddingBottom: 12,
    marginBottom: 20,
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
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginBottom: 20,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  section: {
    marginBottom: 12,
  },
  label: {
    fontSize: 9,
    color: "#666",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  value: {
    fontSize: 11,
  },
  prescriptionItem: {
    marginBottom: 10,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: "#0d9488",
  },
  remedyName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
  },
  dosage: {
    fontSize: 10,
    color: "#333",
    marginTop: 2,
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 12,
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: "#333",
    width: 200,
    marginTop: 40,
    alignSelf: "center",
  },
  signatureText: {
    fontSize: 10,
    textAlign: "center",
    marginTop: 4,
  },
  date: {
    fontSize: 10,
    textAlign: "right",
    marginTop: 20,
  },
});

export interface PrescriptionData {
  clinicName: string;
  clinicAddress?: string;
  clinicPhone?: string;
  clinicCnpj?: string;
  doctorName: string;
  doctorCrm: string;
  patientName: string;
  patientAge?: string;
  date: string;
  items: { remedy: string; potency: string; dosage: string; instructions: string }[];
  notes?: string;
}

export function PrescriptionPDF({ data }: { data: PrescriptionData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.clinicName}>{data.clinicName}</Text>
          {data.clinicAddress && (
            <Text style={styles.clinicInfo}>{data.clinicAddress}</Text>
          )}
          {data.clinicPhone && (
            <Text style={styles.clinicInfo}>Tel: {data.clinicPhone}</Text>
          )}
        </View>

        {/* Title */}
        <Text style={styles.title}>Receituário</Text>

        {/* Patient Info */}
        <View style={styles.section}>
          <Text style={styles.label}>Paciente</Text>
          <Text style={styles.value}>
            {data.patientName}
            {data.patientAge ? ` — ${data.patientAge} anos` : ""}
          </Text>
        </View>

        {/* Prescriptions */}
        <View style={styles.section}>
          <Text style={styles.label}>Prescrição</Text>
          {data.items.map((item, i) => (
            <View key={i} style={styles.prescriptionItem}>
              <Text style={styles.remedyName}>
                {i + 1}. {item.remedy} {item.potency}
              </Text>
              <Text style={styles.dosage}>Posologia: {item.dosage}</Text>
              {item.instructions && (
                <Text style={styles.dosage}>{item.instructions}</Text>
              )}
            </View>
          ))}
        </View>

        {/* Notes */}
        {data.notes && (
          <View style={styles.section}>
            <Text style={styles.label}>Observações</Text>
            <Text style={styles.value}>{data.notes}</Text>
          </View>
        )}

        {/* Date */}
        <Text style={styles.date}>{data.date}</Text>

        {/* Signature */}
        <View style={styles.signatureLine} />
        <Text style={styles.signatureText}>
          {data.doctorName}
        </Text>
        <Text style={styles.signatureText}>
          CRM: {data.doctorCrm}
        </Text>
      </Page>
    </Document>
  );
}
