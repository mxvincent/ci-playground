###
# Bump packages versions
###

# Bump updated packages
pnpm exec changeset version

# Regenerate lockfile
pnpm install --lockfile-only
git add pnpm-lock.yaml

# Generate deployment manifests
pnpm --filter kubernetes generate-manifests
