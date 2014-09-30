(function(){
  fjs.core.namespace("fjs.plugin.phone");

  var _API =
  /**
   * Phone Api
   * @param config
   * @param authTicket
   * @param node_id
   * @constructor
   */
  fjs.plugin.phone.API = function(config, authTicket, node_id) {
    var context = this;
    config = config || {};
    fjs.model.EventsSource.call(this);

    this.config = config.PHONE || config;
    this.allowedCodecs = this.config.allowedCodecs || {
      "PCMU/8000/1":255
      , "PCMA/8000/1":255
    };

    this.tryRegistringCount = 0;

    this.pluginManager = new fjs.plugin.PluginManager(config, authTicket, node_id);
    this.pluginManager.addEventListener("SessionStatusChanged", function(session){
      context.fireEvent("SessionStatusChanged", session);
      if(context.pluginManager.isReady()) {
        context.attachPluginEvents();
        context.register();
      }
    });
    if(this.pluginManager.isReady()) {
      this.attachPluginEvents();
      this.register();
    }

    this.SIPCalls = {};
    this.callsStates = {};
    this.savedMicValue = 0.8;
    this.savedSpeakerValue = 0.8;

    this.devicesChanged = false;
    this.lastInputDeviceId = null;
    this.lastOutputDeviceId = null;
    this.lastRingDeviceId = null;
    this.lastDevices = [];

  };
  fjs.core.inherits(_API, fjs.model.EventsSource);

  _API.REG_STATUS_REGISTERING = -1;
  _API.REG_STATUS_OFFLINE = 0;
  _API.REG_STATUS_ONLINE = 1;

  _API.CALL_STATUS_UNKNOWN = -1;
  _API.CALL_STATUS_RINGING = 0;
  _API.CALL_STATUS_ACCEPTED = 1;
  _API.CALL_STATUS_CLOSED = 2;
  _API.CALL_STATUS_ERROR = 3;
  _API.CALL_STATUS_HOLD = 4;

  _API.WAVE_MAPPER_NAME = "Wave mapper";

  /**
   * Returns true is plugin is ready
   * @return {boolean}
   */
  _API.prototype.isReady = function() {
    return this.pluginManager.isReady();
  };

  /**
   * Returns phone object
   * @return {*}
   */
  _API.prototype.getPhone = function() {
    if(this.isReady()) {
      return this.pluginManager.getSession().phone;
    }
  };

  /**
   * Returns plugin sound manager object
   * @return {*}
   */
  _API.prototype.getSoundManager = function() {
    if(this.isReady()) {
      return this.pluginManager.getSession().soundManager;
    }
  };
  /**
   * Registers phone on asterisk
   * @param {boolean} force
   */
  _API.prototype.register = function(force) {
    if (this.isReady() && !this.pluginManager.isNotPermitted() && (!this.isRegistered() || force) && !this.isRegistering()) {
      this.tryRegistringCount = 0;
      this.getPhone().register(true);
    }
  };
  /**
   * Unregisters phone on asterisk
    */
  _API.prototype.unregister = function() {
    if (this.isReady() && this.isRegistered()) {
      this.tryRegistringCount = 0;
      this.getPhone().register(false);
    }
  };
  /**
   * @private
   */
  _API.prototype.attachPluginEvents = function() {
    var context = this;
    if(this.getPhone().addEventListener) {
      this.getPhone().addEventListener("Call", function (call) {
        context.onCallStateChanged(call);
      }, false);
      this.getPhone().addEventListener("Status", function (phone) {
        context.onPhoneStatusChanged(phone);
      }, false);
      this.getSoundManager().addEventListener("SoundDevicesChanged", function () {
        context.devicesChanged = true;
        context.soundDevicesChanged();
      }, false);
    }
    else if(this.getPhone().attachEvent) {
      this.getPhone().attachEvent("onCall", function(call) {
        context.onCallStateChanged(call);
      });
      this.getPhone().attachEvent("onStatus", function(phone) {
        context.onPhoneStatusChanged(phone);
      });
      this.getSoundManager().attachEvent("onSoundDevicesChanged", function() {
        context.devicesChanged = true;
        context.soundDevicesChanged();
      });
    }
  };
  /**
   * @param {*} phone - phone object
   * @private
   */
  _API.prototype.onPhoneStatusChanged = function(phone) {
    if (phone) {
      if (phone.status == _API.REG_STATUS_ONLINE) {
        this.tryRegistringCount = 0;
      } else if (phone.status == _API.REG_STATUS_OFFLINE) {
        if (this.tryRegistringCount > 5) {
          this.fireEvent("PhoneError" , {message:"can't register"});
        } else {
          this.getPhone().register(true);
          this.tryRegistringCount++;
        }
      }
      this.fireEvent("AccountStatusChanged", {status:phone.status});
    }
  };
  /**
   *
   * @param {Number} val
   * @param {Number} min
   * @param {Number} max
   * @return {Number}
   * @private
   */
  _API.prototype.validateDoubleValue = function(val, min , max) {
    val = parseFloat(val);
    if (!isNaN(val)) {
      val = val < min ? min : val;
      val = val > max ? max : val;
    }
    return val || min;
  };

  /**
   * Returns current speaker volume
   * @return {Number}
   */
  _API.prototype.getSpeakerVolume = function() {
    if(this.isReady()) {
      return this.getSoundManager().speaker;
    }
    return 0;
  };

  /**
   * Sets speaker volume
   * @param {Number} val - number from 0 to 1
   */
  _API.prototype.setSpeakerVolume = function(val) {
    if(this.isReady() && this.getSoundManager().speaker != val) {
      val = this.validateDoubleValue(val, 0, 1);
      this.getSoundManager().speaker = val;
      this.fireEvent("SpeakerVolumeChanged", val);
    }
  };

  /**
   * Returns current mic volume
   * @return {Number}
   */
  _API.prototype.getMicrophoneVolume = function() {
    if(this.isReady()) {
      return this.getSoundManager().microphone;
    }
    return 0;
  };

  /**
   * Sets microphone volume
   * @param {Number} val - number from 0 to 1
   */
  _API.prototype.setMicrophoneVolume = function(val) {
    if(this.isReady() && this.getSoundManager().microphone != val) {
      val = this.validateDoubleValue(val, 0, 1);
      this.getSoundManager().microphone = val;
      this.fireEvent("MicrophoneVolumeChanged", val);
    }
  };

  /**
   * Returns echo cancellation value
   * @returns {Number}
   */
  _API.prototype.getEACTailLength = function() {
    if(this.isReady()) {
      return this.getSoundManager().AECTailLength;
    }
  };

  /**
   * Sets echo cancellation value
   * @param {Number} val
   */
  _API.prototype.setEACTailLength = function(val) {
    if(this.isReady() && val != this.getSoundManager().AECTailLength) {
      val = this.validateDoubleValue(val, 0, 500);
      this.getSoundManager().AECTailLength = val;
      this.fireEvent("EACTailLengthChanged", val);
    }
  };

  /**
   * Retruns current input device id
   * @returns {number}
   */
  _API.prototype.getInputDeviceId = function() {
    if(this.isReady()) {
      return this.getSoundManager().inpdefid >= 0 ? this.getSoundManager().inpdefid : this.getSoundManager().getSystemInputDevice();
    }
  };


  /**
   * Sets current input device id
   * @param {number} devId
   */
  _API.prototype.setInputDeviceId = function(devId) {
    var devices = this.getDevices();
    if(this.isReady() && this.getSoundManager().inpdefid != devId && devices.length>devId) {
      if(devices.length > devId && devices[devId].input_count > 0) {
        this.getSoundManager().inpdefid = devId;
      }
      else if(this.getSoundManager().getSystemInputDevice){
        devId = this.getSoundManager().getSystemInputDevice();
        this.getSoundManager().inpdefid = devId;
      }
      this.fireEvent("InputDeviceChanged", devId);
    }
  };


  /**
   * Retruns current output device id
   * @returns {number}
   */
  _API.prototype.getOutputDeviceId = function() {
    if(this.isReady()) {
      return this.getSoundManager().outdefid>=0 ? this.getSoundManager().outdefid : this.getSoundManager().getSystemOutputDevice();
    }
  };

  /**
   * Sets current output device id
   * @returns {number}
   */
  _API.prototype.setOutputDeviceId = function(devId) {
    var devices = this.getDevices();
    if(this.isReady() && this.getSoundManager().outdefid != devId) {
      if(devices.length > devId && devices[devId].output_count > 0) {
        this.getSoundManager().outdefid = devId;
      }
      else if(this.getSoundManager().getSystemOutputDevice) {
        devId = this.getSoundManager().getSystemOutputDevice()
        this.getSoundManager().outdefid = devId;
      }
      this.fireEvent("OutputDeviceChanged", devId);
    }
  };

  /**
   * Retruns current ring device id
   * @returns {number}
   */
  _API.prototype.getRingDeviceId = function() {
    if(this.isReady()) {
      return this.getSoundManager().ringdefid>=0 ? this.getSoundManager().ringdefid : this.getSoundManager().getSystemOutputDevice();
    }
  };

  /**
   * Sets current ring device id
   * @param {number} devId
   */
  _API.prototype.setRingDeviceId = function(devId) {
    var devices = this.getDevices();
    if(this.isReady() && this.getSoundManager().ringdefid != devId) {
      if(devices.length > devId && devices[devId].output_count > 0) {
        this.getSoundManager().ringdefid = devId;
      }
      else if(this.getSoundManager().getSystemOutputDevice) {
        devId = this.getSoundManager().getSystemOutputDevice()
        this.getSoundManager().ringdefid = devId;
      }
      this.fireEvent("RingDeviceChanged", devId);
    }
  };

  /**
   * Returns list of devices
   * @returns {Array}
   */
  _API.prototype.getDevices = function() {
    if(this.isReady()) {
      return this.getSoundManager().devs;
    }
  };

  /**
   * Returns list of output devices
   * @returns {Array}
   */
  _API.prototype.getOutputDevices = function() {
    if(this.isReady()) {
      var devs = this.getSoundManager().devs;
      var outputdevs = [];
      for(var i=0; i<devs.length; i++) {
        if(devs[i].output_count > 0) {
          outputdevs.push(devs[i]);
        }
      }
      return outputdevs;
    }
  };

  /**
   * Returns list of input devices
   * @returns {Array}
   */
  _API.prototype.getInputDevices = function() {
    if(this.isReady()) {
      var devs = this.getSoundManager().devs;
      var inputdevs = [];
      for(var i=0; i<devs.length; i++) {
        if(devs[i].input_count > 0) {
          inputdevs.push(devs[i]);
        }
      }
      return inputdevs;
    }
  };

  /**
   * Returns list of codecs
   * @returns {Array}
   */
  _API.prototype.getCodecs = function() {
    var res=[];
    if(this.isReady()) {
      var arr=[];
      this.getSoundManager().getCodecs(arr);
      for(var i=0; i<arr.length; i++) {
        if(this.allowedCodecs[arr[i].name]) {
          res.push(arr[i]);
        }
        else {
          arr[i].priority = 0;
        }
      }
    }
    return res;
  };


  /**
   * Sets default codecs priority
   * @private
   */
  _API.prototype.setDefaultCodecsPriority = function() {
    if(this.isReady()) {
      var arr=[];
      this.getSoundManager().getCodecs(arr);
      for(var i=0; i<arr.length; i++) {
        if(this.allowedCodecs[arr[i].name]) {
          this.setCodecPriority (arr[i].name, this.allowedCodecs[arr[i].name]);
        }
        else {
          this.setCodecPriority (arr[i].name, 0);
        }
      }
    }
  };


  /**
   *
   * @param codecName
   * @param priority
   * @private
   */
  _API.prototype.setCodecPriority = function(codecName, priority) {
    if(this.isReady()) {
      var codecs = this.getCodecs();
      priority = this.validateDoubleValue(priority, 0, 255);
      for(var i=0; i <codecs.length; i++) {
        if(codecs[i].name == codecName) {
          codecs[i].priority = priority;
          this.fireEvent("CodecPriorityChanged", {codecName:codecName, priority:priority});
          return;
        }
      }
    }
  };

  /**
   * Returns phone status
   * @returns {number}
   */
  _API.prototype.getPhoneStatus = function() {
    return this.getPhone() ? this.getPhone().status : 0;
  };

  /**
   * @private
   */
  _API.prototype.soundDevicesChanged = function() {

    if(this.isReady() && this.devicesChanged) {
      var newDevices = this.getDevices() || [];
      var lODev= this.lastDevices[this.lastOutputDeviceId];
      var lIDev= this.lastDevices[this.lastInputDeviceId];
      var lRDev= this.lastDevices[this.lastRingDeviceId];
      var outputFlag = false;
      var inputFlag = false;
      var ringFlag = false;

      if(lODev!=undefined && lIDev!=undefined && lIDev!=undefined) {
        for(var i=0; i<newDevices.length; i++) {
          var _dev = newDevices[i];
          if(lODev.name == _dev.name && lODev.input_count == _dev.input_count && lODev.output_count == _dev.output_count) {
            this.getSoundManager().outdefid = _dev.id;
            outputFlag = true;
          }
          if(lIDev.name == _dev.name && lIDev.input_count == _dev.input_count && lIDev.output_count == _dev.output_count) {
            this.getSoundManager().inpdefid = _dev.id;
            inputFlag = true;
          }
          if(lRDev.name == _dev.name && lRDev.input_count == _dev.input_count && lRDev.output_count == _dev.output_count) {
            this.getSoundManager().ringdefid = _dev.id;
            ringFlag = true;
          }
        }
      }
      if(this.getSoundManager().getSystemOutputDevice) {
        if(!outputFlag) {
          this.getSoundManager().outdefid = this.getSoundManager().getSystemOutputDevice();
        }
        if(!inputFlag) {
          this.getSoundManager().inpdefid = this.getSoundManager().getSystemInputDevice();
        }
        if(!ringFlag) {
          this.getSoundManager().ringdefid = this.getSoundManager().getSystemOutputDevice();
        }
      }
      else {
        for(var i=0; i<newDevices.length; i++) {
          var _dev = newDevices[i];
          if(!outputFlag && _dev.output_count>0) {
            this.getSoundManager().outdefid = _dev.id;
          }
          if(!inputFlag && _dev.input_count>0) {
            this.getSoundManager().inpdefid = _dev.id;
          }
          if(!ringFlag && _dev.output_count>0) {
            this.getSoundManager().ringdefid = _dev.id;
          }
        }
      }
      this.lastInputDeviceId = this.getInputDeviceId();
      this.lastOutputDeviceId = this.getOutputDeviceId();
      this.lastRingDeviceId = this.getRingDeviceId();
      this.lastDevices = newDevices || [];
      this.fireEvent("DeviceChanged", this.lastDevices);
    }
  };

  /**
   * @param {Object} call - call object
   * @private
   */
  _API.prototype.onCallStateChanged = function(call) {
    //console.log(call.remote_contact+":"+call.status);
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
      case _API.CALL_STATUS_RINGING:
      case _API.CALL_STATUS_ACCEPTED:
      case _API.CALL_STATUS_HOLD:

        this.SIPCalls[call.sip_id] = call;

        switch (call.status) {
          case _API.CALL_STATUS_RINGING:
            callInfo.fdpState = 0;
            break;
          case _API.CALL_STATUS_ACCEPTED:
            callInfo.fdpState = 2;
            if (call._toHold) {
              call.hold = true;
            }
            else if(this.callsStates[call.sip_id] != call.status){
              this.putActiveCallsOnHold(call);
            }
            break;
          case _API.CALL_STATUS_HOLD:
            callInfo.fdpState = 3;
            break;
        }
        break;
      case _API.CALL_STATUS_CLOSED:
        delete this.SIPCalls[call.sip_id];
        delete this.callsStates[call.sip_id];
        this.fireEvent("CallStateChanged", callInfo);
        return;
        break;
      case _API.CALL_STATUS_UNKNOWN:
        break;
      case _API.CALL_STATUS_ERROR:
        this.fireEvent("CallError", callInfo);
        break;
    }
    this.callsStates[call.sip_id] = call.status;
    this.fireEvent("CallStateChanged", callInfo);
  };

  /**
   * Returns true if phone registered
   * @returns {boolean}
   */
  _API.prototype.isRegistered = function() {
    return this.getPhoneStatus() == _API.REG_STATUS_ONLINE;
  };

  /**
   * Returns true if phone is in registering state
   * @returns {boolean}
   */
  _API.prototype.isRegistering = function() {
    return this.getPhoneStatus() == _API.REG_STATUS_REGISTERING;
  };

  /**
   * Makes a call
   * @param {string} phoneNumber
   * @returns {boolean}
   */
  _API.prototype.call = function(phoneNumber) {
    if (this.isRegistered() && phoneNumber) {
      this.getPhone().makeCall(phoneNumber);
      return true;
    }
  };

  /**
   * Accept an incoming call.
   * @param {string} sipId
   * @returns {boolean}
   */
  _API.prototype.accept = function(sipId) {
    var call = this.SIPCalls[sipId];
    if(call) {
      call.accept();
      return true;
    }
  };

  /**
   * Transfer the call to another number.
   * @param {string} sipId
   * @param {string} phoneNumber The number to transfer the call to.
   * @returns {boolean}
   */
  _API.prototype.transfer = function(sipId, phoneNumber) {
    var call = this.SIPCalls[sipId];
    if(call && (call.status != _API.CALL_STATUS_RINGING)) {
      call.transfer(phoneNumber);
      return true;
    }
  };

  /**
   * Accepts an incoming call and puts it to hold
   * @param {string} sipId
   * @returns {boolean}
   */
  _API.prototype.answerToHold = function(sipId) {
    var call = this.SIPCalls[sipId];
    if(call) {
      call._toHold = true;
      call.accept();
      return true;
    }
  };

  /**
   * End the phone call.
   * @param {string} sipId
   * @returns {boolean}
   */
  _API.prototype.end = function(sipId) {
    var call = this.SIPCalls[sipId];
    if(call) {
      call.hangUp();
      return true;
    }
  };

  /**
   * Returns current codec name for call.
   * @param {string} sipId
   * @returns {boolean}
   * @private
   */
  _API.prototype.getCodecName = function(sipId) {
    var call = this.SIPCalls[sipId];
    if(call) {
      return call.codec;
    }
    return "";
  };


  /**
   * Place the call on hold.
   * @param {string} sipId
   * @returns {boolean}
   */
  _API.prototype.hold = function(sipId) {
    var call = this.SIPCalls[sipId];
    if(call) {
      //console.log("hold:", call.remote_contact);
      call.hold = true;
      return true;
    }
  };

  /**
   * Take the call off hold.
   * @param {string} sipId
   * @returns {boolean}
   */
  _API.prototype.unhold = function(sipId) {
    var call = this.SIPCalls[sipId];
    if(call) {
      //console.log("hold:", call.remote_contact);
      call.hold = false;
      return true;
    }
  };

  /**
   * Place all active calls except one on hold.
   * @param {Object} call - Call object
   */
  _API.prototype.putActiveCallsOnHold = function(call) {
    for (var sipId in this.SIPCalls) {
      if(call!=this.SIPCalls[sipId] && this.SIPCalls[sipId].status == _API.CALL_STATUS_ACCEPTED) {
        this.hold(sipId);
      }
    }
  };

  /**
   * Returns true if call exist
   * @returns {boolean}
   */
  _API.prototype.hasCall = function() {
    for (var sipId in this.SIPCalls) {
      return true;
    }
    return false;
  };

  /**
   * Mute microphone
   * @returns {boolean}
   */
  _API.prototype.mute = function() {
    this.savedMicValue = this.getMicrophoneVolume();
    this.setMicrophoneVolume(0);
    return true;
  };

  /**
   * Unmute mickrophone
   * @returns {boolean}
   */
  _API.prototype.unmute = function() {
    this.setMicrophoneVolume(this.savedMicValue || 0.8);
    return true;
  };

  /**
   * Mute speaker
   * @returns {boolean}
   */
  _API.prototype.speakerOff = function() {
    this.savedSpeakerValue = this.getSpeakerVolume()
    this.setSpeakerVolume(0);
    return true;
  };

  /**
   * Mute speaker
   * @returns {boolean}
   */
  _API.prototype.speakerOn = function() {
    this.setSpeakerVolume(this.savedSpeakerValue || 0.8);
    return true;
  };

  /**
   * Send dtmf message.
   * @param {string} sipId
   * @param {string} message
   * @returns {boolean}
   */
  _API.prototype.sendDtmf = function(sipId, message) {
    var call = this.SIPCalls[sipId];
    if(call) {
      call.dtmf(message);
      return true;
    }
  };
  /**
   * Starts play DTMF tone
   * @param {string} _char
   */
  _API.prototype.playDtmfTone = function(_char) {
    if(this.isReady() && this.pluginManager.getSession().getDTMFToneGenerator()) {
      this.pluginManager.getSession().getDTMFToneGenerator().play(_char);
    }
  };
  /**
   * Ends play DTMF tone
   * @param {string} _char
   */
  _API.prototype.stopDtmfTone = function() {
    if(this.isReady() &&this.pluginManager.getSession().getDTMFToneGenerator()) {
      this.pluginManager.getSession().getDTMFToneGenerator().stop();
    }
  };
})();
