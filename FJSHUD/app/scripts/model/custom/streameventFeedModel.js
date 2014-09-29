fjs.core.namespace("fjs.hud");
/**
 * @param {fjs.hud.DataManager} dataManager
 * @constructor
 *@extends fjs.hud.FeedModel
 */
fjs.hud.StreamEventFeedModel = function(dataManager) {
    var context = this;
    fjs.hud.FeedModel.call(this, "streamevent", dataManager);


    var completeFn = function(data) {
        context.fireEvent('complete', data);
    };


    this.voicemailsModel = dataManager.getModel('voicemailbox');
    this.callLogModel = dataManager.getModel('calllog');
    this.voicemailsModel.addEventListener('push', function(event) {
        var duration = new Date(event.entry.duration);
        var secs = duration.getSeconds()+"";
        var minutes = duration.getMinutes()+"";
        var _dur = (minutes.length == 1 ? '0'+minutes : minutes) + ':'
            + (secs.length == 1 ? '0'+secs : secs);
        context.onEntryChange({xpid:'vm_'+event.xpid, entry:{
            from:'contacts:'+event.entry.contactId,
            context:'contacts:'+event.entry.contactId,
            message:'Voicemail duration: '+_dur,
            created:event.entry.date,
            type:'voicemail'
        }});
    });
    this.callLogModel.addEventListener('push', function(event) {
        if(event.xpid[0] =='0') {
            var duration = new Date(event.entry.duration);
            var secs = duration.getSeconds() + "";
            var minutes = duration.getMinutes() + "";
            var _dur = (minutes.length == 1 ? '0' + minutes : minutes) + ':'
                + (secs.length == 1 ? '0' + secs : secs);
            var type = (event.entry.missed ? 'Missed' : (event.entry.incoming ? 'Incoming' : 'Outbound'));

            context.onEntryChange({
                xpid: 'vm_' + event.xpid, entry: {
                    from: 'contacts:' + event.entry.contactId,
                    context: 'contacts:' + event.entry.contactId,
                    message: type + ' call duration: ' + _dur,
                    created: event.entry.startedAt,
                    type: 'call',
                    callType: type
                }
            });
        }
    });


    this.voicemailsModel.addEventListener('complete', completeFn);
    this.callLogModel.addEventListener('complete', completeFn);


};
fjs.core.inherits(fjs.hud.StreamEventFeedModel, fjs.hud.FeedModel);

fjs.hud.StreamEventFeedModel.prototype.createEntry = function(obj) {
    return new fjs.hud.StreamEventEntryModel(obj, this.dataManager);
};