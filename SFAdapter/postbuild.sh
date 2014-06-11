#!/bin/bash
. $WORKSPACE/inject.properties
git config --global http.sslVerify false
git tag -a $GIT_TAG -m ' '
git push origin $GIT_TAG
