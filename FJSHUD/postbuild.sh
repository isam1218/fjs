#!/bin/bash
. $WORKSPACE/inject.properties
echo $GIT_TAG
git config --global http.sslVerify false
git tag -a $GIT_TAG -m ' '
git push origin $GIT_TAG
