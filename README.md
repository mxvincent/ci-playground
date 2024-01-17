# CI playground repository

This repository is used for testing purposes to develop continuous integration workflows.


## `main` branch

`main` branch will be used for production. 

To develop new feature we should use the `next` branch and when features are ready to be released, we can merge them into `main`.

It's also possible to merge a critical hotfix directly on `main`.

The release workflow is the following:
1. merge something in `main` with a changeset (can be a `next` merge)
2. ci will bump version in release mode and create a pull request for the release
3. merge release pull request to trigger a release

We need to merge `next` into `main` to make a release.

```shell
bash ./scripts/release-next.md
```


## `next` branch

`next` branch will be used for development. On next branch we are doing pre-release using changeset. 

The pre-release workflow is identical to the release workflow:
1. merge something in `next` with a changeset
2. ci will bump version in pre-release mode and create a release pull request
3. merge release pull request to trigger a pre-release

We need to sync `next` when something is released on `main`.

```shell
bash ./scripts/sync-next.md
```
