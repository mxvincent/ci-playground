###
# Release script is intended to be called in CI by the changeset action
###

# Create git tags
pnpm exec changeset tag
git push --tags

# Publish packages to npm registry
echo "//npm.pkg.github.com/:_authToken=$GITHUB_TOKEN" >> ~/.npmrc
echo "publish is disabled"

echo pnpm publish
