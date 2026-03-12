import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  clinicName: z.string().optional(),
});

export const patientSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  cpf: z.string().optional(),
  rg: z.string().optional(),
  birthDate: z.string().optional(),
  sex: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  address: z.string().optional(),
  profession: z.string().optional(),
  insurance: z.string().optional(),
  notes: z.string().optional(),
  lgpdConsent: z.boolean().default(false),
});

export const consultationSchema = z.object({
  patientId: z.string().min(1, "Paciente é obrigatório"),
  date: z.string().min(1, "Data é obrigatória"),
  complaint: z.string().min(1, "Queixa principal é obrigatória"),
  anamnesis: z.string().optional(),
  physicalExam: z.string().optional(),
  diagnosis: z.string().optional(),
  repertorialSymptoms: z.string().optional(),
  prescription: z.string().optional(),
  evolution: z.string().optional(),
});

export const anamnesisSchema = z.object({
  mental: z.string().optional(),
  general: z.string().optional(),
  desires: z.string().optional(),
  sleep: z.string().optional(),
  perspiration: z.string().optional(),
  thermoregulation: z.string().optional(),
  gyneco: z.string().optional(),
  particular: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type PatientInput = z.infer<typeof patientSchema>;
export type ConsultationInput = z.infer<typeof consultationSchema>;
export type AnamnesisInput = z.infer<typeof anamnesisSchema>;

export const documentSchema = z.object({
  patientId: z.string().min(1, "Paciente é obrigatório"),
  type: z.enum(["tcle", "prescription", "certificate", "report"]),
  title: z.string().min(1, "Título é obrigatório"),
  content: z.string().min(1, "Conteúdo é obrigatório"),
});
export type DocumentInput = z.infer<typeof documentSchema>;

export const appointmentSchema = z.object({
  patientId: z.string().optional(),
  date: z.string().min(1, "Data é obrigatória"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Horário inválido"),
  duration: z.number().min(15).max(120).default(30),
  type: z.enum(["consultation", "follow-up", "first-visit"]),
  notes: z.string().optional(),
});
export type AppointmentInput = z.infer<typeof appointmentSchema>;

export const financialSchema = z.object({
  date: z.string().min(1, "Data é obrigatória"),
  type: z.enum(["income", "expense"]),
  description: z.string().min(1, "Descrição é obrigatória"),
  patientId: z.string().optional(),
  amount: z.number().positive("Valor deve ser positivo"),
  category: z.string().optional(),
});
export type FinancialInput = z.infer<typeof financialSchema>;
