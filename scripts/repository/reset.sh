#!/usr/bin/env bash

# Set repository root as working directory
working_directory=$0
while [ "$ROOT_DIRECTORY" != '/' ] && [ ! -f "$working_directory/pnpm-workspace.yaml" ]
do
  working_directory=$(dirname "$working_directory")
done
cd "$working_directory" || exit


# Reset repository state
for workspace in "applications" "packages"
do
  package_json_manifests=$(find "$workspace" -name package.json)
  for package_json_path in $package_json_manifests
  do
    echo "package_json=$package_json_path"
    package_directory=$(dirname "$package_json_path")
    echo "package_directory=$package_directory"

    # Remove changelog
    changelog_path="$package_directory/CHANGELOG.md"
    if [ -f "$changelog_path" ]
    then
       rm "$package_directory/CHANGELOG.md"
    fi

    # Reset package version
    cat <<< "$(jq '.version="0.0.0"' "$package_json_path")" > "$package_json_path"
  done
done

# Delete all local git tags
if [ -f .git ]
then
  git tag | xargs git tag -d
fi



