/**
 * Created with JetBrains WebStorm.
 * User: ddyachenko
 * Date: 27.08.13
 * Time: 12:34
 * To change this template use File | Settings | File Templates.
 */

namespace("fjs");
fjs.TimeSync = function() {
    if (!fjs.TimeSync.__instance)
        fjs.TimeSync.__instance = this;
    else return fjs.TimeSync.__instance;
    this.fdpTimestamp = 0;
};

fjs.TimeSync.prototype.setTimestamp = function(time) {
    var intTime = parseInt(time);
    this.fdpTimestamp = (new Date()).getTime() - intTime;
    var date = new Date(this.fdpTimestamp);
};

fjs.TimeSync.prototype.getDefault = function() {
    return this.fdpTimestamp;
};