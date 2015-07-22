var fjs = {};

fjs.CONFIG = {
    SERVER: {
       // serverURL: "https://dev4.fon9.com:8081"
	   //	, loginURL: "https://dev4.fon9.com:5501"
       loginURL:'https://auth.fonality.com',
        serverURL: 'https://fdp-huc-v5.fonality.com'
//      serverURL: "https://lb-stage3.fonality.com:446"
//      , loginURL: "https://lb-stage3.fonality.com:444"
//      serverURL: "https://huc-dev.fonality.com:8081"
//      , loginURL: "https://huc-dev.fonality.com:5501"
//      , loginURL: "https://huc-dev.fonality.com:5501/oauth/authorize"
//      serverURL: "https://huc-qa.fonality.com:8080"
//      , loginURL: "https://huc-qa.fonality.com:5501"
    }
    , FEEDS:['me', 'contacts', 'locations', 'settings','calls', 'queues','conferences','mycalls','groups','voicemailbox','calllog','server','location_status', 
            'queuelogoutreasons','queue_members', 'queuemembercalls','queue_members_stat','queue_members_status','queue_stat_members',
            'queue_call','queuepermissions', 'queue_stat_calls',  'queuemessagestats',
            'calldetails',  'grouppermissions', 'groupcontacts', 
            'contactpermissions', 'contactstatus', 'fdpImage',   'group_page_member',
             'chatsmiles', 'weblauncher', 'weblaunchervariables',  
            'streamevent','recent_talks','conferencemembers',
            'conferencepermissions','conferencestatus','callrecording','parkedcalls','mycalldetails','i18n_langs','quickinbox',]
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
        QUEUE_CALL:3,
        BARGE_CALL:4,
        EXTERNAL_CALL:5,
        CALL_MENU:6,
    },
    
    BARGE_TYPE:{
        BARGE:2,
        MONITOR:1,
        WHISPER:3,
    },
    PLUGINS:{
        MAC:'https://hudweb.fonality.com/repository/fj.phone/1.3/res/FonalityPlugin-5.17.8986.dmg',
        WINDOWS:'https://hudweb.fonality.com/repository/fj.phone/1.3/res/FonalityPlugin-5.17.8986.msi',
    },
    DEBUG:true,
};
