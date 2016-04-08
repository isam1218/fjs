var fjs = {};

fjs.CONFIG = {
    SERVER: {
        serverURL: {{ server_url }}
                , loginURL: {{ login_url }}
      , ppsServer: {{ pps_url }}
    }
    , FEEDS:['me', 'contacts', 'locations', 'settings','calls', 'queues','conferences','weblauncher_task','mycalls','groups','voicemailbox','calllog','server','location_status', 
            'queuelogoutreasons','queue_members', 'queuemembercalls','queue_members_stat','queue_members_status',
            'queue_call','queuepermissions', 'queue_stat_calls',
            'calldetails',  'grouppermissions', 'groupcontacts', 
            'contactpermissions', 'contactstatus', 'fdpImage',   'group_page_member',
            'weblauncher', 'weblaunchervariables',  
            'streamevent','conferencemembers',
            'conferencepermissions','conferencestatus','parkedcalls','mycalldetails','i18n_langs','quickinbox',]
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
        MAC:'webphone/FonalityPlugin-5.17.8986.dmg',
        WINDOWS:'webphone/FonalityPlugin-5.17.8986.msi',
        WINDOWS_NEW:'<%= WINDOWS_PLUGIN %>',
        MAC_NEW:'<%= MAC_PLUGIN %>'

    },
    PLUGIN_VERSION:{
        MAC_OLD:'5.17.008986',
        WINDOWS_OLD:'5.17.008986',
        WINDOWS_NEW:'<%= WINDOWS_PLUGIN_VERSION %>',
        MAC_NEW:'<%= MAC_PLUGIN_VERSION %>'
    },
	BUILD_NUMBER: '<%= BUILD_NUMBER %>',
    DEBUG:true,
	SYNC_DELAY: 1500,
	ACTIVITY_DELAY: 60000
};
