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
git pull next
git checkout next

# Get changeset pre-release tag
if [ -f "$CHANGESET_PATH/pre.json" ]
then
  changeset_prerelease=$(awk -F'"' '/"tag": ".+"/{ print $4; exit; }' "$CHANGESET_PATH/pre.json")
  echo "pre-release-channel=$changeset_prerelease"
fi

# Exit pre-release mode
if [ -f "$CHANGESET_PATH/pre.json" ]
then
   pnpm exec changeset pre exit
   git commit -m "chore(release): exit pre-release mode (next)"
fi

git pull main
git checkout main
git merge next
git push origin main next


