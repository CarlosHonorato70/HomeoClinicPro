# Como migrar para o Claude Code

## O que é o Claude Code?
Claude Code é a ferramenta de linha de comando da Anthropic para desenvolvimento assistido por IA. Diferente do Cowork (onde estamos agora), ele roda direto no seu terminal e tem acesso total ao seu projeto.

## Passo a Passo

### 1. Instalar o Claude Code

Abra o terminal (PowerShell ou CMD) e execute:

```bash
npm install -g @anthropic-ai/claude-code
```

Precisa ter Node.js 18+ instalado. Se não tem: https://nodejs.org

### 2. Copiar a pasta do projeto

A pasta `homeoclinic-pro` no seu desktop contém tudo. Mova para onde quiser desenvolver:

```bash
# Exemplo: mover para C:\projetos
mkdir C:\projetos
xcopy /E /I "%USERPROFILE%\OneDrive\Área de trabalho\SIHOREMAX7\homeoclinic-pro" C:\projetos\homeoclinic-pro
```

### 3. Iniciar o Claude Code no projeto

```bash
cd C:\projetos\homeoclinic-pro
claude
```

O Claude Code vai detectar automaticamente o `CLAUDE.md` e carregar todo o contexto do projeto — ele vai saber:
- O que é o HomeoClinic Pro
- A arquitetura planejada (Next.js, PostgreSQL, Prisma)
- Os 188.669 rubricas e toda a base de dados
- Os requisitos LGPD e CFM
- O esquema do banco de dados
- As prioridades de desenvolvimento

### 4. Primeiros comandos sugeridos

Quando o Claude Code abrir, peça:

```
Inicialize o projeto Next.js com TypeScript, Tailwind, shadcn/ui e Prisma.
Configure o schema do banco conforme o CLAUDE.md.
```

Depois:

```
Crie o sistema de autenticação com NextAuth.js,
criptografia AES-256 e o fluxo de consentimento LGPD.
```

E então:

```
Implemente o CRUD de pacientes com a tabela de listagem,
formulário de cadastro e integração com Prisma.
```

### 5. Seeding da base de dados

Os JSONs extraídos estão em `data/extracted/`. Para carregar no PostgreSQL:

```
Crie um script de seed que leia os JSONs em data/extracted/
e popule as tabelas de chapters, rubrics e remedies no PostgreSQL.
```

## Estrutura do Projeto

```
homeoclinic-pro/
├── CLAUDE.md              ← Contexto completo (o Claude Code lê isso)
├── .gitignore
├── data/
│   ├── extracted/         ← JSONs com 188K rubricas, remédios, etc.
│   │   ├── repertory.json (108 MB)
│   │   ├── def_medications.json
│   │   ├── dicionario.json
│   │   ├── correlatos.json
│   │   ├── fitoterapia.json
│   │   └── textos_index.json
│   └── scripts/
│       ├── extract_sihore.py  ← Re-extrair dos binários SIHORE
│       └── build_data.py      ← Gerar JS de dados
├── prototype/
│   ├── HomeoClinicPro.html    ← Protótipo funcional (referência visual)
│   └── sr_homeopata_data.js   ← Dados compilados para o protótipo
└── docs/
    └── MIGRATION_GUIDE.md     ← Este arquivo
```

## Dica Importante

O `CLAUDE.md` é o arquivo mágico. O Claude Code o lê automaticamente ao iniciar e usa como contexto permanente. Tudo que acumulamos — o formato do banco binário, os requisitos LGPD, o schema SQL, as regras de grading de remédios — está lá. Você não precisa re-explicar nada.
