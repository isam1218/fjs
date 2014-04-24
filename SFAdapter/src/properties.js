namespace("fjs.fdp");
fjs.fdp.CONFIG = {
    SERVER: {
       serverURL: "https://huc-qa.fonality.com:8080"
    }
    , providers: ['simple', 'sharedWorker']
    , DB: {
        name: "SFA"
        , version: 22
        /**
         * @type {Array}
         */
        , dbProviders:['indexedDB', 'webSQL', 'localStorage']
        , tables: [
            {name:"versions", key:"feedSource", indexes:["source", "feedName"]}
            , {name:"historyversions", key:"feedSourceFilter", indexes:["source", "feedName", "filter",["feedName", "filter"]]}
            , {name:"locations", key: "xpid", indexes:["source"]}
            , {name:"location_status", key: "xpid", indexes:["source"]}
            , {name:"me", key: "xpid", indexes:["source"]}
            , {name:"mycalls", key: "xpid", indexes:["source"]}
            , {name:"mycalldetails", key: "xpid", indexes:["source"]}
            , {name:"mycallsclient", key:"xpid"}
            , {name:"clientsettings", key:"xpid"}]
    }
    , CLIENT: {type:'salesforce'}
};