namespace("fjs.utils");
fjs.utils.Array = function(){};
fjs.utils.Array.isArray = function(obj) {
    return Array.isArray(obj) ||
        (typeof obj === 'object' && obj+"" === '[object Array]');
};