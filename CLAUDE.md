# HomeoClinic Pro — Project Context

## Overview
HomeoClinic Pro is a professional SaaS platform for homeopathic clinics, providing electronic medical records, homeopathic repertory, repertorization engine, and practice management — fully compliant with Brazilian LGPD and CFM regulations.

## Business Model
- B2B SaaS for homeopathic professionals (monthly/annual subscription)
- Target: homeopaths, naturopaths, integrative medicine practitioners in Brazil
- Competitive advantage: largest Portuguese homeopathic repertory (188,669 rubrics), AI-assisted repertorization, LGPD-native

## Tech Stack (Target Architecture)
- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes or separate Node.js/Express
- **Database**: PostgreSQL (Supabase or self-hosted) with Prisma ORM
- **Auth**: NextAuth.js or Supabase Auth with JWT + RBAC
- **Encryption**: AES-256-GCM for data at rest (LGPD requirement)
- **Search**: PostgreSQL full-text search or Meilisearch for repertory
- **AI**: OpenAI/Anthropic API for intelligent symptom analysis
- **Deployment**: Vercel (frontend) + Supabase/Railway (database)
- **Payments**: Stripe or Asaas (Brazilian payment processor)

## Data Assets (Already Extracted)
All data was reverse-engineered from SIHORE MAX 7.0 proprietary binary databases:

### Repertory (Core Asset)
- **188,669 rubrics** across **55 chapters**
- **3,943 homeopathic remedies** with synonyms
- Each rubric contains: symptom in Portuguese, symptom in English, remedy list with grading, miasm info
- Remedy grading system: UPPERCASE = grade 3 (highest), Capitalized = grade 2, lowercase = grade 1
- Data format in `sr_homeopata_data.js`: `[symptomPT, symptomEN, remedies_string, numRemedies, miasm]`
- Chapter map available in `window.SH_DATA.chapterMap`

### Supporting Databases
- **6,860 allopathic medications** (DEF database)
- **98,710 medical dictionary entries**
- **6,723 correlates** (remedy cross-references)
- **554 phytotherapy plants**
- **3,327 materia medica texts** (indexed, text files available)

### Source Data Location
- Extracted JSON: `/sihore_data/repertory.json` (108 MB), `def_medications.json`, `dicionario.json`, `correlatos.json`, `fitoterapia.json`, `textos_index.json`
- Extraction script: `extract_sihore.py`
- Compiled JS data: `sr_homeopata_data.js` (55 MB)
- Original SIHORE binaries: `../REPER/*.DB`, `../DEF.DB`, `../DICIONARIO.DB`, etc.

### Binary Database Format (for reference)
The proprietary .DB format was reverse-engineered:
```
Header: header_block_size (4 bytes LE) + field_count (4 bytes LE)
Fields: null-terminated strings (field names)
Records: record_data_size (4 bytes LE, negative = deleted) + null-terminated field values
Encoding: latin-1
Record alignment: next_record_offset = record_start + abs(record_data_size)
```

## Existing Prototype
`HomeoClinicPro.html` is a working single-file prototype (115 KB) demonstrating all features:

### Implemented Modules
1. **Authentication** — Login with AES-256 encryption (Web Crypto API), PBKDF2 key derivation
2. **LGPD Compliance** — Consent flow, privacy policy, data subject rights (Art. 18), DPO management, consent tracking per patient, audit trail, data retention policies (20 years for medical records)
3. **Patient Management** — Full registration (CPF, RG, address, insurance), LGPD consent checkbox, search, export CSV
4. **Clinical Records (Prontuário)** — Patient data view, consultation history, new consultations (complaint, anamnesis, physical exam, diagnosis, repertorial symptoms, prescription, evolution)
5. **Homeopathic Anamnesis** — Dedicated form for: mental symptoms, general symptoms, food desires/aversions, sleep/dreams, perspiration, thermoregulation, gynecological, particular symptoms
6. **Repertory Browser** — 55 chapters with sidebar navigation, paginated rubrics (50/page), global search across 188K rubrics with debounce
7. **Repertorization Engine** — Grade-based scoring, multi-rubric analysis, top 30 ranking with visual bars
8. **Prescriptions** — Generate, save, print formatted prescriptions
9. **Documents** — TCLE (informed consent), medical certificates (atestado), clinical reports, privacy policy, data export (LGPD portability)
10. **Scheduling (Agenda)** — Daily view with 30-min slots, appointment booking
11. **Financial** — Income/expense tracking, balance summary
12. **Audit Trail** — All operations logged (login, patient changes, consultations, exports, LGPD actions), exportable CSV
13. **Settings** — Clinic data, CRM, DPO configuration, backup/restore
14. **AI Assistant** — Keyword search across repertory with rubric suggestions

## Legal Compliance Requirements

### LGPD (Lei nº 13.709/2018)
- Art. 11, II, "f" — Health data processing by health professionals
- Art. 18 — Data subject rights (access, correction, deletion, portability)
- Art. 41 — DPO (Data Protection Officer) designation
- Art. 46 — Security measures (encryption, access control, audit)
- Art. 48 — Breach notification within 72 hours
- Data retention: 20 years for medical records (CFM)
- Granular consent management per patient
- Data anonymization/pseudonymization capability

### CFM (Conselho Federal de Medicina)
- Resolução CFM 1.821/2007 — Electronic medical records requirements
- Resolução CFM 1.638/2002 — Medical record content standards
- NGS2 (Nível de Garantia de Segurança 2) — SBIS/CFM certification standard
- Digital signature support (ICP-Brasil or equivalent)
- Record immutability (audit trail, no deletion of clinical entries)
- Lei nº 13.787/2018 — Digitalization of medical records

### Lei nº 13.787/2018
- Digital records have same legal value as paper
- Requirements: integrity, authenticity, legibility

## Database Schema (Suggested for PostgreSQL)

### Core Tables
```sql
-- Multi-tenant: each clinic is a tenant
clinics (id, name, cnpj, phone, email, address, crm, dpo_name, dpo_email, settings_json, created_at)
users (id, clinic_id, name, email, password_hash, role, crm, specialty, active, created_at)
patients (id, clinic_id, name, cpf, rg, birth_date, sex, phone, email, address, profession, insurance, notes, lgpd_consent, lgpd_consent_date, created_at, updated_at)
consultations (id, patient_id, user_id, date, complaint, anamnesis, physical_exam, diagnosis, repertorial_symptoms, prescription, evolution, created_at)
anamnesis (id, patient_id, mental, general, desires, sleep, perspiration, thermoregulation, gyneco, particular, updated_at)

-- Repertory (read-only, seeded from extracted data)
chapters (id, code, name, rubric_count)
rubrics (id, chapter_id, symptom_pt, symptom_en, remedy_list, remedy_count, miasm)
remedies (id, code, name, synonym)

-- Supporting
appointments (id, clinic_id, patient_id, user_id, date, time, type, notes, status)
financial (id, clinic_id, date, type, description, patient_id, amount, created_by)
documents (id, patient_id, type, content_json, created_by, created_at)
audit_log (id, clinic_id, user_id, action, details, ip, timestamp)
lgpd_consents (id, patient_id, consent_type, granted, date, revoked_date)
```

## Key Implementation Notes

### Repertory Search Optimization
The repertory has 188K rubrics. For production:
- Index `symptom_pt` and `symptom_en` with PostgreSQL `gin_trgm_ops` for fuzzy search
- Or use Meilisearch/Typesense for instant search
- Cache chapter data in Redis for fast browsing
- Consider lazy loading chapters (they range from 92 to 18,924 rubrics)

### Remedy Grading Parser
```typescript
function parseRemedies(remedyString: string): Remedy[] {
  return remedyString.trim().split(/\s+/).map(name => ({
    name,
    grade: name === name.toUpperCase() && name.length > 1 ? 3
         : name[0] === name[0].toUpperCase() && name.length > 1 ? 2
         : 1
  }));
}
```

### Encryption Strategy
- AES-256-GCM for sensitive data columns (patient PII, clinical notes)
- Application-level encryption (not just database-level)
- Key management: derive from clinic master password or use KMS
- PBKDF2 with 100,000 iterations for password hashing (or Argon2id)

### Multi-tenancy
- Row-level security with `clinic_id` on all tables
- Each clinic has isolated data
- Shared repertory data (read-only, no clinic_id needed)

## Development Priorities
1. **Phase 1**: Auth + Patient CRUD + Consultation CRUD + Basic UI
2. **Phase 2**: Repertory browser + Search + Repertorization engine
3. **Phase 3**: LGPD compliance (consent, audit, export, DPO)
4. **Phase 4**: Documents (TCLE, prescriptions, certificates)
5. **Phase 5**: Agenda + Financial + AI assistant
6. **Phase 6**: Multi-tenant, payments, deployment

## Commands
```bash
# Development
npm run dev          # Start Next.js dev server
npm run db:migrate   # Run Prisma migrations
npm run db:seed      # Seed repertory data
npm run db:studio    # Open Prisma Studio
npm run lint         # ESLint
npm run test         # Jest/Vitest tests
npm run build        # Production build

# Data
python3 extract_sihore.py  # Re-extract from SIHORE binaries
python3 build_data.py      # Build JS data file
python3 seed_db.py         # Seed PostgreSQL from extracted JSON
```
