fjs.core.namespace('fjs.hud.filter');

fjs.hud.filter.DurationFormatFilter = function() {
    return function(_duration) {
        var duration = _duration/1000;
        var hours = Math.floor(duration/3600);
        var minutes = Math.floor((duration - hours*60)/60);
        var secs = duration - (hours*60 + minutes)*60;
        var _minutes = minutes?(((minutes<10?'0':'') + minutes)):'00';
        var _secs = (secs<10?'0':'') + secs;
        return (hours?hours+':':'') + _minutes + ':'+ _secs;
    };
};