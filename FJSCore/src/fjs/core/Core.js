(function(){
    if(typeof(self['fjs']) === 'undefined') {
        self['fjs'] = {};
    }
    /**
     * @class
     */
    fjs.core = {
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
            var keys = [], currentKeyIndex = 0;
            function next() {
                if(currentKeyIndex===keys.length) {
                    doneCallback();
                    return;
                }
                var key = keys[currentKeyIndex];
                currentKeyIndex++;
                execute(key, map[key], next);
            }
            var _keys = Object.keys(map);
            for(var i=0; i<_keys.length; i++) {
                var key = _keys[i];
                keys.push(key);
            }
            next();
       }
       /**
       * Function of inheritance
       * @param {Function} ctor - 'Class' constructor
       * @param {Function} superCtor - Parent 'class' constructor
       */
       , inherits:function(ctor, superCtor) {
           ctor.super_ = superCtor;
           ctor.prototype = Object.create(superCtor.prototype, {
               constructor: {
                   value: ctor,
                   enumerable: false,
                   writable: true,
                   configurable: true
               }
           });
       }
      /**
       * Extends constructor
       * @param ctor - Extendable constructor
       * @param superCtor - Extending constructor
       */
        , extend: function(ctor, superCtor) {
            var keys = Object.keys(superCtor.prototype);
            var i = keys.length;
            while (i--) {
                if(!ctor.prototype[keys[i]])
                ctor.prototype[keys[i]] = superCtor.prototype[keys[i]];
            }
            if(!ctor.exts_) {
                ctor.exts_ = {};
            }
            ctor.exts_[superCtor.prototype['__class_name']] = superCtor.prototype;
        }

      /**
       * Creates and returns namespace
       * @param {string} ns_name - Namespace name
       * @returns {Object}
       */
        , namespace: function(ns_name) {
            var parts = ns_name.split(".");
            var ns = self[parts[0]] = self[parts[0]] || {};
            for ( var i = 1; i < parts.length; i++) {
                var p = parts[i];
                ns = ns[p] = ns[p] || {};
            }
            return ns;
        }
    };
})();
