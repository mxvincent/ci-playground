#!/usr/bin/env bash

find .. -path 'packages/*/.turbo' -type d -prune -exec rm -rf '{}' +
find .. -path 'packages/*/dist' -type d -prune -exec rm -rf '{}' +
find .. -name 'packages/*/*.tsbuildinfo' -prune -exec rm -rf '{}' +
