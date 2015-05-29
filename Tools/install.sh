#!/bin/bash
pushd `dirname $0` > /dev/null
FJ_ROOT_DIR=..

pushd $FJ_ROOT_DIR/FJSHUD
npm install
bower install
popd

pushd $FJ_ROOT_DIR/FJSHUD/app/styles
lessc main.less > main.css
popd 

popd > /dev/null
