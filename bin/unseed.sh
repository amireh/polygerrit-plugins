#!/usr/bin/env bash

# Remove sample data from Gerrit.
#
# USAGE:
#
#     ./bin/unseed.sh
#
# Make sure you have added your public SSH key to the gerrit "Administrator"
# account. To verify, you should be able to run the following command:
#
#     ssh -p 29418 admin@localhost gerrit version
#

GERRIT_HOST="${GERRIT_HOST:-localhost}"
GERRIT_PORT="${GERRIT_PORT:-29418}"
GERRIT_USER="${GERRIT_USER:-admin}"

ssh -p $GERRIT_PORT "$GERRIT_USER"@"$GERRIT_HOST" \
  gerrit plugin install 'https://gerrit-ci.gerritforge.com/job/plugin-delete-project-bazel-stable-2.15/lastSuccessfulBuild/artifact/bazel-genfiles/plugins/delete-project/delete-project.jar'

ssh -p $GERRIT_PORT "$GERRIT_USER"@"$GERRIT_HOST" \
  delete-project delete --force --yes-really-delete banana

rm -rf build/banana
