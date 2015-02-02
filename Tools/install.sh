#!/bin/bash
pushd `dirname $0` > /dev/null
FJ_ROOT_DIR=..
components=( FJSCore FJSModel FJSDB FJSTabs FJSFDP FJSPlugin FJSAPI )
for comp in "${components[@]}"
do 
    pushd $FJ_ROOT_DIR/${comp}
    npm install
    grunt
    popd
done
pushd $FJ_ROOT_DIR/FJSHUD
npm install
bower install
popd

pushd $FJ_ROOT_DIR/FJSHUD/app/styles
lessc main.less > main.css
popd 

popd > /dev/null
