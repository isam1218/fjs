#!/bin/bash
pushd `dirname $0` > /dev/null
FJ_ROOT_DIR=`pwd -P`/..
components=( FJSCORE FJSMODEL FJSDB FJSTabs FJSFDP FJSPlugin FJSAPI )
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
popd > /dev/null
