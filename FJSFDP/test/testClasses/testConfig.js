var CONFIG = {
    SERVER: {
        serverURL: "http://localhost:99"
        , loginURL: "http://localhost:99/oauth/authorize"
    }, providers: ['simple', 'sharedWorker', 'webWorker']
    , DB: {
        name: "testDB", version: 21, size:5*1023*1023
        /**
         * @type {Array}
         */
        , dbProviders: ['indexedDB', 'webSQL']
        , tables: [
            {name:"versions", key:"feedSource", indexes:["source", "feedName"]}
            , {name:"historyversions", key:"feedSourceFilter", indexes:["source", "feedName", "filter",["feedName", "filter"]]}
            , {name:"tTest1", key:"id", indexes:["field1", "field2"]}
            , {name:"tTest2", key:"id", indexes:["field3", "field4", ["field3", "field4"]]}
            , {name: "tesClientFeed", key: "xpid", indexes: ["source"]}
            , {name: "testFakeModel", key: "xpid", indexes: ["source"]}
            , {name: "testModel1", key: "xpid", indexes: ["source"]}
            , {name: "testModel", key: "xpid", indexes: ["source"]}
        ]
    }
    , CLIENT: {
        type:'test'
    }
};