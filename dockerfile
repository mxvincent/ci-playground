ARG NODE_VERSION=18.18

###
# Base image for following stages
###
FROM node:${NODE_VERSION}-alpine as base

ARG PNPM_VERSION=8.6.11
ARG TURBO_VERSION=1.10

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app

#RUN apk update
#RUN apk add --no-cache libc6-compat
RUN corepack enable
RUN corepack prepare pnpm@$PNPM_VERSION --activate
RUN pnpm install -g turbo@$TURBO_VERSION


###
# Prepare a subset of the repository containing only the application and its dependencies
###
FROM base AS pruner

ARG APPLICATION_NAME

COPY . .

RUN pnpm turbo prune --docker --scope=$APPLICATION_NAME


###
# Install dependencies and build application
###
FROM base as builder

ARG NPM_REGISTRY_TOKEN

RUN echo "//npm.pkg.github.com/:_authToken=$NPM_REGISTRY_TOKEN" >> .npmrc

# Copy lockfile and package.json's of isolated workspaces
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml

# First install dependencies (as they change less often)
RUN #--mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --ignore-scripts
RUN pnpm install --ignore-scripts

# Copy source code of isolated workspaces
COPY --from=pruner /app/out/full/ .
RUN pnpm turbo run build:swc
RUN #--mount=type=cache,id=pnpm,target=~/.pnpm-store pnpm prune --prod --no-optional --config.ignore-scripts=true
RUN rm -rf ./**/*/src
RUN rm -rf ./**/*/node_modules
RUN pnpm install --prod --no-optional --ignore-scripts --frozen-lockfile


###
# Application packager
###
FROM base as runner

# Define some environment variables
ENV NODE_ENV production
ENV LOG_LEVEL info
ENV APP_SERVER_HOST 0.0.0.0
ENV APP_SERVER_PORT 4000

COPY --from=builder /app /app
