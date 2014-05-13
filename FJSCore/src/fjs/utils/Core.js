(function(){
    namespace("fjs.utils");
    /**
     * @class
     */
    fjs.utils.Core = {
        /**
         * Function for asynchronous iteration by Object (map).
         * Move to the next item occurs on demand (next() function call); <br>
         * <b>Example:</b><br>
         * <code>
         *  var map = {"a":1, "b":2}, resultStr="";<br>
         *  fjs.utils.Core.asyncForIn(map,<br>
         *  function(key, value, next) {<br>
         *  &nbsp;&nbsp;resultStr+="{key";<br>
         *  &nbsp;&nbsp;setTimeout(function(){<br>
         *  &nbsp;&nbsp;&nbsp;&nbsp;resultStr+=":"+value+"}";<br>
         *  &nbsp;&nbsp;&nbsp;&nbsp;next();<br>
         *  &nbsp;&nbsp;},100)},<br>
         *  function(){<br>
         *   &nbsp;&nbsp;console.log(resultStr)//->'{a:1}{a:2}'<br>
         *  });
         * </code>
         * @param {Object} map - Object to iterate
         * @param {function(string, Object, Function)} execute - Function to execute for each map element
         * @param {Function} doneCallback - Function to execute when iterating ended
         */
        asyncForIn: function(map, execute, doneCallback) {
            var keys = [];
            var currentKeyIndex = 0;
            function next() {
                if(currentKeyIndex===keys.length) {
                    doneCallback();
                    return;
                }
                var key = keys[currentKeyIndex];
                execute(key, map[key], next);
                currentKeyIndex++;
            }

            for(var key in map) {
                if(map.hasOwnProperty(key)) {
                    keys.push(key);
                }
            }
            next();
        }
    };
})();