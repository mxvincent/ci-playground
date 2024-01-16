###
# Sync next branch after a release
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
git checkout main
git pull
git checkout next
git pull

# Merge main into next
git merge main --no-commit
git commit -m 'chore: merge `main` into `next`' --no-verify

# Enter pre-release mode
if [ -f "$changeset_path/pre.json" ]
then
  pnpm exec changeset pre exit
fi

pnpm exec changeset pre enter next
git add "$changeset_path"
git commit -m "chore: enter pre-release mode (next)" --no-verify

git push origin next --no-verify
