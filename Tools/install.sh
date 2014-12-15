#!/bin/sh
cd ../FJSCore
rm -rf bower_components

cd ../FJSModel
rm -rf bower_components

cd ../FJSDB
rm -rf bower_components

cd ../FJSTabs
rm -rf bower_components

cd ../FJSFDP
rm -rf bower_components

cd ../FJSPlugin
rm -rf bower_components

cd ../FJSAPI
rm -rf bower_components

cd ../FJSHUD
rm -rf bower_components


cd ../FJSCore
npm install
grunt
cd ../FJSModel
npm install
grunt
cd ../FJSDB
npm install
grunt
cd ../FJSTabs
npm install
grunt
cd ../FJSFDP
npm install
grunt
cd ../FJSPlugin
npm install
grunt
cd ../FJSAPI
npm install
grunt
cd ../FJSHUD
npm install
bower install
