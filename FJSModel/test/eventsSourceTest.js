describe("eventSource", function() {
    it("AddEventListener", function () {
        var eventSource = new fjs.model.EventsSource();
        eventSource.addEventListener('event1', function(){});
        expect(1).toBe(eventSource.listeners['event1'].length);
        var listener = function(){};
        eventSource.addEventListener('event1', listener);
        eventSource.addEventListener('event2', listener);
        eventSource.addEventListener('event2', listener);
        expect(2).toBe(eventSource.listeners['event1'].length);
        expect(1).toBe(eventSource.listeners['event2'].length);
    });
    it("removeEventListener", function () {
        var eventSource = new fjs.model.EventsSource();
        var listener1 = function(){};
        var listener2 = function(){};
        eventSource.addEventListener('event1', listener1);
        eventSource.addEventListener('event1', listener2);
        expect(2).toBe(eventSource.listeners['event1'].length);
        eventSource.removeEventListener('event1', listener1);
        expect(1).toBe(eventSource.listeners['event1'].length);
        eventSource.removeEventListener('event1', listener2);
        expect(0).toBe(eventSource.listeners['event1'].length);
    });
    it("fireEvent", function () {
        var eventSource = new fjs.model.EventsSource();
        var listener1CallsCount = 0;
        var listener2CallsCount = 0;

        var listener1 = function(){listener1CallsCount++};
        var listener2 = function(){listener2CallsCount++};
        eventSource.addEventListener('event1', listener1);
        eventSource.addEventListener('event1', listener2);
        eventSource['fireEvent']('event1', null);
        expect(1).toBe(listener1CallsCount);
        expect(1).toBe(listener2CallsCount);
        eventSource.addEventListener('event2', listener1);
        eventSource['fireEvent']('event2', null);
        expect(2).toBe(listener1CallsCount);
        eventSource.removeEventListener('event1', listener1);
        eventSource['fireEvent']('event1', null);
        expect(2).toBe(listener1CallsCount);
        expect(2).toBe(listener2CallsCount);
        eventSource.removeEventListener('event1', listener2);
        eventSource.removeEventListener('event2', listener1);
        eventSource['fireEvent']('event1', null);
        eventSource['fireEvent']('event2', null);
        expect(2).toBe(listener1CallsCount);
        expect(2).toBe(listener2CallsCount);
    });

    it("fireEventWithRemove", function() {
        var eventSource = new fjs.model.EventsSource();
        var listener1CallsCount = 0;
        var listener2CallsCount = 0;

        var listener1 = function(){
            listener1CallsCount++;
            eventSource.removeEventListener('event1', listener1);
        };

        var listener2 = function(){
            listener2CallsCount++;
            eventSource.removeEventListener('event1', listener2);
        };
        eventSource.addEventListener('event1', listener1);
        eventSource.addEventListener('event1', listener2);
        eventSource.fireEvent('event1', null);
        expect(1).toBe(listener1CallsCount);
        expect(1).toBe(listener2CallsCount);
    });
});