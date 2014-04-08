/**
 * Created with JetBrains WebStorm.
 * User: ddyachenko
 * Date: 27.08.13
 * Time: 12:34
 * To change this template use File | Settings | File Templates.
 */

namespace("fjs.utils");
fjs.utils.TimeSync = function() {
    if (!fjs.utils.TimeSync.__instance)
        fjs.utils.TimeSync.__instance = this;
    else return fjs.utils.TimeSync.__instance;
    this.fdpTimestamp = 0;
};

fjs.utils.TimeSync.prototype.setTimestamp = function(time) {
    var intTime = parseInt(time);
    this.fdpTimestamp = (new Date()).getTime() - intTime;
    var date = new Date(this.fdpTimestamp);
};

fjs.utils.TimeSync.prototype.getDefault = function() {
    return this.fdpTimestamp;
};