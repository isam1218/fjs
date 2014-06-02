#!/bin/bash
. $WORKSPACE/inject.properties
git config --global http.sslVerify false
git tag -a $GIT_TAG -m ' '
git push origin $GIT_TAG
pushd hud-buildid
echo $HEAD_COMMIT > head_commit
git add head_commit
git commit -m "commit anchor for changelist `date`"
git push origin master
