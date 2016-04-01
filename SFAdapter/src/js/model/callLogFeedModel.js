namespace('fjs.model');

fjs.model.ClientCallLogFeedModel = function(dataManager) {
    fjs.model.FeedModel.call(this, "clientcalllog", dataManager);
};
fjs.model.ClientCallLogFeedModel.extend(fjs.model.FeedModel);
