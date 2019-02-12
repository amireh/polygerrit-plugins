#!/usr/bin/env bash

# Run a gerrit command through the ssh interface.
#
# USAGE:
#
#     ./bin/gerrit.sh COMMAND
#
# Make sure you have added your public SSH key to the gerrit "Administrator"
# account. To verify, you should be able to run the following command:
#
#     ssh -p 29418 admin@localhost gerrit version
#

GERRIT_HOST="${GERRIT_HOST:-localhost}"
GERRIT_PORT="${GERRIT_PORT:-29418}"
GERRIT_USER="${GERRIT_USER:-admin}"

ssh -p $GERRIT_PORT "$GERRIT_USER"@"$GERRIT_HOST" gerrit "$@"
