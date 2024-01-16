###
# Release stuff merged into next
###

# Set repository root as working directory
working_directory=$0
while [ "$ROOT_DIRECTORY" != '/' ] && [ ! -f "$working_directory/pnpm-workspace.yaml" ]
do
  working_directory=$(dirname "$working_directory")
done
cd "$working_directory" || exit

# Update local branches
git fetch origin main:main
git fetch origin next:next

# Checkout main
git checkout main

# Merge next into main
git merge next --no-commit
git commit -m 'chore: merge `next` into `main`' --no-verify

# Exit pre-release mode
if [ -f "$working_directory/.changeset/pre.json" ]
then
   pnpm exec changeset pre exit
   git add "$CHANGESET_PATH"
   git commit -m "chore: exit pre-release mode (next)" --no-verify
fi

git push origin main --no-verify

