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
 * @param {HTMLElement} element - html element
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