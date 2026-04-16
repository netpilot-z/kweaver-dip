#!/usr/bin/env bash
# Compute Docker image tags and Helm chart versions (same rules as CI image build).
# Writes GitHub Actions step outputs when GITHUB_OUTPUT is set.
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "${ROOT}"

SHORT_SHA="$(git rev-parse --short HEAD)"
SHOULD_PUSH_LATEST="false"

if [ "${GITHUB_REF_TYPE}" = "tag" ]; then
  RELEASE_VERSION="${GITHUB_REF_NAME#v}"
  if [ -z "${RELEASE_VERSION}" ]; then
    echo "ERROR: could not derive version from tag \"${GITHUB_REF_NAME}\"" >&2
    exit 1
  fi
  RELEASE_TAG="${RELEASE_VERSION}-${SHORT_SHA}"
  RELEASE_TAG_NO_SHA="${RELEASE_VERSION}"
else
  STUDIO_VERSION="$(
    grep -m 1 -v '^[[:space:]]*$' studio/VERSION |
      tr -d '\r' |
      sed 's/^[[:space:]]*//;s/[[:space:]]*$//'
  )"
  if [ -z "${STUDIO_VERSION}" ]; then
    echo "ERROR: could not read a non-empty version from studio/VERSION" >&2
    exit 1
  fi
  BRANCH_OR_REF="${GITHUB_REF_NAME//\//-}"
  RELEASE_TAG="${STUDIO_VERSION}-${BRANCH_OR_REF}-${SHORT_SHA}"
  RELEASE_TAG_NO_SHA="${STUDIO_VERSION}-${BRANCH_OR_REF}"
fi

if [ "${GITHUB_REF_NAME}" = "main" ] || [ "${GITHUB_REF_NAME}" = "master" ] || [ "${WORKFLOW_PUSH_LATEST:-false}" = "true" ]; then
  SHOULD_PUSH_LATEST="true"
fi

if [ -n "${GITHUB_OUTPUT:-}" ]; then
  {
    echo "release_tag=${RELEASE_TAG}"
    echo "release_tag_no_sha=${RELEASE_TAG_NO_SHA}"
    echo "push_latest=${SHOULD_PUSH_LATEST}"
  } >> "${GITHUB_OUTPUT}"
else
  echo "release_tag=${RELEASE_TAG}"
  echo "release_tag_no_sha=${RELEASE_TAG_NO_SHA}"
  echo "push_latest=${SHOULD_PUSH_LATEST}"
fi
