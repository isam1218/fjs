/**
 * Implements event target logic. <br>
 * Inherited class can fire events and have listeners for them.
 * @constructor
 * @abstract
 */
fjs.EventsSource = function() {
    /**
     * @type {Object}
     */
    this.listeners = {};
};

/**
 * Adds event listener
 * @param {string} eventType Event type
 * @param {Function} handler Method to execute when event happens
 */
fjs.EventsSource.prototype.addEventListener = function (eventType, handler) {
    var _listeners = this.listeners[eventType];
    if(!_listeners) {
        _listeners = this.listeners[eventType] = [];
    }
    if (_listeners.indexOf(handler) < 0) {
        _listeners.push(handler);
    }
    else {
        console.warn("Trying to add same listener");
    }
};


/**
 * Removes event listener
 * @param {string} eventType Event type
 * @param {Function} handler Method to execute when event happens
 */
fjs.EventsSource.prototype.removeEventListener = function (eventType, handler) {
    var _listeners = this.listeners[eventType], index;
    if (_listeners && (index= _listeners.indexOf(handler)) > -1) {
        _listeners.splice(index, 1);
    }
    else {
        console.warn("Trying to remove not existed listener");
    }
};

/**
 * Sends event to listeners
 * @param {string} eventType Event type
 * @param {Object} eventData Event object
 * @protected
 */
fjs.EventsSource.prototype.fireEvent = function (eventType, eventData) {
    var _listeners = this.listeners[eventType];
    if(_listeners) {
        var clonedListeners = _listeners.slice(0);
        for (var i = 0; i < clonedListeners.length; i++) {
            if(_listeners.indexOf(clonedListeners[i])>-1) {
                clonedListeners[i](eventData);
            }
        }
    }
};

