import { describe, it, expect } from "vitest";
import {
  passwordSchema,
  validatePassword,
  loginSchema,
  patientSchema,
  consultationSchema,
  anamnesisSchema,
  documentSchema,
  appointmentSchema,
} from "../validations";

describe("passwordSchema", () => {
  it("accepts valid password", () => {
    expect(passwordSchema.safeParse("Str0ng!Pass").success).toBe(true);
  });

  it("rejects too short password", () => {
    expect(passwordSchema.safeParse("Sh0!t").success).toBe(false);
  });

  it("rejects without uppercase", () => {
    expect(passwordSchema.safeParse("nouppercase1!").success).toBe(false);
  });

  it("rejects without lowercase", () => {
    expect(passwordSchema.safeParse("NOLOWERCASE1!").success).toBe(false);
  });

  it("rejects without number", () => {
    expect(passwordSchema.safeParse("NoNumber!!").success).toBe(false);
  });

  it("rejects without special char", () => {
    expect(passwordSchema.safeParse("NoSpecial1x").success).toBe(false);
  });
});

describe("validatePassword", () => {
  it("returns null for valid password", () => {
    expect(validatePassword("Valid1!pass")).toBeNull();
  });

  it("returns error message for invalid password", () => {
    const error = validatePassword("weak");
    expect(error).toBeTruthy();
    expect(typeof error).toBe("string");
  });
});

describe("loginSchema", () => {
  it("accepts valid login data", () => {
    const result = loginSchema.safeParse({
      email: "user@test.com",
      password: "password",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "password",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({
      email: "user@test.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("patientSchema", () => {
  it("accepts minimal patient data", () => {
    const result = patientSchema.safeParse({ name: "João" });
    expect(result.success).toBe(true);
  });

  it("accepts full patient data", () => {
    const result = patientSchema.safeParse({
      name: "João da Silva",
      cpf: "123.456.789-00",
      rg: "12.345.678-9",
      birthDate: "1990-01-15",
      sex: "M",
      phone: "(11) 99999-9999",
      email: "joao@email.com",
      address: "Rua teste, 123",
      profession: "Engenheiro",
      insurance: "Unimed",
      notes: "Paciente novo",
      lgpdConsent: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = patientSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects single char name", () => {
    const result = patientSchema.safeParse({ name: "A" });
    expect(result.success).toBe(false);
  });

  it("allows empty string for email", () => {
    const result = patientSchema.safeParse({ name: "João", email: "" });
    expect(result.success).toBe(true);
  });

  it("defaults lgpdConsent to false", () => {
    const result = patientSchema.safeParse({ name: "João" });
    if (result.success) {
      expect(result.data.lgpdConsent).toBe(false);
    }
  });
});

describe("consultationSchema", () => {
  it("accepts valid consultation", () => {
    const result = consultationSchema.safeParse({
      patientId: "patient-1",
      date: "2024-01-15",
      complaint: "Dor de cabeça recorrente",
    });
    expect(result.success).toBe(true);
  });

  it("rejects without patientId", () => {
    const result = consultationSchema.safeParse({
      date: "2024-01-15",
      complaint: "Dor",
    });
    expect(result.success).toBe(false);
  });

  it("rejects without complaint", () => {
    const result = consultationSchema.safeParse({
      patientId: "p1",
      date: "2024-01-15",
      complaint: "",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all optional fields", () => {
    const result = consultationSchema.safeParse({
      patientId: "p1",
      date: "2024-01-15",
      complaint: "Dor",
      anamnesis: "Paciente relata...",
      physicalExam: "PA 120x80",
      diagnosis: "Cefaleia tensional",
      repertorialSymptoms: "Head; pain; pressing",
      prescription: "Natrum muriaticum 30CH",
      evolution: "Melhora após 3 dias",
    });
    expect(result.success).toBe(true);
  });
});

describe("anamnesisSchema", () => {
  it("accepts all empty fields", () => {
    const result = anamnesisSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts full anamnesis", () => {
    const result = anamnesisSchema.safeParse({
      mental: "Ansiedade, irritabilidade",
      general: "Calor, sede aumentada",
      desires: "Desejo de sal, salgados",
      sleep: "Insônia, pesadelos",
      perspiration: "Suor nos pés",
      thermoregulation: "Calorento",
      gyneco: "N/A",
      particular: "Cefaleia frontal",
    });
    expect(result.success).toBe(true);
  });
});

describe("documentSchema", () => {
  it("accepts valid document", () => {
    const result = documentSchema.safeParse({
      patientId: "p1",
      type: "prescription",
      title: "Receita",
      content: "Sulphur 30CH...",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid type", () => {
    const result = documentSchema.safeParse({
      patientId: "p1",
      type: "invalid",
      title: "T",
      content: "C",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid types", () => {
    for (const type of ["tcle", "prescription", "certificate", "report"]) {
      const result = documentSchema.safeParse({
        patientId: "p1",
        type,
        title: "Title",
        content: "Content",
      });
      expect(result.success).toBe(true);
    }
  });
});

describe("appointmentSchema", () => {
  it("accepts valid appointment", () => {
    const result = appointmentSchema.safeParse({
      date: "2024-01-15",
      time: "14:30",
      type: "consultation",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid time format", () => {
    const result = appointmentSchema.safeParse({
      date: "2024-01-15",
      time: "2:30",
      type: "consultation",
    });
    expect(result.success).toBe(false);
  });

  it("accepts teleconsulta type", () => {
    const result = appointmentSchema.safeParse({
      date: "2024-01-15",
      time: "09:00",
      type: "teleconsulta",
    });
    expect(result.success).toBe(true);
  });
});
