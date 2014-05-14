#!/bin/bash
CURRENT=`cat count.txt`
RVERSION="huc-fdp-3.7.0.`echo $CURRENT`.noarch.rpm"
RSTAMP=`cat buildtimestamp`
GIT_TAG=server_build_`echo $RSTAMP`_`echo $CURRENT`
git config --global http.sslVerify false
git tag -a $GIT_TAG -m ' '
git push origin $GIT_TAG
rm -rf count.txt
rm -rf buildtimestamp
