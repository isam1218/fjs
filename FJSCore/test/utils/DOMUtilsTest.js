describe("DOMUtils", function () {
    it("addClass", function () {
        var el = document.createElement('div');
        fjs.utils.DOM.addClass(el, 'class1');
        expect(true).toBe(/class1/.test(el.className));
        fjs.utils.DOM.addClass(el, 'class2');
        expect(true).toBe(/class2/.test(el.className));
        expect(1).toBe(/class2/g.exec(el.className).length);
    });
    it("removeClass", function() {
        var el = document.createElement('div');
        fjs.utils.DOM.addClass(el, 'class1');
        expect(true).toBe(/class1/.test(el.className));
        fjs.utils.DOM.removeClass(el, 'class1');
        expect(false).toBe(/class1/.test(el.className));
        expect("").toBe(el.className);
        fjs.utils.DOM.addClass(el, 'class1');
        fjs.utils.DOM.addClass(el, 'class2');
        expect(true).toBe(/class1/.test(el.className));
        expect(true).toBe(/class2/.test(el.className));
        fjs.utils.DOM.removeClass(el, 'class1');
        expect(false).toBe(/class1/.test(el.className));
        expect("class2").toBe(el.className);
    });

    it("hasClass", function(){
        var el = document.createElement('div');
        fjs.utils.DOM.addClass(el, 'class1');
        expect(true).toBe(fjs.utils.DOM.hasClass(el, 'class1'));
        expect(false).toBe(fjs.utils.DOM.hasClass(el, 'class2'));
        fjs.utils.DOM.addClass(el, 'class2');
        expect(true).toBe(fjs.utils.DOM.hasClass(el, 'class2'));
    });

    it("hasClass", function(){
        var el = document.createElement('div');
        fjs.utils.DOM.addClass(el, 'class1');
        expect(true).toBe(fjs.utils.DOM.hasClass(el, 'class1'));
        expect(false).toBe(fjs.utils.DOM.hasClass(el, 'class2'));
        fjs.utils.DOM.addClass(el, 'class2');
        expect(true).toBe(fjs.utils.DOM.hasClass(el, 'class2'));
    });

    it("toggleClass", function(){
        var el = document.createElement('div');
        expect(false).toBe(fjs.utils.DOM.hasClass(el, 'class1'));
        fjs.utils.DOM.toggleClass(el, 'class1');
        expect(true).toBe(fjs.utils.DOM.hasClass(el, 'class1'));
        fjs.utils.DOM.toggleClass(el, 'class1');
        expect(false).toBe(fjs.utils.DOM.hasClass(el, 'class1'));
        fjs.utils.DOM.toggleClass(el, 'class1');
        expect(true).toBe(fjs.utils.DOM.hasClass(el, 'class1'));
    });
    it("addEventListener", function(){
        var el = document.createElement('div'), doneFlag;
        document.body.appendChild(el);
        runs(function () {
            fjs.utils.DOM.addEventListener(el, 'click', function () {
                doneFlag = true;
            });
            if(el.click) {
                el.click();
            }
            else {
                var event  = fjs.utils.DOM.createEvent("MouseEvents", "click");
                fjs.utils.DOM.dispatchEvent(el, event);
            }
        });

        waitsFor(function () {
            return doneFlag;
        }, "Flag should be set", 5000);

        runs(function () {
            expect(true).toBe(doneFlag);
        });
    });

    it("removeEventListener", function(){
        var el = document.createElement('div'), doneFlag, timeoutId;
        document.body.appendChild(el);
        runs(function () {
            var callback = function () {
                clearTimeout(timeoutId);
            };
            fjs.utils.DOM.addEventListener(el, 'click', callback);
            fjs.utils.DOM.removeEventListener(el, 'click', callback);
            timeoutId = setTimeout(function() {
                doneFlag = true;
            }, 500);
            if(el.click) {
                el.click();
            }
            else {
                var event  = fjs.utils.DOM.createEvent("MouseEvents", "click");
                fjs.utils.DOM.dispatchEvent(el, event);
            }
        });

        waitsFor(function () {
            return doneFlag;
        }, "Flag should be set", 5000);

        runs(function () {
            expect(true).toBe(doneFlag);
        });
    });

    it("dispatchEvent", function(){
        var doneFlag;
        runs(function () {
           document.body.onclick = function(){
               doneFlag = true;
           };
            var event  = fjs.utils.DOM.createEvent("MouseEvents", "click");
            fjs.utils.DOM.dispatchEvent(document.body, event);
        });

        waitsFor(function () {
            return doneFlag;
        }, "Flag should be set", 5000);

        runs(function () {
            expect(true).toBe(doneFlag);
        });
    });

});