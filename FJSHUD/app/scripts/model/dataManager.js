(function() {
    fjs.core.namespace("fjs.hud");
    var dm =
    /**
     * Data manager
     * @constructor
     * @final
     * @extends fjs.model.EventsSource
     */
    fjs.hud.DataManager = function () {
        //Singleton
        if (!this.constructor.__instance)
            this.constructor.__instance = this;
        else return this.constructor.__instance;

        var context = this;

        fjs.model.EventsSource.call(this);

        this.feeds = {};

        this.config = fjs.CONFIG;

        this.api = new fjs.API(this.config);

        this.actionsManager = new fjs.hud.ActionsManager(this);

        this.api.addEventListener("sync", function (data) {
            context.fireEvent(data.feed, data);
        });
        this.api.addEventListener("auth", function (data) {

        });
        this.api.addEventListener("network", function (data) {

        });

        this.actions = {};
    };
    fjs.core.inherits(fjs.hud.DataManager, fjs.model.EventsSource);


    /**
     * Returns feed model by name
     * @param {string} feedName - Feed Name
     * @returns {fjs.hud.FeedModel}
     */
    fjs.hud.DataManager.prototype.getModel = function (feedName) {
        if (!this.feeds[feedName]) {
            switch (feedName) {
                case "me":
                    this.feeds[feedName] = new fjs.hud.MeFeedModel(this);
                    break;
//            case "locations":
//                this.feeds[feedName] = new fjs.fdp.LocationsFeedModel(this);
//                break;
                case "calllog":
                    this.feeds[feedName] = new fjs.hud.CalllogFeedModel(this);
                    break;
                case "contacts":
                    this.feeds[feedName] = new fjs.hud.ContactsFeedModel(this);
                    break;
                case "mycalls":
                    this.feeds[feedName] = new fjs.hud.MyCallsFeedModel(this);
                    break;
                case "groups":
                    this.feeds[feedName] = new fjs.hud.GroupsFeedModel(this);
                    break;
//            case "groupcontacts":
//                this.feeds[feedName] = new fjs.fdp.GroupsMembersFeedModel(this);
//                break;
                case "conferences":
                    this.feeds[feedName] = new fjs.hud.ConferenceFeedModel(this);
                    break;
                case "conferencemembers":
                    this.feeds[feedName] = new fjs.hud.ConferenceMemberFeedModel(this);
                    break;
                case "sortings":
                    this.feeds[feedName] = new fjs.hud.SortingFeedModel(this);
                    break;
                case "voicemailbox":
                    this.feeds[feedName] = new fjs.hud.VoicemailMessageFeedModel(this);
                    break;
                case "widget_history":
                    this.feeds[feedName] = new fjs.hud.WidgetHistoryFeedModel(this);
                    break;
                case "streamevent":
                    this.feeds[feedName] = new fjs.hud.StreamEventFeedModel(this);
                    break;
                 case "queues":
                    this.feeds[feedName] = new fjs.hud.QueueFeedModel(this);
                    break;
                default:
                    this.feeds[feedName] = new fjs.hud.FeedModel(feedName, this);
            }
        }
        return this.feeds[feedName];
    };

    /**
     * Sends action to FDP server
     * @param {string} feedName
     * @param {string} action
     * @param {*} data
     */
    fjs.hud.DataManager.prototype.sendAction = function (feedName, action, data) {
        this.api.sendAction(feedName, action, data);
    };
    /**
     * Adds listener on feed changes
     * @param feedName
     * @param listener
     */
    fjs.hud.DataManager.prototype.addEventListener = function (feedName, listener) {
        if(!this.listeners[feedName] || this.listeners[feedName].length == 0) {
            this.api.addSyncForFeed(feedName);
        }
        dm.super_.prototype.addEventListener.call(this, feedName, listener);
    };

    /**
     * Removes listener from feed changes
     * @param {string} feedName
     * @param {Function} listener
     */

    fjs.hud.DataManager.prototype.removeEventListener = function (feedName, listener) {
        dm.super_.prototype.removeEventListener.call(this, feedName, listener);
        if(!this.listeners[feedName] || this.listeners[feedName].length == 0) {
            this.api.removeSyncForFeed(feedName);
        }
    };

    /**
     * Forgets auth info and do logout.
     */
    fjs.hud.DataManager.prototype.logout = function () {
        this.api.logout();
    };

})();



