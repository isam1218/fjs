namespace("fjs.fdp");
fjs.fdp.CONFIG = {
    SERVER: {
//        serverURL: "https://dev4.fon9.com:8081"
//        , loginURL: "https://dev4.fon9.com:5501/oauth/authorize"
//        serverURL: "https://huc-dev.fonality.com:8081"
//      , loginURL: "https://huc-dev.fonality.com:5501/oauth/authorize"
       serverURL: "https://huc-qa.fonality.com:8080"
    }
    , providers: ['sharedWorker', 'simple']
    , DB: {
        name: "SFA"
        , version: 14
        /**
         * @type {Array}
         */
        , dbProviders:['indexedDB', 'webSQL', 'localStorage']
        , tables: [
            {name:"versions", key:"feedSource", indexes:["source", "feedName"]}
            , {name:"historyversions", key:"feedSourceFilter", indexes:["source", "feedName", "filter",["feedName", "filter"]]}
            , {name:"calls", key: "xpid", indexes:["source"]}
            , {name:"locations", key: "xpid", indexes:["source"]}
            , {name:"location_status", key: "xpid", indexes:["source"]}
            , {name:"me", key: "xpid", indexes:["source"]}
            , {name:"mycalls", key: "xpid", indexes:["source"]}
            , {name:"mycalldetails", key: "xpid", indexes:["source"]}
            , {name:"mycallsclient", key:"xpid"}]
    }
    , CLIENT: {type:'salesforce'}
};