# Job Tracker

Aplicação para centralizar o acompanhamento de candidaturas de emprego e avisar sobre prazos e mudanças de status.

> Em desenvolvimento.

## Stack

- **Backend:** NestJS, Prisma 7, PostgreSQL, zod
- **Frontend:** React + Vite + TypeScript
- **Monorepo:** pnpm workspaces (`apps/api`, `apps/web`, `packages/shared`)

## Como rodar localmente

Pré-requisitos: Node LTS, pnpm e Docker.

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
docker compose up -d
pnpm --filter api exec prisma migrate dev
pnpm dev:api   # http://localhost:3000
pnpm dev:web   # http://localhost:5173
```
O Postgres do Docker usa a porta **5433** no host, para não conflitar com um Postgres local.

## Roadmap

- [x] Estrutura do monorepo e banco de dados
- [x] CRUD de candidaturas (API)
- [x] Interface em React com Kanban
- [ ] Autenticação com Google
- [ ] Lembretes e notificações
- [ ] Integração com Gmail
