import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";

const mod = await import("../src/generated/prisma/client.ts");
const PrismaClient = mod.PrismaClient;
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  const passwordHash = await bcrypt.hash("admin123", 12);

  const clinic = await prisma.clinic.upsert({
    where: { id: "clinic-default" },
    update: {},
    create: {
      id: "clinic-default",
      name: "Clínica Homeopática Modelo",
      cnpj: "12.345.678/0001-90",
      phone: "(11) 3456-7890",
      email: "contato@clinicamodelo.com.br",
      address: "Rua das Flores, 123 - São Paulo/SP",
      crm: "CRM/SP 12345",
      dpoName: "Dr. Responsável LGPD",
      dpoEmail: "dpo@clinicamodelo.com.br",
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@homeoclinic.com" },
    update: {},
    create: {
      clinicId: clinic.id,
      name: "Administrador",
      email: "admin@homeoclinic.com",
      passwordHash,
      role: "admin",
      crm: "CRM/SP 12345",
      specialty: "Homeopatia",
    },
  });

  const patient1 = await prisma.patient.upsert({
    where: { id: "patient-maria" },
    update: {},
    create: {
      id: "patient-maria",
      clinicId: clinic.id,
      name: "Maria Silva",
      cpf: "123.456.789-00",
      birthDate: new Date("1985-03-15"),
      sex: "F",
      phone: "(11) 98765-4321",
      email: "maria.silva@email.com",
      address: "Av. Paulista, 1000 - São Paulo/SP",
      profession: "Professora",
      insurance: "Unimed",
      lgpdConsent: true,
      lgpdConsentDate: new Date(),
    },
  });

  const patient2 = await prisma.patient.upsert({
    where: { id: "patient-joao" },
    update: {},
    create: {
      id: "patient-joao",
      clinicId: clinic.id,
      name: "João Santos",
      cpf: "987.654.321-00",
      birthDate: new Date("1978-07-22"),
      sex: "M",
      phone: "(11) 91234-5678",
      email: "joao.santos@email.com",
      address: "Rua Augusta, 500 - São Paulo/SP",
      profession: "Engenheiro",
      insurance: "Bradesco Saúde",
      lgpdConsent: true,
      lgpdConsentDate: new Date(),
    },
  });

  await prisma.consultation.create({
    data: {
      patientId: patient1.id,
      userId: admin.id,
      date: new Date("2026-03-01"),
      complaint: "Cefaleia crônica há 3 meses, pior lado esquerdo",
      anamnesis:
        "Paciente refere dores de cabeça frequentes, agravadas por estresse e calor. Melhora com compressas frias. Sono inquieto.",
      diagnosis: "Cefaleia tensional crônica",
      prescription: "Bryonia alba 30CH - 3 glóbulos SL, 2x/dia por 30 dias",
      evolution: "Retorno em 30 dias para reavaliação",
    },
  });

  await prisma.consultation.create({
    data: {
      patientId: patient2.id,
      userId: admin.id,
      date: new Date("2026-03-05"),
      complaint: "Insônia há 2 meses, ansiedade",
      anamnesis:
        "Dificuldade para adormecer, pensamentos acelerados à noite. Ansiedade antecipatória. Deseja doces.",
      diagnosis: "Insônia por ansiedade",
      prescription:
        "Argentum nitricum 200CH - dose única\nPassiflora incarnata TM - 20 gotas antes de dormir",
      evolution: "Orientado sobre higiene do sono. Retorno em 15 dias.",
    },
  });

  await prisma.anamnesis.upsert({
    where: { patientId: patient1.id },
    update: {},
    create: {
      patientId: patient1.id,
      mental: "Irritabilidade, desejo de ficar sozinha quando doente",
      general: "Calor agrava, sede aumentada",
      desires: "Desejo de alimentos ácidos, aversão a gordura",
      sleep: "Sono leve, acorda com dor de cabeça",
      perspiration: "Transpira pouco",
      thermoregulation: "Calorenta, piora com calor",
    },
  });

  await prisma.auditLog.create({
    data: {
      clinicId: clinic.id,
      userId: admin.id,
      action: "LOGIN",
      details: "Seed: login inicial do sistema",
    },
  });

  console.log("Seed completed successfully!");
  console.log(`  Clinic: ${clinic.name}`);
  console.log(`  Admin: ${admin.email} / admin123`);
  console.log(`  Patients: ${patient1.name}, ${patient2.name}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
