namespace("fjs.app");

fjs.app.SFAdapter = function () {
    var context = this;
    this.currentLocationId = null;
    this.currentDeviceStatus = false;
    this.currentDeviceAutoAnsver = false;

    this.feedModels = {};
    this.sfApi = new SFApi();
    this.apiInitialized = false;
    this.phoneMap = {};
    this.eventListeners = {};

    this.sfApi.setSoftphoneHeight(fjs.app.SFAdapter.SOFTPHONE_HEIGHT, function(res) {
    });
    this.sfApi.setSoftphoneWidth(fjs.app.SFAdapter.SOFTPHONE_WIDTH, function(res) {
    });

    this.checkDevice = function() {
        if(this.currentLocationId) {
            var locationStatus = this.feedModels[fjs.app.SFAdapter.LOCATION_STATUS_FEED_NAME].items[this.currentLocationId];
            if(locationStatus) {
                this.currentDeviceStatus = locationStatus.deviceStatus == "r";
                this.currentDeviceAutoAnsver = locationStatus.autoAnswer;
                if(!this.apiInitialized) {
                    this.sfApi.setPhoneApi(this.currentDeviceStatus, function(obj) {
                        var res = obj && obj.result && JSON.parse(obj.result);
                        var phone = res.number;
                        if(phone) {
                            var calleeInfo = {};
                            calleeInfo.id = res.objectId;
                            calleeInfo.type = res.object;
                            context.phoneMap[phone] = calleeInfo;
                            context.syncManager.sendAction(fjs.app.SFAdapter.ME_FEED_NAME, "callTo", {"a.phoneNumber":phone});
                        }
                    });
                    this.apiInitialized = true;
                }
            }
        }
    };
};

fjs.app.SFAdapter.SOFTPHONE_HEIGHT = 200;
fjs.app.SFAdapter.SOFTPHONE_WIDTH = 200;
fjs.app.SFAdapter.FRAME_RESIZE_NAME = "resizeFrame";

fjs.app.SFAdapter.MY_CALLS_FEED_NAME = "mycalls";
fjs.app.SFAdapter.ME_FEED_NAME = "me";
fjs.app.SFAdapter.LOCATION_STATUS_FEED_NAME = "location_status";
fjs.app.SFAdapter.LOCATIONS_FEED_NAME = "locations";

fjs.app.SFAdapter.prototype.init = function() {
    var context = this;
    var frameHtml = document.getElementById(fjs.app.SFAdapter.FRAME_RESIZE_NAME);
    var oldHeight = frameHtml.clientHeight;
    var timerResize = null;

    var dialpadPlate = document.getElementById("plate");
    dialpadPlate.onclick = function(e) {
       e = document.getElementById('NewCallController');
       scope = angular.element(e).scope();
       scope.$apply(function() {
           scope.closeDialpad();
       });
    };
    dialpadPlate.style.display = "none";

    document.body.onresize = function(){
        onResize();
    };

    function onResize() {
        if(timerResize!=null) {
            clearTimeout(timerResize);
            timerResize = null;
        }
        timerResize=setTimeout( function(){
            var height = frameHtml.clientHeight;
            if(height!=oldHeight) {
                context.sfApi.setSoftphoneHeight(frameHtml.clientHeight, function(res){
                    timerResize = null;
                });
            }
            oldHeight = height;
        }, 100);
    }

    setTimeout(function(){
        frame.onresize = function(){
            onResize();
        }
    },200);

    this.feedModels[fjs.app.SFAdapter.MY_CALLS_FEED_NAME] = new fjs.model.MyCallsFeedModel();
    this.feedModels[fjs.app.SFAdapter.MY_CALLS_FEED_NAME].init();
    this.feedModels[fjs.app.SFAdapter.ME_FEED_NAME] = new fjs.model.FeedModel(fjs.app.SFAdapter.ME_FEED_NAME);
    this.feedModels[fjs.app.SFAdapter.ME_FEED_NAME].init();
    this.feedModels[fjs.app.SFAdapter.LOCATION_STATUS_FEED_NAME] = new fjs.model.FeedModel(fjs.app.SFAdapter.LOCATION_STATUS_FEED_NAME);
    this.feedModels[fjs.app.SFAdapter.LOCATION_STATUS_FEED_NAME].init();
    this.feedModels[fjs.app.SFAdapter.LOCATIONS_FEED_NAME] = new fjs.model.FeedModel(fjs.app.SFAdapter.LOCATIONS_FEED_NAME);
    this.feedModels[fjs.app.SFAdapter.LOCATIONS_FEED_NAME].init();

    this.feedModels[fjs.app.SFAdapter.ME_FEED_NAME].addListener("push", function(data){
        if(data.entry["propertyKey"] == "current_location") {
            context.currentLocationId = data.entry["propertyValue"];
        }
    });
    this.feedModels[fjs.app.SFAdapter.LOCATION_STATUS_FEED_NAME].addListener("complete", function() {
        context.checkDevice ();
    });
};

fjs.app.SFAdapter.prototype.getModel = function(feedName) {
    return this.feedModels[feedName];
};




