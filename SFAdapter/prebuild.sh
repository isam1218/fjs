#!/bin/bash
if [[ -f count.txt ]]; then rm -rf count.txt; fi
rm -rf $WORKSPACE/fdp.package/target/rpmbuild/RPMS/noarch/*
cd $WORKSPACE/fdp
if [[ -d hud-buildid ]]; then rm -rf hud-buildid; fi
git clone  https://hud_sync:_baYoUB*1121188821@bitbucket.org/fonality/hud-buildid.git
pushd hud-buildid
read index < count.txt
declare -i tmp=index+1
printf "10#%06d" $tmp > count.txt
git add count.txt
git commit -m "increment build_id"
git push origin master
sed -i.bak 's/^...//g' count.txt
popd
cp -rf hud-buildid/count.txt .
