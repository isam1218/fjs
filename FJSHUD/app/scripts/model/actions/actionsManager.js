(function() {
    fjs.core.namespace("fjs.hud");
    var am =

        fjs.hud.ActionsManager = function (dataManager) {
            //Singleton
            if (!this.constructor.__instance)
                this.constructor.__instance = this;
            else return this.constructor.__instance;

            this.dataManager = dataManager;

            this.actions = {
                "contacts": [
                    new fjs.hud.ActionContactChat(dataManager),
                    new fjs.hud.ActionContactCallExtension(dataManager),
                    new fjs.hud.ActionContactCallMobile(dataManager),
                    new fjs.hud.ActionContactCallIntercom(dataManager),
                    new fjs.hud.ActionContactCallVoicemail(dataManager),
                    new fjs.hud.ActionContactShare(dataManager),
                    new fjs.hud.ActionContactScreenshare(dataManager),
                    new fjs.hud.ActionContactUnpin(dataManager)
                ]
            };
        };
        fjs.hud.ActionsManager.prototype.getActions = function(model) {
            var modelActions = this.actions[model.feedName] || [];
            return modelActions.filter(function(action) {
                return action.pass(model);
            });
        };
})();