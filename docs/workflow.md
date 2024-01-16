# GIT workflow

Our git workflow contains two permanent branches:
- `main`: contains code ready to be released in production
- `next`: contains WIP changes for the next release

All features for the next version will be merged on `next` branch.
Non-critical fixes should be merged on `next` branch.

Critical bug fixes should be merged on `main` branch.

## Release `next` changes into `main` upstream

```shell
git checkout main
git merge next
git push
```

## Sync `next` branch after changes on `main`

### 1 - Create a branch from `next`

```shell
git checkout -b sync/merge-main-into-next -- origin next
```

### 2 - Merge main changes

At this stage, it is very likely that we will encounter conflicts, and we must resolve them.

```shell
git merge --no-commit origin main
```
Version and dependencies changes in `package.json` should be imported from `main`.

Some conflict can be automatically resolved but ⚠️ be careful, changes present on `next` branch will be overridden.

```shell
# Changelogs 
git checkout --theirs -- '../applications/*/CHANGELOG.md'
git add -- '../applications/*/CHANGELOG.md'

# Kubernetes manifests
git checkout --theirs -- '../node-packages/kubernetes/manifests/*'
git add -- '../node-packages/kubernetes/manifests/*'
```

Remaining conflicts should be resolved manually.

### 3 - Commit and push changes

```shell
git commit -m "chore: merge `main` into `next`"
git push
```

