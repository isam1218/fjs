(function() {
    var _Console =
    /**
     * Utils class for console. Resolves browser specific console problems.
     * @constructor
     */
    fjs.utils.Console = function() {};

    /**
     * Writes log message to console
     */
    _Console.log = function() {
        if(console) {
            if(console.log.apply) {
                console.log.apply(console, arguments);
            }
            else {
                var log = Function.prototype.bind.call(console.log, console);
                log.apply(console, arguments);
            }
        }
    };
    /**
     * Writes error message to console
     */
    _Console.error = function() {
        if(console) {
            if(console.error.apply) {
                console.error.apply(console, arguments);
            }
            else {
                var log = Function.prototype.bind.call(console.error, console);
                log.apply(console, arguments);
            }
        }
    };
    /**
     * Writes debug message to console
     */
    _Console.debug = function() {
        if(console) {
            if(console.debug) {
                if(console.debug.apply) {
                    console.debug.apply(console, arguments);
                }
                else {
                    var log = Function.prototype.bind.call(console.debug, console);
                    log.apply(console, arguments);
                }
            }
            else {
              _Console.log.apply(fjs.utils.Console, arguments);
            }
        }
    };
    /**
     * Writes warning message to console
     */
    _Console.warn = function() {
        if(console) {
            if(console.warn) {
                if(console.warn.apply) {
                    console.warn.apply(console, arguments);
                }
                else {
                    var log = Function.prototype.bind.call(console.warn, console);
                    log.apply(console, arguments);
                }
            }
            else {
              _Console.error.apply(fjs.utils.Console, arguments);
            }
        }
    };
    /**
     * Writes info message to console
     */
    _Console.info = function() {
        if(console) {
            if(console.info) {
                if(console.info.apply) {
                    console.info.apply(console, arguments);
                }
                else {
                    var log = Function.prototype.bind.call(console.info, console);
                    log.apply(console, arguments);
                }
            }
            else {
              _Console.log.apply(fjs.utils.Console, arguments);
            }
        }
    };
})();
