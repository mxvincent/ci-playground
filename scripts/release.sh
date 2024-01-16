###
# Release
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

# Checkout next branch
git checkout next
git pull next

# Exit pre-release mode
if [ -f "$CHANGESET_PATH/pre.json" ]
then
   pnpm exec changeset pre exit
   git add "$CHANGESET_PATH"
   git commit -m "chore: exit pre-release mode (next)" --no-verify
fi

git checkout main
git pull origin main
git merge next
git push origin main next --no-verify


