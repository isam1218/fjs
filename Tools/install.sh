#!/bin/bash
pushd `dirname $0` > /dev/null
FJ_ROOT_DIR=..

pushd $FJ_ROOT_DIR/FJSHUD
npm install
popd

pushd $FJ_ROOT_DIR/FJSHUD/app
bower install
npm install angular-ui-bootstrap
bower install angular-bootstrap
popd


pushd $FJ_ROOT_DIR/FJSHUD/app/styles
lessc main.less > main.css
lessc nativeAlert.less > nativeAlert.css
lessc ie.less > ie.css
lessc firefox.less > firefox.css
lessc safari.less > safari.css
popd 

popd > /dev/null
