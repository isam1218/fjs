fjs.utils.LocalStorage = function() {

};
fjs.utils.LocalStorage.check = function() {
    if(typeof self.localStorage === "undefined") return false;
        var test = 'test', val = null;
        try {
            localStorage.setItem(test, test);
            val = localStorage.getItem(test);
            localStorage.removeItem(test);
            return !!val;
        } catch(e) {
            return false;
        }
};
