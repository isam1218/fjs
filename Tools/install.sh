#!/bin/bash
echo FJSCore Install
cd ../FJSCore
npm install
grunt
echo FJSModel Install
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
