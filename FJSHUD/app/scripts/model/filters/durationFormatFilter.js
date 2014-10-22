fjs.core.namespace('fjs.hud.filter');

fjs.hud.filter.DurationFormatFilter = function() {
    return function(duration) {
        var callduration = new Date(duration);
        var secs = callduration.getSeconds()+"";
        var minutes = callduration.getMinutes()+"";
        return (minutes.length == 1 ? '0'+minutes : minutes) + ':'
            + (secs.length == 1 ? '0'+secs : secs);
    };
};

