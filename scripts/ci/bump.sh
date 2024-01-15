###
# Bump packages versions
###

# Set repository root as working directory
working_directory=$0
while [ "$ROOT_DIRECTORY" != '/' ] && [ ! -f "$working_directory/pnpm-workspace.yaml" ]
do
  working_directory=$(dirname "$working_directory")
done
cd "$working_directory" || exit

# Assign default value to environment variables
: "${CHANGESET_PATH:=$working_directory/.changeset}"
echo "changeset-path=$CHANGESET_PATH"

# Define release upstream
branch=$(git rev-parse --abbrev-ref HEAD)
changeset_release_branch_prefix="changeset-release"
if [ "$branch" = "$changeset_release_branch_prefix/main" ]
then
  upstream="main"
elif [ "$branch" = "$changeset_release_branch_prefix/next" ]
then
  upstream="next"
else
  echo "Can bump from $branch"
  exit 1
fi
echo "branch=$branch"
echo "upstream=$upstream"

# Get changeset pre-release tag
if [ -f "$CHANGESET_PATH/pre.json" ]
then
  changeset_prerelease=$(awk -F'"' '/"tag": ".+"/{ print $4; exit; }' "$CHANGESET_PATH/pre.json")
  echo "pre-release-channel=$changeset_prerelease"
fi

# Check that the prerelease mode is correctly configured for the upstream
if [ -n "$changeset_prerelease" ] && {
  [ "$upstream" == "main" ] || [ "$changeset_prerelease" != "$upstream" ]
}
then
  pnpm exec changeset pre exit
fi
if [ "$upstream" != "main" ] && [ "$changeset_prerelease" != "$upstream" ]
then
  pnpm exec changeset pre enter "$upstream"
fi

# Bump updated packages
pnpm exec changeset version

# Regenerate lockfile
pnpm install --lockfile-only
git add pnpm-lock.yaml

# Generate deployment manifests
pnpm --filter kubernetes generate-manifests
