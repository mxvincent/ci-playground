#!/usr/bin/env bash

PACKAGE_JSON_PATH="$GITHUB_WORKSPACE/$PACKAGE_PATH/package.json"

# get package name
NAME=$(awk -F'"' '/"name": ".+"/{ print $4; exit; }' "$PACKAGE_JSON_PATH")
echo "name=$NAME"

# get package version
VERSION=$(awk -F'"' '/"version": ".+"/{ print $4; exit; }' "$PACKAGE_JSON_PATH")
echo "version=$VERSION"
