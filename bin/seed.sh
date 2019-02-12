#!/usr/bin/env bash

# Seed Gerrit with sample data.
#
# USAGE:
#
#     ./bin/seed.sh
#
# Make sure you have added your public SSH key to the gerrit "Administrator"
# account. To verify, you should be able to run the following command:
#
#     ssh -p 29418 admin@localhost gerrit version
#

GERRIT_HOST="${GERRIT_HOST:-localhost}"
GERRIT_PORT="${GERRIT_PORT:-29418}"
GERRIT_USER="${GERRIT_USER:-admin}"

main() {
  gerrit version || {
    echo "$0: ensure you have configured SSH access to gerrit" 1>&2
    echo "$0: by adding your public key from the web interface:" 1>&2
    echo "$0:" 1>&2
    echo "$0:     http://localhost:8080/settings/#SSHKeys" 1>&2
    echo "$0:" 1>&2
    echo "$0: To verify your access, the following command must succeed:" 1>&2
    echo "$0:" 1>&2
    echo "$0:     ssh -p $GERRIT_PORT $GERRIT_USER@$GERRIT_HOST" 1>&2
    echo "$0:" 1>&2

    exit 1
  }

  # Create the project:
  gerrit ls-projects | grep -q banana || {
    gerrit create-project banana \
      --change-id TRUE \
      --empty-commit \
      --require-change-id
  } || exit $?

  mkdir -p build || exit $?

  # Clone the repository:
  if [[ ! -d build/banana ]]; then
    (cd build && gerrit-clone "banana") || exit $?
  fi

  cd build/banana || exit $?

  # Restore master to a clean state (survive through project removals):
  git fetch origin master &&
  git checkout --quiet FETCH_HEAD &&
  git branch --quiet -D master &&
  git checkout -b master

  # Submit a change:
  (
    git checkout -B sample-01 master &&
    touch foo &&
    git add foo &&
    git commit -m '[01] add foo' &&
    gerrit-upsert
  ) || exit $?

  # Submit another change:
  (
    git checkout -B sample-02 sample-01 &&
    touch bar &&
    git add bar &&
    git commit -m '[02] add bar' &&
    gerrit-upsert
  ) || exit $?

  # Submit another change:
  (
    git checkout -B sample-03 sample-02 &&
    touch baz &&
    git add baz &&
    git commit -m '[03] add baz' &&
    gerrit-upsert
  ) || exit $?

}

# UTIL

gerrit() {
  ssh -p "$GERRIT_PORT" "$GERRIT_USER"@"$GERRIT_HOST" gerrit "$@"
}

gerrit-clone() {
  git clone ssh://"$GERRIT_USER"@"$GERRIT_HOST":"$GERRIT_PORT"/"$1" &&
  scp -p -P $GERRIT_PORT "$GERRIT_USER"@"$GERRIT_HOST":hooks/commit-msg $1/.git/hooks/
}

gerrit-upsert() {
  if ! gerrit query --format json -- status:open | grep -qF "$(git reflog -1 --format='%s')"; then
    git push origin HEAD:refs/for/master
  fi
}

# ENTRYPOINT

main
