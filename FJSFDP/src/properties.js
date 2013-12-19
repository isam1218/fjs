
fjs.fdp.CONFIG = {
    SERVER: {
        serverURL: "https://huc-dev.fonality.com:8081"
        , loginURL: "https://huc-dev.fonality.com:5501/oauth/authentication"
    }
    , DB: {
        name: "HUD"
        , version: 1
        , tables: [
            {name:"versions", key:"feedSource", indexes:["source", "feedName"]}
            , {name:"calls", key: "xpid"}
            , {name:"calldetails", key: "xpid"}
            , {name:"calllog", key: "xpid"}
            , {name:"callrecording", key: "xpid"}
            , {name:"callrecordingplayed", key: "xpid"}
            , {name:"chatsmiles", key: "xpid"}
            , {name:"conferences", key: "xpid"}
            , {name:"conferencemembers", key: "xpid"}
            , {name:"conferencepermissions", key: "xpid"}
            , {name:"conferencestatus", key: "xpid"}
            , {name:"contacts", key: "xpid"}
            , {name:"contactpermissions", key: "xpid"}
            , {name:"contactstatus", key: "xpid"}
            , {name:"gadget_config", key: "xpid"}
            , {name:"groups", key: "xpid"}
            , {name:"groupcontacts", key: "xpid"}
            , {name:"groupinfo", key: "xpid"}
            , {name:"groupmyproperties", key: "xpid"}
            , {name:"grouppermissions", key: "xpid"}
            , {name:"groupstatus", key: "xpid"}
            , {name:"group_page_member", key: "xpid"}
            , {name:"i18n_langs", key: "xpid"}
            , {name:"locations", key: "xpid"}
            , {name:"location_status", key: "xpid"}
            , {name:"me", key: "xpid"}
            , {name:"mycalls", key: "xpid"}
            , {name:"mycalldetails", key: "xpid"}
            , {name:"parkedcalls", key: "xpid"}
            , {name:"queues", key: "xpid"}
            , {name:"queue_call", key: "xpid"}
            , {name:"queuelogoutreasons", key: "xpid"}
            , {name:"queue_members", key: "xpid"}
            , {name:"queuemembercalls", key: "xpid"}
            , {name:"queue_members_stat", key: "xpid"}
            , {name:"queue_members_status", key: "xpid"}
            , {name:"queuemessages", key: "xpid"}
            , {name:"queuemessagestats", key: "xpid"}
            , {name:"queuepermissions", key: "xpid"}
            , {name:"queue_stat_calls", key: "xpid"}
            , {name:"quickinbox", key: "xpid"}
            , {name:"settings", key: "xpid"}
            , {name:"streamevent", key: "xpid"}
            , {name:"voicemailbox", key: "xpid"}
            , {name:"weblauncher", key: "xpid"}
            , {name:"weblaunchervariables", key: "xpid"}
            , {name:"fdpImage", key: "xpid"}]
    }
};