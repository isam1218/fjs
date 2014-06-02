#!/bin/bash
# PREBUILD SCRIPT 
git config --global http.sslVerify false
# gather workspace repo changelist



# delete files/folders created by previous build
for i in count.txt inject.properties build_tag *server_build_*; do
if [[ -f $i ]]; then rm -rf $i; fi; done
for i in hud-buildid *server_build_*; do
if [[ -d $i ]]; then rm -rf $i; fi; done

# retrieve latest build-number and set the new one - commit back to git
git clone  https://hud_sync:_baYoUB*1121188821@bitbucket.org/fonality/hud-buildid.git
pushd $WORKSPACE/hud-buildid
    read index < count.txt
    declare -i tmp=index+1
    printf "10#%06d" $tmp > count.txt
    git add count.txt
    git commit -m "increment build_id"
    git push origin master
    sed -i.bak 's/^...//g' count.txt
popd


# set GIT_TAG BUILD_NUMBER and TRIGGER_JOB_NAME envars
cp -rf $WORKSPACE/hud-buildid/count.txt $WORKSPACE/count.txt
CURRENT=`cat count.txt`
RSTAMP=`date +%Y%m%d_%H%M`
GIT_TAG=server_build_`echo $RSTAMP`_`echo $CURRENT`
echo -e "HEAD_COMMIT=`git rev-parse HEAD`
GIT_TAG=$GIT_TAG
BUILD_TIMESTAMP=$RSTAMP
BUILD_NUMBER=`cat $WORKSPACE/hud-buildid/count.txt`
TRIGGER_JOB_NAME=`echo $JOB_NAME`" > $WORKSPACE/inject.properties
