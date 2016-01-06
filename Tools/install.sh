#!/bin/bash
pushd `dirname $0` > /dev/null
FJ_ROOT_DIR=..

pushd $FJ_ROOT_DIR/FJSHUD
npm install
popd

pushd $FJ_ROOT_DIR/FJSHUD/app
bower install
popd



popd > /dev/null
