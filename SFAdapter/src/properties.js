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
        name: "HUD"
        , version: 13
        /**
         * @type {Array}
         */
        , dbProviders:['indexedDB', 'webSQL']
        , tables: [
            {name:"versions", key:"feedSource", indexes:["source", "feedName"]}
            , {name:"historyversions", key:"feedSourceFilter", indexes:["source", "feedName", "filter",["feedName", "filter"]]}
            , {name:"calls", key: "xpid", indexes:["source"]}
            , {name:"calldetails", key: "xpid", indexes:["source"]}
            , {name:"calllog", key: "xpid", indexes:["source"]}
            , {name:"callrecording", key: "xpid", indexes:["source"]}
            , {name:"callrecordingplayed", key: "xpid", indexes:["source"]}
            , {name:"chatsmiles", key: "xpid", indexes:["source"]}
            , {name:"conferences", key: "xpid", indexes:["source"]}
            , {name:"conferencemembers", key: "xpid", indexes:["source"]}
            , {name:"conferencepermissions", key: "xpid", indexes:["source"]}
            , {name:"conferencestatus", key: "xpid", indexes:["source"]}
            , {name:"contacts", key: "xpid", indexes:["source"]}
            , {name:"contactpermissions", key: "xpid", indexes:["source"]}
            , {name:"contactstatus", key: "xpid", indexes:["source"]}
            , {name:"gadget_config", key: "xpid", indexes:["source"]}
            , {name:"groups", key: "xpid", indexes:["source"]}
            , {name:"groupcontacts", key: "xpid", indexes:["source"]}
            , {name:"groupinfo", key: "xpid", indexes:["source"]}
            , {name:"groupmyproperties", key: "xpid", indexes:["source"]}
            , {name:"grouppermissions", key: "xpid", indexes:["source"]}
            , {name:"groupstatus", key: "xpid", indexes:["source"]}
            , {name:"group_page_member", key: "xpid", indexes:["source"]}
            , {name:"i18n_langs", key: "xpid", indexes:["source"]}
            , {name:"locations", key: "xpid", indexes:["source"]}
            , {name:"location_status", key: "xpid", indexes:["source"]}
            , {name:"me", key: "xpid", indexes:["source"]}
            , {name:"mycalls", key: "xpid", indexes:["source"]}
            , {name:"mycalldetails", key: "xpid", indexes:["source"]}
            , {name:"parkedcalls", key: "xpid", indexes:["source"]}
            , {name:"queues", key: "xpid", indexes:["source"]}
            , {name:"queue_call", key: "xpid", indexes:["source"]}
            , {name:"queuelogoutreasons", key: "xpid", indexes:["source"]}
            , {name:"queue_members", key: "xpid", indexes:["source"]}
            , {name:"queuemembercalls", key: "xpid", indexes:["source"]}
            , {name:"queue_members_stat", key: "xpid", indexes:["source"]}
            , {name:"queue_members_status", key: "xpid", indexes:["source"]}
            , {name:"queuemessages", key: "xpid", indexes:["source"]}
            , {name:"queuemessagestats", key: "xpid", indexes:["source"]}
            , {name:"queuepermissions", key: "xpid", indexes:["source"]}
            , {name:"queue_stat_calls", key: "xpid", indexes:["source"]}
            , {name:"quickinbox", key: "xpid", indexes:["source"]}
            , {name:"server", key: "xpid", indexes:["source"]}
            , {name:"settings", key: "xpid", indexes:["source"]}
            , {name:"streamevent", key: "xpid", indexes:["source"]}
            , {name:"voicemailbox", key: "xpid", indexes:["source"]}
            , {name:"weblauncher", key: "xpid", indexes:["source"]}
            , {name:"weblaunchervariables", key: "xpid", indexes:["source"]}
            , {name:"fdpImage", key: "xpid", indexes:["source"]}
            , {name:"sortings", key:"xpid"}]
    }
    , CLIENT: {type:'salesforce'}
};