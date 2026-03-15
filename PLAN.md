# HomeoClinic Pro — Plano de Comercialização

## Diagnóstico: O que já existe vs. O que falta

### JA IMPLEMENTADO
- Auth (login/registro) com NextAuth.js + JWT
- CRUD completo: pacientes, consultas, anamnese, documentos, agenda, financeiro
- Repertório (188K rubricas seeded em produção)
- Repertorização (4 métodos)
- AI wizard (análise de sintomas + prescrição com OpenAI)
- LGPD: consentimento, auditoria, exportação, anonimização, DPO
- Stripe: checkout, webhook, portal, planos (free/pro/enterprise)
- Rate limiting (middleware)
- Security headers (CSP, HSTS, X-Frame-Options)
- Backup script
- Nginx config
- Docker + CI/CD (GitHub Actions)
- Landing page com preços
- Billing page com usage meters

### FALTA PARA COMERCIALIZAR (em ordem de prioridade)

## Fase 1: SSL + DNS (Bloqueante - sem isso ninguém paga)
1. Configurar Nginx no droplet com o arquivo já pronto (`scripts/nginx.conf`)
2. Apontar DNS `homeoclinic.pro` -> `143.244.171.61`
3. Instalar Certbot para SSL automático (Let's Encrypt)
4. Atualizar `NEXTAUTH_URL` para `https://homeoclinic.pro`
5. Recriar container Docker

> **Requer ação do usuário**: Configurar DNS no registrador do domínio

## Fase 2: Verificação de Email no Registro (Segurança)
6. Adicionar campo `emailVerified` e `emailVerificationToken` no schema Prisma
7. Criar migration
8. Enviar email de verificação no registro (usar `src/lib/email.ts` existente)
9. Criar rota `/api/auth/verify-email`
10. Criar página `/verify-email` com feedback
11. Bloquear login de emails não verificados

## Fase 3: Trial com Expiração Real
12. Setar `trialEndsAt = now + 14 dias` no registro de nova clínica
13. Criar middleware que verifica trial expirado nas rotas protegidas
14. Criar página `/trial-expired` com CTA para upgrade
15. Enviar email 3 dias antes do trial expirar (via cron/scheduled task)

## Fase 4: Stripe em Produção
16. Criar produtos e preços no Stripe Dashboard (Profissional R$149, Enterprise R$349)
17. Configurar webhook endpoint no Stripe
18. Adicionar `STRIPE_*` env vars em produção
19. Testar fluxo completo: checkout -> webhook -> atualização de plano
20. Adicionar `NEXT_PUBLIC_STRIPE_PRICE_PROFESSIONAL` para o botão de upgrade

> **Requer ação do usuário**: Criar conta Stripe e produtos

## Fase 5: Páginas Legais (LGPD obrigatório)
21. Criar `/termos` — Termos de Uso
22. Criar `/privacidade` — Política de Privacidade
23. Criar `/contato` — Página de contato
24. Links já existem no footer, só faltam as páginas

## Fase 6: Email Transacional (Brevo)
25. Configurar BREVO_API_KEY em produção
26. Testar envio de emails: boas-vindas, reset de senha, convites, trial expiring

> **Requer ação do usuário**: Criar conta Brevo e obter API key

## Fase 7: Backup Automatizado
27. Configurar cron no droplet: `0 3 * * * /opt/homeoclinic/app/scripts/backup.sh`
28. Script já existe e funciona

## Fase 8: Polimentos Finais
29. Adicionar favicon e og:image para compartilhamento social
30. Testar fluxo completo end-to-end em produção
31. Merge `master` -> `main` para ativar CD pipeline

---

## O QUE EU POSSO FAZER AGORA (código):
- Fase 2: Verificação de email (schema + rotas + páginas)
- Fase 3: Trial com expiração (middleware + página + lógica)
- Fase 5: Páginas legais (termos, privacidade, contato)
- Fase 8: Favicon, og:image, polimentos

## O QUE DEPENDE DO USUÁRIO:
- Fase 1: DNS (apontar domínio)
- Fase 4: Stripe (criar conta + produtos)
- Fase 6: Brevo (criar conta + API key)
- Fase 7: SSH no droplet para configurar cron
