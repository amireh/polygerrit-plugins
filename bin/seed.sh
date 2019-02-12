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

export GERRIT_HOST="${GERRIT_HOST:-localhost}"
export GERRIT_PORT="${GERRIT_PORT:-29418}"
export GERRIT_USER="${GERRIT_USER:-admin}"

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

  # Create a bunch of users:
  if ! gerrit ls-members "'Non-Interactive Users'" | grep -qF 'emperor'; then
    gerrit create-account \
      --group "'Non-Interactive Users'" \
      --full-name "'Emperor Tamarin'" \
      --email "'emperor@instructure.com'" \
      --ssh-key - emperor < ~/.ssh/id_rsa.pub || exit $?
  fi

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

  git config --local --add user.name 'Administrator'
  git config --local --add user.email 'admin@example.com'

  # Submit a change:
  (
    git branch -v | grep -F 'sample-01' || {
      git checkout -b sample-01 master &&
      touch foo &&
      git add foo &&
      git commit --author='Administrator <admin@example.com>' -m '[01] add foo' &&
      gerrit-upsert
    }
  ) || exit $?

  # Submit another change:
  (
    git branch -v | grep -F 'sample-02' || {
      git checkout -b sample-02 sample-01 &&
      touch bar &&
      git add bar &&
      git commit --author='Administrator <admin@example.com>' -m '[02] add bar' &&
      gerrit-upsert
    }
  ) || exit $?

  # Submit another change:
  (
    git branch -v | grep -F 'sample-03' || {
      git checkout -b sample-03 sample-02 &&
      touch baz &&
      git add baz &&
      git commit --author='Administrator <admin@example.com>' -m '[03] add baz' &&
      gerrit-upsert
    }
  ) || exit $?

  git config --local --add user.name 'Emperor Tamarin'
  git config --local --add user.email 'emperor@instructure.com'

  # Submit a change by another user:
  (
    git branch -v | grep -F 'sample-04' || {
      git checkout -b sample-04 sample-03 &&
      git rm baz &&
      git commit --author='Emperor Tamarin <emperor@instructure.com>' -m '[01] remove baz' &&
      git push "ssh://emperor@${GERRIT_HOST}:${GERRIT_PORT}/banana" \
        HEAD:refs/for/master%r=Administrator
    }
  ) || exit $?

  (
    git branch -v | grep -F 'sample-05-01' || {
      git checkout -b sample-05-01 sample-04 &&
      git rm bar &&
      git commit --author='Emperor Tamarin <emperor@instructure.com>' -m '[02.a] remove bar' &&
      git push "ssh://emperor@${GERRIT_HOST}:${GERRIT_PORT}/banana" \
        HEAD:refs/for/master%r=Administrator
    }
  ) || exit $?
  (
    git branch -v | grep -F 'sample-05-02' || {
      git checkout -b sample-05-02 sample-04 &&
      git rm foo &&
      git commit --author='Emperor Tamarin <emperor@instructure.com>' -m '[02.b] remove foo' &&
      git push "ssh://emperor@${GERRIT_HOST}:${GERRIT_PORT}/banana" \
        HEAD:refs/for/master%r=Administrator
    }
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
    git push "${1:-origin}" HEAD:refs/for/master
  fi
}

# ENTRYPOINT

main
