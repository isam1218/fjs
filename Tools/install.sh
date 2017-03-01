#!/bin/bash
pushd `dirname $0` > /dev/null
FJ_ROOT_DIR=..

pushd $FJ_ROOT_DIR/FJSHUD
npm install
rc=$?; if [[ $rc != 0 ]]; then exit $rc; fi
popd

pushd $FJ_ROOT_DIR/FJSHUD/app
bower install
rc=$?; if [[ $rc != 0 ]]; then exit $rc; fi
popd



popd > /dev/null