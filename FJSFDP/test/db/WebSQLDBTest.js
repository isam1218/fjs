describe("WebSQL", function() {
    it("test1", function(){
        if(fjs.db.WebSQLProvider.check(window)) {
            var testModel1 = function(id, f1, f2) {
                this.id = id;
                this.f1 = f1;
                this.f2 = f2;
            };
            var testModel2 = function(id, f3, f4) {
                this.id = id;
                this.f3 = f3;
                this.f4 = f4;
            };
            var doneFlag = false, item1, item2, item3, allItems, filteredItems1, filteredItems2;

            runs(function(){
                var idbP = new fjs.db.WebSQLProvider(window);

                idbP.declareTable("tTest1", "id", ["f1", "f2"]);
                idbP.declareTable("tTest2", "id", ["f3", "f4"]);

                idbP.open('dbTest', 1, function(){
                    //Clear
                    idbP.deleteByKey("tTest1", null, function(){});
                    idbP.deleteByKey("tTest2", null, function(){});
                    idbP.insertOne("tTest1", new testModel1('1', true, 'test1'), function(){
                        idbP.selectByKey("tTest1", "1", function(item){
                            item1 = item;
                        });
                    });

                    var arr = [];
                    for(var i = 0; i<20; i++) {
                        arr.push(new testModel2(i+"", i, "test"+i));
                    }
                    idbP.insertArray("tTest2", arr, function(){
                        idbP.selectAll("tTest2", function(item){

                        }, function(items){
                            allItems = items;
                        });
                        idbP.selectByIndex('tTest2', {"f3":3}, function(item){
                            item2 = item;
                        }, function(items){
                            filteredItems1 = items;
                        });
                        idbP.selectByIndex('tTest2', {"f3":3, "f4":"test3"}, function(item){
                            item3 = item;
                        }, function(items){
                            filteredItems2 = items;
                            doneFlag = true;
                        });
                    });
                });
            });

            waitsFor(function() {
                return doneFlag;
            }, "Flag should be set", 10000);

            runs(function(){
                expect("1").toBe(item1.id);
                expect(true).toBe(item1.f1);
                expect('test1').toBe(item1.f2);
                expect(20).toBe(allItems.length);
                expect(1).toBe(filteredItems1.length);
                expect("test3").toBe(item2.f4);
                expect("3").toBe(item2.id);
                expect(1).toBe(filteredItems2.length);
                expect("test3").toBe(item3.f4);
                expect("3").toBe(item3.id);
            });
        }
    });
});
