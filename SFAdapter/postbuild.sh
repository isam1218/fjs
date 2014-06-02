#!/bin/bash
. $WORKSPACE/inject.properties
git config --global http.sslVerify false
git tag -a $GIT_TAG -m ' '
git push origin $GIT_TAG
echo $HEAD_COMMIT > `echo $BRANCH`_track
git add *_track
git commit -m "commit anchor for Jenkins changelist"
git push origin $BRANCH
