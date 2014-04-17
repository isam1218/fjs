namespace("fj.fdp.phone"); //$NON-NLS-1$

/**
 * FDP API
 *
 * @constructor
 */

function onloadedplugin() {
    fj.fdp.phone.Api.instance.onLoaded();
};

(function() {
    var isMac = navigator.userAgent.indexOf("Mac") > -1;

    fj.fdp.phone.Api = function() {

        // constants
        this.REG_STATUS_REGISTERING = -1;
        this.REG_STATUS_OFFLINE = 0;
        this.REG_STATUS_ONLINE = 1;

        this.SES_STATUS_READY = 0;
        this.SES_STATUS_UNAUTHORIZED = 1;
        this.SES_STATUS_NOTPERMITTED = 2;

        this.CALL_STATUS_UNKNOWN = -1;
        this.CALL_STATUS_RINGING = 0;
        this.CALL_STATUS_ACCEPTED = 1;
        this.CALL_STATUS_CLOSED = 2;
        this.CALL_STATUS_ERROR = 3;
        this.CALL_STATUS_HOLD = 4;

        this.WAVE_MAPPER_NAME = "Wave mapper";

        var context = this;
        var initialized = false;
        var tryRegistringCount = 0;
        var tryAuthorizeCount = 0;
        var isloaded = false;
        var suspendLoginData = {};
        var suspendRegister = null;
        var isDrug = false;
        var alertBoundsArgs = null;
        var savedMicValue = 0.8;
        var savedSpeakerValue = 0.8;
        var savedAlertX = 0;
        var savedAlertY = 0;
        var lastDevices = [];
        var lastOutputDeviceId = -2;
        var lastInputDeviceId = -1;
        var lastRingDeviceId = -2;
        var devicesChanged = false;
        this.alertBorderRadius = 2;
        this.listeners = {};
        this.phoneObject = null;
        this.phone = null;
        this.session = null;
        this.browser = "Chrome";
        this.userId = null;
        this.SIPCalls = {};
        this._isUnsupportedVersion = false;
        this._isActiveInstance = true;

        this.createObject = function() {

            /*var obj = document.createElement("object");
             obj.id="fonalityPhone"
             obj.border = 0;
             obj.id="fonalityPhone"
             obj.border = 0;
             obj.width= 1;
             obj.type="application/x-fonalityplugin";
             obj.height="1";

             if(context.mode == "topframe") {
             obj.width=200;
             obj.height=300;
             obj.setAttribute("drawingModel", "NPDrawingModelCoreGraphics");
             }

             var param = document.createElement("param");
             param.name = "onload";
             param.value="onloadedplugin";
             obj.appendChild(param);

             document.body.appendChild(obj);

             return obj;*/

            var pluginContainer = document.createElement('div');
            document.body.appendChild(pluginContainer);
            pluginContainer.innerHTML
                = '<object id="fonalityPhone" border="0" width="1" type="application/x-fonalityplugin" height="1">'
                + '<param name="onload" value="onloadedplugin" /></object>';
            return document.getElementById("fonalityPhone");
        };

        this.validateDoubleValue = function(val, min , max) {
            val = parseFloat(val);
            if (!isNaN(val)) {
                val = val < min ? min : val;
                val = val > max ? max : val;
            }
            return val || min;
        };

        this.getSpeakerVolume = function() {
            if(context.isReady()) {
                return context.session.soundManager.speaker;
            }
            return 0;
        };

        this.setSpeakerVolume = function(val) {
            if(context.isReady() && context.session.soundManager.speaker != val) {
                val = context.validateDoubleValue(val, 0, 1);
                context.session.soundManager.speaker = val;
                context.onEvent("SpeakerVolumeChanged", val);
            }
        };

        this.getMicrophoneVolume = function() {
            if(context.isReady()) {
                return context.session.soundManager.microphone;
            }
            return 0;
        };

        this.activateInstance = function() {
            this._isActiveInstance = true;
            this.register();
        }

        this.deactivateInstance = function() {
            this._isActiveInstance = false;
            this.unregister();
            //this.removeAlert();
        };

        this.setMicrophoneVolume = function(val) {
            if(context.isReady() && context.session.soundManager.microphone != val) {
                val = context.validateDoubleValue(val, 0, 1);
                context.session.soundManager.microphone = val;
                context.onEvent("MicrophoneVolumeChanged", val);
            }
        };

        this.getEACTailLength = function() {
            if(context.isReady()) {
                return context.session.soundManager.AECTailLength;
            }
        };
        this.setEACTailLength = function(val) {
            if(context.isReady() && val != context.session.soundManager.AECTailLength) {
                val = context.validateDoubleValue(val, 0, 500);
                context.session.soundManager.AECTailLength = val;
                context.onEvent("EACTailLengthChanged", val);
            }
        };

        this.getInputDeviceId = function() {
            if(context.isReady()) {
                return context.session.soundManager.inpdefid >= 0 ? context.session.soundManager.inpdefid : context.session.soundManager.getSystemInputDevice();
            }
        };

        this.setInputDeviceId = function(devId) {
            var devices = this.getDevices();
            if(context.isReady() && context.session.soundManager.inpdefid != devId && devices.length>devId) {
                if(devices.length > devId && devices[devId].input_count > 0) {
                    context.session.soundManager.inpdefid = devId;
                }
                else if(context.session.soundManager.getSystemInputDevice){
                    devId = context.session.soundManager.getSystemInputDevice();
                    context.session.soundManager.inpdefid = devId;
                }
                context.onEvent("InputDeviceChanged", devId);
            }
        };


        this.getOutputDeviceId = function() {
            if(context.isReady()) {
                return context.session.soundManager.outdefid>=0 ? context.session.soundManager.outdefid : context.session.soundManager.getSystemOutputDevice();
            }
        };

        this.setOutputDeviceId = function(devId) {
            var devices = this.getDevices();
            if(context.isReady() && context.session.soundManager.outdefid != devId) {
                if(devices.length > devId && devices[devId].output_count > 0) {
                    context.session.soundManager.ringdefid =context.session.soundManager.outdefid = devId;
                }
                else if(context.session.soundManager.getSystemOutputDevice) {
                    devId = context.session.soundManager.getSystemOutputDevice()
                    context.session.soundManager.outdefid = devId;
                }
                context.onEvent("OutputDeviceChanged", devId);
            }
        };

        this.getRingDeviceId = function() {
            if(context.isReady()) {
                return context.session.soundManager.ringdefid>=0 ? context.session.soundManager.ringdefid : context.session.soundManager.getSystemOutputDevice();
            }
        };

        this.setRingDeviceId = function(devId) {
            var devices = this.getDevices();
            if(context.isReady() && context.session.soundManager.ringdefid != devId) {
                if(devices.length > devId && devices[devId].output_count > 0) {
                    context.session.soundManager.ringdefid = devId;
                }
                else if(context.session.soundManager.getSystemOutputDevice) {
                    devId = context.session.soundManager.getSystemOutputDevice()
                    context.session.soundManager.ringdefid = devId;
                }
                context.onEvent("RingDeviceChanged", devId);
            }
        };


        this.getDevices = function() {
            if(context.isReady()) {
                return context.session.soundManager.devs;
            }
        };

        this.getOutputDevices = function() {
            if(context.isReady()) {
                var devs = context.session.soundManager.devs
                var outputdevs = [];
                for(var i=0; i<devs.length; i++) {
                    if(devs[i].output_count > 0) {
                        outputdevs.push(devs[i]);
                    }
                }
                return outputdevs;
            }
        };

        this.getInputDevices = function() {
            if(context.isReady()) {
                var devs = context.session.soundManager.devs
                var inputdevs = [];
                for(var i=0; i<devs.length; i++) {
                    if(devs[i].input_count > 0) {
                        inputdevs.push(devs[i]);
                    }
                }
                return inputdevs;
            }
        };

        this.getCodecs = function() {
            var res=[];
            if(context.isReady()) {
                var arr=[];
                context.session.soundManager.getCodecs(arr);
                for(var i=0; i<arr.length; i++) {
                    if(fj.fdp.phone.Api.config.allowedCodecs[arr[i].name]) {
                        res.push(arr[i]);
                    }
                    else {
                        arr[i].priority = 0;
                    }
                }
            }
            return res;
        };

        this.setDefaultCodecsPriority = function() {
            if(context.isReady()) {
                var arr=[];
                context.session.soundManager.getCodecs(arr);
                for(var i=0; i<arr.length; i++) {
                    if(fj.fdp.phone.Api.config.allowedCodecs[arr[i].name]) {
                        this.setCodecPriority (arr[i].name, fj.fdp.phone.Api.config.allowedCodecs[arr[i].name]);
                    }
                    else {
                        this.setCodecPriority (arr[i].name, 0);
                    }
                }
            }
        };

        this.setCodecPriority = function(codecName, priority) {
            if(context.isReady()) {
                var codecs = context.getCodecs();
                priority = context.validateDoubleValue(priority, 0, 255);
                for(var i=0; i <codecs.length; i++) {
                    if(codecs[i].name == codecName) {
                        codecs[i].priority = priority;
                        context.onEvent("CodecPriorityChanged", {codecName:codecName, priority:priority})
                        return;
                    }
                }
            }
        };

        this.getSessionStatus = function() {
            return context.session ? context.session.status : 1;
        };

        this.getPhoneStatus = function() {
            return context.session ? context.session.phone.status : 0;
        };

        this.getLastUserActivity = function() {
            if(context.isReady() && context.session.getLastUserActivity) {
                return  context.session.getLastUserActivity();
            }
            return undefined;
        };

        /**
         * @returns {boolean} true - object is successfully initialized
         *                    false - fail
         */
        this.init = function(userId) {
            if (!initialized) {
                context.userId = userId || "unknown";
                context.phoneObject = context.createObject();
                context.phoneObject.onerorr = context.onError;
                initialized = true;
                if(fj.salesforce && fj.salesforce.Api) {
                    fj.salesforce.Api.setPhoneApi(context);
                }
                /*  if(fj.hud.mini.salesforce && fj.hud.mini.salesforce.Api) {
                 fj.hud.mini.salesforce.Api.setPhoneApi(context);
                 }*/
            }
            return context;
        };

        this.onLoaded = function() {
            isloaded = true;
            var version = context.phoneObject.version;
            context.onEvent("PluginLoaded", version);

            context.session = context.phoneObject.getSession(this.userId);

            context.attachPluginEvents(context.session);

            if(suspendLoginData.authTicket) {
                context.relogin();
            }
        };


        this.onError = function(msg, errorType) {
            context.onEvent('error', msg, errorType);
        };

        this.isAutoUpdateAvailable = function() {
            return false; //context.session && (context.session.createUpdate !== undefined);
        }

        this.isDBAvaliable = function() {
            return !!this.session && this.session.openDatabase;
        }

        this.openDatabase = function(dbName
            , dbVersion
            , dbDescription
            , dbSize) {
            if(context.isDBAvaliable()) {
                return context.session.openDatabase(dbName, dbVersion, dbDescription, dbSize);
            }
        }

        this.markAsUnsupportdVersion = function() {
            context._isUnsupportedVersion = true;
        }

        this.isUnsupportedVersion = function() {
            return context._isUnsupportedVersion;
        }

        this.update = function(url) {
            var updateObj = context.session.createUpdate();
            updateObj.update(url);
        }

        this.attachPluginEvents = function(session) {
            if(session.addEventListener) {
                session.addEventListener("Status", function(session) {
                    context.onSessionStatusChanged(session);
                }, false);

                if(context._isUnsupportedVersion) {
                    return;
                }

                session.alertAPI.addEventListener("Alert",	function(msg) {
                    context.onAlertEvent(msg);
                }, false);
                session.alertAPI.addEventListener("onLocationChanged", function(x,y) {
                    context.onAlertLocationChanged(x,y);
                },false);
                session.alertAPI.addEventListener("onAlertMouseEvent", function(mouseEventType,x,y) {
                    context.onAlertMouseEvent(mouseEventType,x,y);
                }, false);
                session.alertAPI.addEventListener("AlertLogs", function(msg) {
                    if(window["console"]) {console.log("Alert log:", msg);}
                }, false);
                session.alertAPI.addEventListener("AlertNavigated", function() {
                    context.subFrameLoaded();
                }, false);
                session.alertAPI.addEventListener("AlertWillNavigateTo", function() {
                    context.subFrameBeforeLoad();
                }, false);

                session.alertAPI.addEventListener("AlertScreenSettingsChanged", function() {
                    context.onAlertScreenSettingsChanged();
                }, false);

                session.phone.addEventListener("Call", function(call) {
                    context.onCallStateChanged(call);
                }, false);
                session.phone.addEventListener("Status", function(phone) {
                    console.log("PhoneStatus1: ",phone.status);
                    context.onPhoneStatusChanged(phone);
                }, false);
                session.soundManager.addEventListener("SoundDevicesChanged", function() {
                    devicesChanged = true;
                    context.soundDevicesChanged();
                }, false);
                session.addEventListener("NetworkStatus", function(status){
                    if(status==1) {
                        context.register();
                        context.onEvent("NetworkStatus", status);
                    }
                    else {
                        context.onError("can't register", "phone_registration");
                    }
                }, false);
            } else if(session.attachEvent) {
                session.attachEvent("onStatus", function(session) {
                    context.onSessionStatusChanged(session);
                });

                if(context._isUnsupportedVersion) {
                    return;
                }

                session.alertAPI.attachEvent("onAlert", function(msg) {
                    context.onAlertEvent(msg);
                });
                session.alertAPI.attachEvent("ononLocationChanged", function(x,y) {
                    context.onAlertLocationChanged(x,y);
                });
                session.alertAPI.attachEvent("ononAlertMouseEvent", function(mouseEventType,x,y) {
                    context.onAlertMouseEvent(mouseEventType,x,y);
                });
                session.alertAPI.attachEvent("onAlertLogs", function(msg) {
                    if(window["console"]) {console.log("Alert log:", msg);}
                });
                session.alertAPI.attachEvent("onAlertNavigated", function() {
                    context.subFrameLoaded();
                });
                session.alertAPI.attachEvent("onAlertWillNavigateTo", function() {
                    context.subFrameBeforeLoad();
                });
                session.alertAPI.attachEvent("onAlertScreenSettingsChanged", function() {
                    context.onAlertScreenSettingsChanged();
                });
                session.phone.attachEvent("onCall", function(call) {
                    context.onCallStateChanged(call);
                });
                session.phone.attachEvent("onStatus", function(phone) {
                    context.onPhoneStatusChanged(phone);
                });
                session.soundManager.attachEvent("onSoundDevicesChanged", function() {
                    devicesChanged = true;
                    context.soundDevicesChanged();
                });
                session.attachEvent("onNetworkStatus", function(status){
                    if(status==1) {
                        context.register();
                        context.onEvent("NetworkStatus", status);
                    }
                    else {
                        context.onError("can't register", "phone_registration");
                    }
                });
            }
        };

        this.soundDevicesChanged = function() {

            if(this.isReady() && devicesChanged) {
                var newDevices = this.getDevices() || [];
                var lODev= lastDevices[lastOutputDeviceId];
                var lIDev= lastDevices[lastInputDeviceId];
                var lRDev= lastDevices[lastRingDeviceId];
                var outputFlag = false;
                var inputFlag = false;
                var ringFlag = false;

                if(lODev!=undefined && lIDev!=undefined && lIDev!=undefined) {
                    for(var i=0; i<newDevices.length; i++) {
                        var _dev = newDevices[i]
                        if(lODev.name == _dev.name && lODev.input_count == _dev.input_count && lODev.output_count == _dev.output_count) {
                            context.session.soundManager.outdefid = _dev.id;
                            outputFlag = true;
                        }
                        if(lIDev.name == _dev.name && lIDev.input_count == _dev.input_count && lIDev.output_count == _dev.output_count) {
                            context.session.soundManager.inpdefid = _dev.id;
                            inputFlag = true;
                        }
                        if(lRDev.name == _dev.name && lRDev.input_count == _dev.input_count && lRDev.output_count == _dev.output_count) {
                            context.session.soundManager.ringdefid = _dev.id;
                            console.log("context.session.soundManager.ringdefid="+_dev.id);
                            ringFlag = true;
                        }
                    }
                }
                if(context.session.soundManager.getSystemOutputDevice) {
                    if(!outputFlag) {
                        context.session.soundManager.outdefid = context.session.soundManager.getSystemOutputDevice();
                    }
                    if(!inputFlag) {
                        context.session.soundManager.inpdefid = context.session.soundManager.getSystemInputDevice();
                    }
                    if(!ringFlag) {
                        context.session.soundManager.ringdefid = context.session.soundManager.getSystemOutputDevice();
                        console.log("context.session.soundManager.ringdefid="+context.session.soundManager.getSystemOutputDevice());
                    }
                }
                else {
                    for(var i=0; i<newDevices.length; i++) {
                        var _dev = newDevices[i]
                        if(!outputFlag && _dev.output_count>0) {
                            context.session.soundManager.outdefid = _dev.id;
                        }
                        if(!inputFlag && _dev.input_count>0) {
                            context.session.soundManager.inpdefid = _dev.id;
                        }
                        if(!ringFlag && _dev.output_count>0) {
                            context.session.soundManager.ringdefid = _dev.id;
                            console.log("context.session.soundManager.ringdefid="+_dev.id);
                        }
                    }
                }
                lastInputDeviceId = this.getInputDeviceId();
                lastOutputDeviceId = this.getOutputDeviceId();
                lastRingDeviceId = this.getRingDeviceId();
                lastDevices = newDevices || [];
                context.onEvent("DeviceChanged", lastDevices);
            }
        };

        this.login = function(authTicket, node_id, server) {
            suspendLoginData.authTicket = authTicket;
            suspendLoginData.server = server;
            suspendLoginData.node_id = node_id;
            if(!isloaded) {
                return;
            }
            authTicket = authTicket || "";
            node_id = node_id || "";
            console.log("plugin authorize " + authTicket);
            context.session.authorize(authTicket, node_id, server);
        };

        this.relogin = function() {
            this.login(suspendLoginData.authTicket, suspendLoginData.node_id, suspendLoginData.server);
        };

        this.getScreens = function() {
            if(this.isReady()) {
                var screens = [];
                context.session.getScreens(screens);
                return screens;
            }
        }

        this.onSessionReady = function() {
            if(suspendRegister) {
                suspendRegister = null;
                context.register(true);
            }
            this.soundDevicesChanged();
        };

        this.onSessionStatusChanged = function(session) {
            console.log("onSessionStatusChanged " + session.status);
            if (this.isReady()) {
                context.onSessionReady();
            }
            if(session.status == this.SES_STATUS_UNAUTHORIZED) {
                if (tryAuthorizeCount < 5) {
                    context.relogin();
                    tryAuthorizeCount++;
                }
                else {
                    context.onEvent("SessionStatusChanged", session.status);
                }
            }
            else {
                tryAuthorizeCount = 0;
                context.onEvent("SessionStatusChanged", session.status);
            }
        };

        this.onPhoneStatusChanged = function(phone) {
            if (phone) {
                if (phone.status == context.REG_STATUS_ONLINE) {
                    tryRegistringCount = 0;
                } else if (phone.status == context.REG_STATUS_OFFLINE && context._isActiveInstance) {
                    if (tryRegistringCount > 5) {
                        context.onError("can't register", "phone_registration");
                    } else {
                        context.session.phone.register(true);
                        tryRegistringCount++;
                    }
                }
                context.onEvent("AccountStatusChanged", phone.status);
            }
        };

        this.onCallStateChanged = function(call) {
            if(!call.sip_id) {
                return;
            }
            var callInfo = {
                sipId : call.sip_id,
                remote_contact : call.remote_contact,
                localPhone : true,
                incoming: call.incoming,
                status: call.status
            };
            switch (call.status) {
                case context.CALL_STATUS_RINGING:
                case context.CALL_STATUS_ACCEPTED:
                case context.CALL_STATUS_HOLD:

                    context.SIPCalls[call.sip_id] = call;

                    switch (call.status) {
                        case context.CALL_STATUS_RINGING:
                            callInfo.fdpState = 0;
                            break;
                        case context.CALL_STATUS_ACCEPTED:
                            callInfo.fdpState = 2;
                            if (call._toHold) {
                                call.hold = true;
                            }
                            else {
                                context.putActiveCallsOnHold(call);
                            }
                            break;
                        case context.CALL_STATUS_HOLD:
                            callInfo.fdpState = 3;
                            break;
                    }
                    break;
                case context.CALL_STATUS_CLOSED:
                    delete context.SIPCalls[call.sip_id];
                    break;
                case context.CALL_STATUS_UNKNOWN:
                    break;
                case context.CALL_STATUS_ERROR:
                    context.onError("call error");
                    break;
            }
            context.onEvent("CallStateChanged", callInfo);
        };

        /**
         *
         * Handler of alert click
         */
        this.onAlertEvent = function(msg) {
            var alertEvent = new fj.fdp.phone.AlertEvent(msg);
            if(alertEvent.type == "onLoad") {
                context.onEvent("AlertLoaded");
                console.log("AlertLoaded");
                return;
            }
            else if(alertEvent.type=="resize") {
                console.log("resize", alertEvent.data.width, alertEvent.data.height);
                context.setAlertBounds(savedAlertX, savedAlertY, parseInt(alertEvent.data.width), parseInt(alertEvent.data.height));
                return;
            }
            context.onEvent("AlertEvent", alertEvent);
        };

        this.activateBrowserTab = function () {
            console.log("ActivateBrowserTab");
            switch (context.browser) {
                case 'Chrome':
                    context.addonActivateTab();
                    context.session.activateChrome('#' + fj.model.JKey.windowId);
                    context.addonActivateTab();
                    break;
                case 'Firefox':
                    if (isMac) {
                        context.session.activateFirefox('#' + fj.model.JKey.windowId);
                    }
                    context.addonActivateTab();
                    break;
                case 'Safari':
                    context.session.activateSafari('#' + fj.model.JKey.windowId);
                    break;
                case 'Microsoft Internet Explorer' :
                    context.session.activateIE('#' + fj.model.JKey.windowId);
            }
        };

        this.addonActivateTab = function() {
            if(!context.addonProxyElement) {
                context.addonProxyElement = document.createElement("MyExtensionDataElement");
                context.addonProxyElement.setAttribute("url", location.href);
                document.documentElement.appendChild(context.addonProxyElement);
            }
            var evt = document.createEvent("Events");
            evt.initEvent("MyExtensionEvent", true, false);
            context.addonProxyElement.dispatchEvent(evt);
        };

        this.onAlertScreenSettingsChanged = function() {
            if(alertBoundsArgs) {
                context.setAlertBounds.apply(context, alertBoundsArgs);
            }
            context.onEvent("AlertScreenSettingsChanged", context.getScreens());
        };

        /**
         * Handles alert location change
         */
        this.onAlertLocationChanged = function(x,y) {
            context.onEvent("AlertLocationChanged", {x:x, y:y});
        };

        this.onAlertMouseEvent = function(mouseEventType,x,y) {
            if(mouseEventType == 2) {
                console.log("alert mouseup");
                isDrug = false;
                context.onEvent("AlertMouseEvent", {x:x,y:y});
            }
            if(mouseEventType == 1) {
                console.log("alert mousedown");
                isDrug = true;
            }
        };

        /**
         * Return true if the phone is registered.
         *
         * @return boolean
         */
        this.isRegistered = function() {
            return this.getPhoneStatus() == context.REG_STATUS_ONLINE;
        };
        this.isRegistering = function() {
            return this.getPhoneStatus() == context.REG_STATUS_REGISTERING;
        };
        this.isReady = function() {
            var status = this.getSessionStatus();
            return (status == context.SES_STATUS_READY || status  == context.SES_STATUS_NOTPERMITTED) && !this._isUnsupportedVersion;
        };

        /**
         * Unregister the phone.
         *
         */
        this.unregister = function() {
            if (context.isReady() && context.isRegistered()) {
                console.log("UNREGISTER!!");
                tryRegistringCount = 0;
                context.session.phone.register(false);
            }
            else if(!context.isReady()) {
                suspendRegister = false;
            }
        };
        /**
         * Unregister the phone.
         */
        this.register = function(force) {
            if (context.isReady() && context.session.status != this.SES_STATUS_NOTPERMITTED && (!context.isRegistered() || force) && !context.isRegistering()) {
                console.log("REGISTER!!!")
                tryRegistringCount = 0;
                context.session.phone.register(true);
            }
            else if(!context.isReady()){
                suspendRegister = true;
            }
        };

        /**
         * Dial an extension or phone number.
         *
         * @param {int}
         *            number
         * @return
         */
        this.call = function(phoneNumber) {
            if (context.isRegistered() && phoneNumber) {
                context.session.phone.makeCall(phoneNumber);
                return true;
            }
        };

        /**
         * Accept an incoming call.
         */
        this.accept = function(sipId) {
            var call = context.SIPCalls[sipId];
            if(call) {
                call.accept();
                return true;
            }
        };

        /**
         * Transfer the call to another number.
         *
         * @param {int}
         *            phoneNumber The number to transfer the call to.
         * @returns api
         */
        this.transfer = function(sipId, phoneNumber) {
            var call = context.SIPCalls[sipId];
            if(call && (call.status != context.CALL_STATUS_RINGING)) {
                call.transfer(phoneNumber);
                return true;
            }
        };

        this.answerToHold = function(sipId) {
            var call = context.SIPCalls[sipId];
            if(call) {
                call._toHold = true;
                call.accept();
                return true;
            }
        };

        /**
         * End the phone call.
         *
         */
        this.end = function(sipId) {
            var call = context.SIPCalls[sipId];
            if(call) {
                call.hangUp();
                return true;
            }
        };

        /**
         * Returns current codec name for call.
         *
         */
        this.getCodecName = function(sipId) {
            var call = context.SIPCalls[sipId];
            if(call) {
                return call.codec;
            }
            return "";
        };


        /**
         * Place the call on hold.
         *
         */
        this.hold = function(sipId) {
            var call = context.SIPCalls[sipId];
            if(call) {
                call.hold = true;
                return true;
            }
        };

        /**
         * Take the call off hold.
         *
         */
        this.unhold = function(sipId) {
            var call = context.SIPCalls[sipId];
            if(call) {
                call.hold = false;
                return true;
            }
        };

        /**
         * Take the call off hold.
         *
         */
        this.putActiveCallsOnHold = function(call) {
            for (sipId in context.SIPCalls) {
                if(call!=context.SIPCalls[sipId] && context.SIPCalls[sipId].status == context.CALL_STATUS_ACCEPTED) {
                    context.hold(sipId);
                }
            }
        };

        this.hasCall = function() {
            for (sipId in context.SIPCalls) {
                return true;
            }
            return false;
        };

        this.mute = function() {
            savedMicValue = context.getMicrophoneVolume();
            context.setMicrophoneVolume(0);
            return true;
        };

        this.unmute = function() {
            context.setMicrophoneVolume(savedMicValue || 0.8);
            return true;
        };

        this.speakerOff = function() {
            savedSpeakerValue = context.getSpeakerVolume()
            context.setSpeakerVolume(0);
            return true;
        };

        this.speakerOn = function() {
            context.setSpeakerVolume(savedSpeakerValue || 0.8);
            return true;
        };

        /**
         * Send dtmf message.
         */
        this. sendDtmf = function(sipId, message) {
            var call = context.SIPCalls[sipId];
            if(call) {
                call.dtmf(message);
                return true;
            }
        };
        this.playDtmfTone = function(_char) {
            if(context.isReady() && context.session.getDTMFToneGenerator()) {
                context.session.getDTMFToneGenerator().play(_char);
            }
        };
        this.stopDtmfTone = function() {
            if(context.isReady() && context.session.getDTMFToneGenerator()) {
                context.session.getDTMFToneGenerator().stop();
            }
        };
//        this.addAlert = function(html) {
//            if(context.isReady()) {
//                context.session.alertAPI.addAlert(html);
//                context.alertIsOn = true;
//            }
//        };

        this.addAlert = function(html) {
            if(context.isReady()) {
                console.log("addAlert");
                context.alertIsOn = true;
                context.session.alertAPI.addAlertEx(html);
                context.session.alertAPI.setShadow(true);
                context.session.alertAPI.setBorderRadius(this.alertBorderRadius);
            }
        };

        this.setAlertBorderRadius =  function(r) {
            this.alertBorderRadius = r;
        }

        this.removeAlert = function() {
            if(context.isReady()) {
                context.session.alertAPI.removeAlert();
                context.alertIsOn = false;
            }
        };

        this.alertVisible = function() {
            return context.alertIsOn;
        }

        this.initAlert = function(url) {
            if(context.isReady()){
                context.session.alertAPI.initAlert(url);
            }
        };

        this.getScreenByPoint = function(x, y) {
            if(context.isReady()) {
                var screens = context.getScreens();
                if(!screens || screens.length==0) {
                    context.onError("No screens");
                    return null;
                }
                for(var i = 0; i <screens.length; i++) {
                    var _screen = screens[i];
                    if(x >= _screen.clientX
                        && x <= _screen.clientX + _screen.clientWidth
                        && y >= _screen.clientY
                        && y <= _screen.clientY + _screen.clientHeight) {
                        return _screen;
                    }
                }
            }
        };

        this.getGeneralScreen = function() {
            if(context.isReady()) {
                var screens = context.getScreens();
                if(!screens || screens.length==0) {
                    context.onError("No screens");
                    return null;
                }
                return screens[0];
            }
        }

        this.alertInScreen = function(x,y,w,h) {
            var screen1 = this.getScreenByPoint(x, y);
            var screen2 = this.getScreenByPoint(x+w, y+h);
            return !!screen1 && !!screen2;
        };


        this.setAlertBounds = function(x,y,w,h)
        {
            console.log("setAlertBounds", x, y, w, h, "isDrug: "+isDrug);
            if(context.isReady()) {

                var _inscreen = context.alertInScreen(x,y,w,h);
                console.log("alert in screen: " + _inscreen);
                if(!_inscreen && _inscreen!=null) {
                    screen = context.getScreens()[0];
                    x = x > (screen.clientX + screen.clientWidth) - w ? (screen.clientX + screen.clientWidth) - w : x;
                    y = y > (screen.clientY + screen.clientHeight) - h ? (screen.clientY + screen.clientHeight) - h : y;
                    x = x < screen.clientX ? screen.clientX : x;
                    y = y < screen.clientY ? screen.clientY : y;
                }

                if(isMac) {
                    y = this.getGeneralScreen().height - y - h;
                }
                savedAlertX = x;
                savedAlertY = y;
                if(!isDrug) {
                    context.session.alertAPI.setAlertBounds(x,y,w,h);
                }
                else {
                    context.session.alertAPI.setAlertSize(w,h);
                }
                alertBoundsArgs = arguments;
            }
        };

        this.addApiEventListener = function(eventName, callback) {
            if(!context.listeners[eventName]) {
                context.listeners[eventName]=[];
            }
            context.listeners[eventName].push(callback);
        };

        this.removeApiEventListener = function(eventName, callback) {
            if(!context.listeners[eventName]) return;
            context.listeners[eventName].splice(context.listeners[eventName].indexOf(callback), 1);
        };

        this.onEvent = function(eventName, obj, type) {
            if(context.listeners[eventName]) {
                for(var i =0; i<context.listeners[eventName].length; i++) {
                    try {
                        context.listeners[eventName][i](obj, type);
                    }
                    catch(e) {
                        console.error("onEvent - "+eventName+" error: ", e);
                    }
                }
            }
        };

        this.joinScreenShareSession = function(screenshareServer, sessionNumber, userDisplayName){
            if(context.isReady()){
                try {
                    var params=[];
                    params[0]="com.fonality.screenshare.run.RunView";
                    params[1]=screenshareServer;
                    params[2]=sessionNumber;
                    params[3]=userDisplayName;

                    launcher=context.session.newJarLauncher('screenShareView');

                    var onTaskOutput = function(str) {
                        console.info("fj.fdp.phone.Api:joinScreenShareSession:onTaskOutput.", str);
                    };
                    var onTaskErrorOutput = function(error) {
                        console.error("fj.fdp.phone.Api:joinScreenShareSession:onTaskErrorOutput.", error);
                    };
                    var onTaskTerminated = function(status) {
                        console.info("fj.fdp.phone.Api:joinScreenShareSession:onTaskTerminated. Status= ", status);
                    };

                    if (launcher.attachEvent) {
                        launcher.attachEvent("onOUTPUTSTREAM", onTaskOutput);
                        launcher.attachEvent("onERRORSTREAM", onTaskErrorOutput);
                        launcher.attachEvent("onPROCESSTERMINATED", onTaskTerminated);
                    } else {
                        launcher.addEventListener("OUTPUTSTREAM", onTaskOutput, false);
                        launcher.addEventListener("ERRORSTREAM", onTaskErrorOutput, false);
                        launcher.addEventListener("PROCESSTERMINATED", onTaskTerminated, false);
                    }
                    launcher.start("screenshare",params);
                }
                catch(e) {
                    console.error("joinScreenShareSesion: ", e);
                }
            }
        };

        this.startScreenShareSession = function(screenshareServer, authToken, userDisplayName, listener) {
            if(context.isReady()){
                try {
                    //1. find existing launcher:
                    var launchers=[];
                    context.session.getJarLaunchers('screenShareRun', launchers);
                    for(var i =0; i<launchers.length; i++) {
                        var _launcher=launchers[i];

                        if(_launcher != undefined) {
                            url = _launcher.getProperty('url');
                            sessionId = _launcher.getProperty('sessionId');
                            if (url !=undefined && sessionId!= undefined) {
                                listener.onScreenShareUrl(url);
                                listener.onScreenShareSessionId(sessionId);
                                return;
                            } else {
                                console.error("incorrect screenShare data: url=" + url+ ", sessionId=" + sessionId);
                            }

                        }
                    }


                    //2. if there is no existing launcher - create new
                    var params=[];
                    params[0]="com.fonality.screenshare.run.RunShareByToken";
                    //params[0]="com.fonality.screenshare.run.RunShare";
                    params[1]=screenshareServer;
                    params[2]=authToken;
                    params[3]=userDisplayName;

                    var launcher=context.session.newJarLauncher('screenShareRun');

                    var onTaskOutput = function(line) {
                        console.info("fj.fdp.phone.Api:startScreenShareSesion:onTaskOutput.", line);
                        var index = line.indexOf("ScreenShareURL:");
                        if(index!=-1) {
                            if(listener != undefined) {
                                screenShareUrl = line.substring(index + "ScreenShareURL:".length).trim();
                                launcher.setProperty('url',screenShareUrl);
                                listener.onScreenShareUrl(screenShareUrl);
                            }
                        }
                        var indexSessionId = line.indexOf("ScreenShareID:");
                        if(indexSessionId!=-1) {
                            if(listener != undefined) {
                                screenShareId = line.substring(indexSessionId + "ScreenShareID:".length).trim();
                                launcher.setProperty('sessionId',screenShareId);
                                listener.onScreenShareSessionId(screenShareId);
                            }
                        }
                    };

                    var onTaskErrorOutput = function(error) {
                        console.error("fj.fdp.phone.Api:startScreenShareSesion:onTaskErrorOutput ", error);
                    };

                    var onTaskTerminated = function(status) {
                        console.info("fj.fdp.phone.Api:startScreenShareSesion:onTaskTerminated. Status= ", status);
                        if(listener != undefined) {
                            listener.onScreenshareTerminated(status);
                        }
                    };

                    if (launcher.attachEvent) {
                        launcher.attachEvent("onOUTPUTSTREAM", onTaskOutput);
                        launcher.attachEvent("onERRORSTREAM", onTaskErrorOutput);
                        launcher.attachEvent("onPROCESSTERMINATED", onTaskTerminated);
                    } else {
                        launcher.addEventListener("OUTPUTSTREAM", onTaskOutput, false);
                        launcher.addEventListener("ERRORSTREAM", onTaskErrorOutput, false);
                        launcher.addEventListener("PROCESSTERMINATED", onTaskTerminated, false);
                    }
                    launcher.start("screenshare",params);
                }
                catch(e) {
                    console.error("joinScreenShareSesion: ", e);
                }
            }
        };

        this.destroy = function() {
            try {
                fj.dom.DOMUtils.removeNode(context.phoneObject);
                initialized = false;
            } catch(ex) {
                console.error("fj.fdp.phone.Api:destroy: " + ex.message);
            }
        };
    };

    fj.fdp.phone.Api.init = function(userId) {
        if (this.checkPlugin()) {
            var _instance = fj.fdp.phone.Api.getInstance();
            _instance.init(userId);
            return _instance;
        }
    };

    fj.fdp.phone.Api.config = {
        "name" : "FonalityPlugin"
        , "mimeType" : "application/x-fonalityplugin"
        , "activeXName" : "Fonality.FonalityPlugin"
        , "allowedCodecs" : {
//        	"speex/8000/1":200
//            , "iLBC/8000/1":180
//            , "GSM/8000/1":160
//            ,
            "PCMU/8000/1":255
            , "PCMA/8000/1":255}
    };

    fj.fdp.phone.Api.checkPlugin = function() {
        try {
            console.log("checkPlugin");
            if (window.ActiveXObject) {
                return !!new ActiveXObject(this.config.activeXName);
            }
            else if (navigator.plugins) {
                return typeof (navigator.plugins[this.config.name]) != "undefined";
            }
        }
        catch (e){}

        return false;
    };

    fj.fdp.phone.Api.getInstance = function() {
        if (fj.fdp.phone.Api.instance === undefined) {
            fj.fdp.phone.Api.instance = new fj.fdp.phone.Api();
        }
        return fj.fdp.phone.Api.instance;
    }
})();
