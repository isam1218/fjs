namespace("fjs.utils");
/**
 * Static class to facilitate work with DOM objects.
 * @constructor
 * @static
 */
fjs.utils.DOM = function() {

};
/**
 * Returns top and left offsets from edge of the window
 * @param {HTMLElement} element - Html element
 * @returns {{x: number, y: number}|undefined}
 */
fjs.utils.DOM.getElementOffset = function(element) {
        if(element != undefined)
        {
            var box = null;
            try {
                box = element.getBoundingClientRect();
            }
            catch(e) {
                box = {top : 0, left: 0, right: 0, bottom: 0};
            }
            var body = document.body;
            var docElem = document.documentElement;
            var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
            var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
            var clientLeft = docElem.clientLeft || body.clientLeft || 0;
            var clientTop = docElem.clientTop || body.clientTop || 0;

            var left = box.left + scrollLeft - clientLeft;
            var top = box.top +  scrollTop - clientTop;
            return {x:left, y:top};
        }
};
/**
 * Adds css class to html element
 * @param {HTMLElement} element - Element to which will be added css class
 * @param {string} className - Class name
 * @returns {HTMLElement}
 */
fjs.utils.DOM.addClass = function(element, className) {
    if(!this.hasClass(element, className)) {
        if (element.classList)
            element.classList.add(className);
        else {
            element.className = (element.className +=" "+className).trim();
        }
    }
    return element
};
/**
 * Checks if css class exist in element <a href="https://developer.mozilla.org/en-US/docs/Web/API/Element.classList">class list</a>
 * @param {HTMLElement} element - html element for check
 * @param {string} className - class name
 * @returns {boolean}
 */
fjs.utils.DOM.hasClass = function(element, className) {
    if (element.classList)
        return element.classList.contains(className);
    else
        return new RegExp('(^| )' + className + '( |$)', 'gi').test(element.className);
};

/**
* Removes css class from html element
* @param {HTMLElement} element - Element from which will be removed css class
* @param {string} className - Class name
* @returns {HTMLElement}
*/
fjs.utils.DOM.removeClass = function(element, className) {
    if (element.classList)
        element.classList.remove(className);
    else
        element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ').trim();
    return element;
};
/**
 * Adds css class to html element if it not exist in the <a href="https://developer.mozilla.org/en-US/docs/Web/API/Element.classList">class list</a> or removes if it not exist.
 * @param {HTMLElement} element HTML element
 * @param {string} className Class name
 * @returns {HTMLElement}
 */
fjs.utils.DOM.toggleClass = function(element, className) {
    if(this.hasClass(element, className)) {
        return this.removeClass(element, className);
    }
    else {
        return this.addClass(element, className);
    }
};

/**
 * Attaches event handle
 * @param {HTMLElement} element Event target element
 * @param {string} eventName A string representing the event type to listen for.
 * @param {EventListener|Function} callback The object that receives a notification when an event of the specified type occurs.
 * This must be an object implementing the EventListener interface, or simply a JavaScript function.
 */
fjs.utils.DOM.addEventListener = function(element, eventName, callback) {
    eventName = eventName == "mousewheel" ? "DOMMouseScroll" : eventName;
    if (window.addEventListener) {
        element.addEventListener(eventName, callback, false);
    } else if (document.attachEvent)  {
        if(element==window) {
            window.document.attachEvent('on' + eventName, callback);
        }
        else {
            element.attachEvent('on' + eventName, callback);
        }
    }
    if(eventName == 'DOMMouseScroll') {
        element['onmousewheel'] = callback;
    }
};

/**
 * Removes event handler
 * @param {HTMLElement} element Event target element
 * @param {string} eventName A string representing the event type to listen for.
 * @param {EventListener|Function} callback The object that receives a notification when an event of the specified type occurs.
 * This must be an object implementing the EventListener interface, or simply a JavaScript function.
 */
fjs.utils.DOM.removeEventListener = function(element, eventName, callback) {
    eventName = eventName == "mousewheel" ? "DOMMouseScroll" : eventName;
    if (window.removeEventListener) {
        element.removeEventListener(eventName, callback, false);
    }
    else if (document.detachEvent)  {
        if(element==window) {
            document.detachEvent('on' + eventName, callback);
        }
        else {
            element.detachEvent('on' + eventName, callback);
        }
    }
    if(eventName == 'DOMMouseScroll') {
        element['onmousewheel'] = null;
    }
};
/**
 * Creates an event of the type specified. The returned object should be first initialized and can then be passed to .dispatchEvent.
 * @param {string} eventTypeInterface - Is a string that represents the type of event to be created. Possible event types include "UIEvents", "MouseEvents", "MutationEvents", and "HTMLEvents"
 * @param {string} eventType - Type of event
 * @param {Object|Event} eventObj - Event options
 * @returns {Event}
 */
fjs.utils.DOM.createEvent = function(eventTypeInterface, eventType, eventObj) {
    if(document.createEvent){
        var e = document.createEvent(eventTypeInterface);
        switch(eventTypeInterface) {
            case "MouseEvents":
                e.initMouseEvent(eventType, true, true, window,
                    1, 0, 0,
                    0,0,
                    false,false,false,false,0,null);
                break;
            case "UIEvents":
                e.initUIEvent(eventType, true, true, window, 1);
                break;
            case "HTMLEvents":
                e.initEvent(eventType, false, true);
                break;
            default:
                e.initEvent(eventType, true, true);
        }

        if(eventObj) {
            for (var i in eventObj) {
                if(eventObj.hasOwnProperty(i)) {
                    e[i] = eventObj[i];
                }
            }
        }
        return e;
    }
    else {
        if(!eventObj) {
            eventObj = {
                type: eventType
            }
        }
        return document.createEventObject(eventObj);
    }
};

/**
 * Dispatches an Event at the specified EventTarget, invoking the affected EventListeners in the appropriate order.<br/>
 * The normal event processing rules (including the capturing and optional bubbling phase) apply to events dispatched manually with dispatchEvent()
 * @param {HTMLElement} element Event target
 * @param {Event} event Is the Event object to be dispatched.
 */
fjs.utils.DOM.dispatchEvent = function(element, event) {
    if(document.createEvent){
        element.dispatchEvent(event);
    }
    else {
        element.fireEvent('on'+event.type, event);
    }
};