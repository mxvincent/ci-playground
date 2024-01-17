###
# Release stuff merged into next
# -> merge `next` into `main`
###

# Set repository root as working directory
working_directory=$0
while [ "$ROOT_DIRECTORY" != '/' ] && [ ! -f "$working_directory/pnpm-workspace.yaml" ]
do
  working_directory=$(dirname "$working_directory")
done
cd "$working_directory" || exit
changeset_path="$working_directory/.changeset"

# Update local branches
git fetch origin main:main
git fetch origin next:next

# Merge next into main
git checkout main
git merge next --no-commit
git commit -m 'chore: merge `next` into `main`' --no-verify

# Exit pre-release mode
if [ -f "$changeset_path/pre.json" ]
then
   pnpm exec changeset pre exit
   git add "$changeset_path"
   git commit -m "chore: exit pre-release mode (next)" --no-verify
fi

git push origin main --no-verify


