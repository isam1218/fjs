describe("IndexedDBProvider", function() {
    var dbName = 'dbTest';
    var dbVersion = 11;

    var TestModel1 = function(id, field1, field2) {
        this.id = id;
        this.field1 = field1;
        this.field2 = field2;
    };
    var TestModel2 = function(id, field3, field4, field5) {
        this.id = id;
        this.field3 = field3;
        this.field4 = field4;
        this.field5 = field5;
    };

    it("check", function() {
        if((fjs.utils.Browser.isIE() && fjs.utils.Browser.getIEVersion()>=10)
            || fjs.utils.Browser.isChrome()
            || fjs.utils.Browser.isFirefox()
            || fjs.utils.Browser.isOpera()) {
            expect(true).toBe(fjs.db.IndexedDBProvider.check(window));
        }
    });
    it("open", function(){
        if(fjs.db.IndexedDBProvider.check(window)) {
            var doneFlag, tablesCount = 0;
            runs(function(){
                var db = new fjs.db.IndexedDBProvider(window);
                db.declareTable("tTest1", "id", ["field1", "field2"]);
                db.declareTable("tTest2", "id", ["field3", "field4", ["field3", "field4"]]);
                db.open(dbName, dbVersion , function(){
                    tablesCount = db.db.objectStoreNames.length;
                    doneFlag = true;
                });
            });
            waitsFor(function() {
                return doneFlag;
            }, "Flag should be set", 2000);
            runs(function(){
                expect(true).toBe(doneFlag);
                expect(2).toBe(tablesCount);
            });
        }
    });

    it("insertOne/selectByKey", function() {
        if(fjs.db.IndexedDBProvider.check(window)) {
            var doneFlag;
            /**
             * @type {TestModel1}
             */
            var item1 = null;
            runs(function(){
                var db = new fjs.db.IndexedDBProvider(window);
                db.declareTable("tTest1", "id", ["field1", "field2"]);
                db.declareTable("tTest2", "id", ["field3", "field4", ["field3", "field4"]]);
                db.open(dbName, dbVersion , function(){
                    db.deleteByKey("tTest1", null, function(){});
                    db.deleteByKey("tTest2", null, function(){});
                    db.insertOne("tTest1", new TestModel1('1', true, 'test1'), function(){
                        setTimeout(function(){
                            db.selectByKey("tTest1", '1', function(item) {
                                item1 = item;
                                doneFlag = true;
                            });
                        }, 0);
                    });
                });
            });
            waitsFor(function() {
                return doneFlag;
            }, "Flag should be set", 2000);

            runs(function(){
                expect(true).toBe(doneFlag);
                expect('1').toBe(item1.id);
                expect(true).toBe(item1.field1);
                expect('test1').toBe(item1.field2);
            });
        }
    });

    it("insertArray/selectAll", function(){
        if(fjs.db.IndexedDBProvider.check(window)) {
            var doneFlag, itemsCount, item1, item2;
            /**
             * @type {TestModel1}
             */
            runs(function(){
                var db = new fjs.db.IndexedDBProvider(window);
                db.declareTable("tTest1", "id", ["field1", "field2"]);
                db.declareTable("tTest2", "id", ["field3", "field4", ["field3", "field4"]]);
                db.open(dbName, dbVersion , function(){
                    db.deleteByKey("tTest1", null, function(){});
                    db.deleteByKey("tTest2", null, function(){});
                    var items = [];
                    for(var i=0; i<100;i++) {
                        items.push(new TestModel1(i+"", !!(i%2), "test"+i));
                    }
                    db.insertArray("tTest1", items, function(){
                        db.selectAll("tTest1", function(item){

                            if(item.id == '1') {
                                item1 = item;
                            }
                            if(item.id == '2') {
                                item2 = item
                            }
                        },
                        function(items){
                            itemsCount = items.length;
                            doneFlag= true;
                        }
                        );
                    });
                });
            });
            waitsFor(function() {
                return doneFlag;
            }, "Flag should be set", 2000);
            runs(function(){
                expect(true).toBe(doneFlag);
                expect(100).toBe(itemsCount);
                expect('1').toBe(item1.id);
                expect(true).toBe(item1.field1);
                expect('test1').toBe(item1.field2);
                expect('2').toBe(item2.id);
                expect(false).toBe(item2.field1);
                expect('test2').toBe(item2.field2);
            });
        }
    });

    it("selectByIndex1", function(){
        if(fjs.db.IndexedDBProvider.check(window)) {
            var doneFlag, itemsCount, item1;
            /**
             * @type {TestModel1}
             */
            runs(function(){
                var db = new fjs.db.IndexedDBProvider(window);
                db.declareTable("tTest1", "id", ["field1", "field2"]);
                db.declareTable("tTest2", "id", ["field3", "field4", ["field3", "field4"]]);
                db.open(dbName, dbVersion , function(){
                    db.deleteByKey("tTest1", null, function(){});
                    db.deleteByKey("tTest2", null, function(){});
                    var items = [];
                    var str = "";
                    for(var i=0; i<100;i++) {
                        items.push(new TestModel2(i+"", str, "test"+i, !!(i%2)));
                        str+="1";
                    }
                    db.insertArray("tTest2", items, function(){
                        db.selectByIndex("tTest2", {"field4": "test2"}, function(item){
                                item1 = item;
                            },
                            function(items){
                                itemsCount = items.length;
                                doneFlag= true;
                            }
                        );
                    });
                });
            });
            waitsFor(function() {
                return doneFlag;
            }, "Flag should be set", 2000);
            runs(function(){
                expect(true).toBe(doneFlag);
                expect(1).toBe(itemsCount);
                expect('2').toBe(item1.id);
                expect(false).toBe(item1.field5);
                expect('test2').toBe(item1.field4);
                expect('11').toBe(item1.field3);
            });
        }
    });
    it("selectByIndex2", function(){
        if(fjs.db.IndexedDBProvider.check(window)) {
            var doneFlag, itemsCount, item1;
            /**
             * @type {TestModel1}
             */
            runs(function(){
                var db = new fjs.db.IndexedDBProvider(window);
                db.declareTable("tTest1", "id", ["field1", "field2"]);
                db.declareTable("tTest2", "id", ["field3", "field4", ["field3", "field4"]]);
                db.open(dbName, dbVersion , function(){
                    db.deleteByKey("tTest1", null, function(){});
                    db.deleteByKey("tTest2", null, function(){});
                    var items = [];
                    var str = "";
                    for(var i=0; i<100;i++) {
                        items.push(new TestModel2(i+"", str, "test"+i, !!(i%2)));
                        str+="1";
                    }
                    db.insertArray("tTest2", items, function(){
                        db.selectByIndex("tTest2", {"field3":"11", "field4": "test2"}, function(item){
                                item1 = item;
                            },
                            function(items){
                                itemsCount = items.length;
                                doneFlag= true;
                            }
                        );
                    });
                });
            });
            waitsFor(function() {
                return doneFlag;
            }, "Flag should be set", 2000);
            runs(function(){
                expect(true).toBe(doneFlag);
                expect(1).toBe(itemsCount);
                expect('2').toBe(item1.id);
                expect(false).toBe(item1.field5);
                expect('test2').toBe(item1.field4);
                expect('11').toBe(item1.field3);
            });
        }
    });
    it("selectByIndex3", function(){
        if(fjs.db.IndexedDBProvider.check(window)) {
            var doneFlag, itemsCount;
            /**
             * @type {TestModel1}
             */
            runs(function(){
                var db = new fjs.db.IndexedDBProvider(window);
                db.declareTable("tTest1", "id", ["field1", "field2"]);
                db.declareTable("tTest2", "id", ["field3", "field4", ["field3", "field4"]]);
                db.open(dbName, dbVersion , function(){
                    db.deleteByKey("tTest1", null, function(){});
                    db.deleteByKey("tTest2", null, function(){});
                    var items = [];
                    for(var i=0; i<100;i++) {
                        var bv = !!(i%2);
                        items.push(new TestModel2(i+"", bv ? "123" : "321", "test"+i, bv));
                    }
                    db.insertArray("tTest2", items, function(){
                        db.selectByIndex("tTest2", {"field3":"123"}, function(item){

                            },
                            function(items){
                                itemsCount = items.length;
                                doneFlag= true;
                            }
                        );
                    });
                });
            });
            waitsFor(function() {
                return doneFlag;
            }, "Flag should be set", 2000);
            runs(function(){
                expect(true).toBe(doneFlag);
                expect(50).toBe(itemsCount);
            });
        }
    });
    it("deleteByIndex", function(){
        if(fjs.db.IndexedDBProvider.check(window)) {
            var doneFlag, itemsCount, deletedItemsCount;
            /**
             * @type {TestModel1}
             */
            runs(function(){
                var db = new fjs.db.IndexedDBProvider(window);
                db.declareTable("tTest1", "id", ["field1", "field2"]);
                db.declareTable("tTest2", "id", ["field3", "field4", ["field3", "field4"]]);
                db.open(dbName, dbVersion , function(){
                    db.deleteByKey("tTest1", null, function(){});
                    db.deleteByKey("tTest2", null, function(){});
                    var items = [];
                    for(var i=0; i<100;i++) {
                        var bv = !!(i%2);
                        items.push(new TestModel2(i+"", bv ? "123" : "321", "test"+i, bv));
                    }
                    db.insertArray("tTest2", items, function(){
                        db.deleteByIndex("tTest2", {"field3":"123"}, function(deletedItems){
                            deletedItemsCount = deletedItems.length;
                            db.selectAll("tTest2", function(item){}, function(items){
                               itemsCount = items.length;
                                doneFlag = true;
                            });
                        });
                    });
                });
            });
            waitsFor(function() {
                return doneFlag;
            }, "Flag should be set", 2000);
            runs(function(){
                expect(true).toBe(doneFlag);
                expect(50).toBe(itemsCount);
                expect(50).toBe(deletedItemsCount);
            });
        }
    });
});
