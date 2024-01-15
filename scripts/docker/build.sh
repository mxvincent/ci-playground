cd $(dirname $(dirname $0))

APPLICATION_NAME="${1:-service-a}"
DOCKER_IMAGE=ghcr.io/mxvincent/$APPLICATION_NAME
DOCKER_TAG=latest

# get application version from package.json
APP_VERSION=$(awk -F'"' '/"version": ".+"/{ print $4; exit; }' "./applications/$APPLICATION_NAME/package.json")
APP_VERSION_MAJOR="${APP_VERSION%%\.*}"
APP_VERSION_MINOR="${APP_VERSION#*.}"
APP_VERSION_MINOR="${APP_VERSION_MINOR%.*}"
APP_VERSION_PATCH="${APP_VERSION##*.}"

docker buildx build . -f "./dockerfile" \
  --build-arg "APPLICATION_NAME=$APPLICATION_NAME" \
  --platform linux/arm64 \
  --tag "$DOCKER_IMAGE:$APP_VERSION_MAJOR.$APP_VERSION_MINOR.$APP_VERSION_PATCH" \
  --tag "$DOCKER_IMAGE:$APP_VERSION_MAJOR.$APP_VERSION_MINOR" \
  --tag "$DOCKER_IMAGE:$APP_VERSION_MAJOR" \
  --tag "$DOCKER_IMAGE:$DOCKER_TAG"
