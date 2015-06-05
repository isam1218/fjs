var fjs = {};

fjs.CONFIG = {
    SERVER: {
//        serverURL: "https://dev4.fon9.com:8081"
//		, loginURL: "https://dev4.fon9.com:5501"
      serverURL: "https://lb-stage3.fonality.com:446"
      , loginURL: "https://lb-stage3.fonality.com:444"
//      serverURL: "https://huc-dev.fonality.com:8081"
//      , loginURL: "https://huc-dev.fonality.com:5501"
//      , loginURL: "https://huc-dev.fonality.com:5501/oauth/authorize"
//      serverURL: "https://huc-qa.fonality.com:8080"
//      , loginURL: "https://huc-qa.fonality.com:5501"
    }
    , FEEDS:['me', 'contacts', 'locations', 
            'settings', 'location_status', 'queue_members', 'queuemembercalls', 
            'calls', 'calldetails', 'groups', 'grouppermissions', 'groupcontacts', 
            'server', 'contactpermissions', 'contactstatus', 'fdpImage', 'queue_members_stat', 'queue_call', 'group_page_member',
            'queue_members_status', 'queues', 'queuemessagestats', 'queuepermissions', 'queue_stat_calls', 
            'queue_stat_members', 'chatsmiles', 'weblauncher', 'weblaunchervariables', 'queuelogoutreasons', 
            'streamevent','calllog','quickinbox','recent_talks','voicemailbox','conferences','conferencemembers',
            'conferencepermissions','conferencestatus','callrecording','parkedcalls','mycalls','mycalldetails','i18n_langs']
    , 
    CALL_STATES:{
        CALL_UNKNOWN:-1,
        CALL_RINGING:0,
        CALL_ACCEPTED:2,
        CALL_HOLD:3,
    }, 
    CALL_TYPES:{
        GROUP_CALL:1,
        CONFERENCE_CALL:0,
        INDIVIDUAL_CALL:2,
        EXTERNAL_CALL:5,
        CALL_MENU:6,
    },
    PLUGINS:{
        MAC:'https://hudweb.fonality.com/repository/fj.phone/1.3/res/FonalityPlugin-5.17.8986.dmg',
        WINDOWS:'https://hudweb.fonality.com/repository/fj.phone/1.3/res/FonalityPlugin-5.17.8986.msi',
    },
};
