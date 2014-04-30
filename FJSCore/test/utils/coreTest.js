describe("coreTest", function () {
    it("test1", function () {
        var map ={a:1, b:2, c:3, d:4}, doneFlag, resultStr="";
        runs(function(){
           fjs.utils.Core.asyncForIn(map, function(key, value, next){
               resultStr+="{";
               setTimeout(function(){
                   resultStr+=key+":"+value+"}";
                   next();
               },100);

           }, function(){
               doneFlag = true;
           });
        });
        waitsFor(function () {
            return doneFlag;
        }, "Flag should be set", 5000);
        runs(function(){
            expect(true).toBe(doneFlag);
            expect("{a:1}{b:2}{c:3}{d:4}").toBe(resultStr);
        });
    });

    it("test2", function () {
        var map ={a:1, b:2, c:3, d:4}, doneFlag, resultStr="";
        runs(function(){

            fjs.utils.Core.asyncForIn(map, function(key, value, next){
                setTimeout(function(){
                    next();
                },100);

            }, function(){
            });

            fjs.utils.Core.asyncForIn(map, function(key, value, next){
                setTimeout(function(){
                    next();
                },100);

            }, function(){
            });

            fjs.utils.Core.asyncForIn(map, function(key, value, next){
                resultStr+="{";
                setTimeout(function(){
                    resultStr+=key+":"+value+"}";
                    next();
                },100);

            }, function(){
                doneFlag = true;
            });
        });
        waitsFor(function () {
            return doneFlag;
        }, "Flag should be set", 5000);
        runs(function(){
            expect(true).toBe(doneFlag);
            expect("{a:1}{b:2}{c:3}{d:4}").toBe(resultStr);
        });

    });


});