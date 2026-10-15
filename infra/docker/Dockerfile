# ==============================================================================
# NOITE FAMINTA: DOCKERFILE MULTI-STAGE SEGURO (ROOTLESS)
# DevSecOps: Compilação isolada e execução como usuário 'node' sem privilégios
# ==============================================================================

# Estágio 1: Build das dependências e compilação TypeScript
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependências necessárias para compilação nativa se houver
RUN apk add --no-cache libc6-compat

# Copiar manifestos de pacotes do monorepo
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/server/package.json ./packages/server/
COPY packages/client/package.json ./packages/client/

# Instalação limpa de dependências
RUN npm ci

# Copiar código-fonte
COPY packages/shared ./packages/shared
COPY packages/server ./packages/server

# Build dos pacotes
RUN npm run build --workspace=packages/shared
RUN npm run build --workspace=packages/server

# Estágio 2: Imagem final minimalista de produção
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Garantir usuário não-root (DevSecOps)
USER node

# Copiar apenas os arquivos compilados e dependências essenciais
COPY --chown=node:node --from=builder /app/package.json ./
COPY --chown=node:node --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --chown=node:node --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --chown=node:node --from=builder /app/packages/server/dist ./packages/server/dist
COPY --chown=node:node --from=builder /app/packages/server/package.json ./packages/server/
COPY --chown=node:node --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["node", "packages/server/dist/index.js"]
