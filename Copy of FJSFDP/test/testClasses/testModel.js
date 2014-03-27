(function(){
    namespace("fjs.fdp");
    fjs.fdp.testModel = function(field1, field2, type, id) {
        this.field1 = field1;
        this.field2 = field2;
        this.xef001type = type;
        this.xef001id = id || new fjs.utils.Increment().get("testModel")+"";
        this.xef001iver = new fjs.utils.Increment().get("testModelVersion");
    }
})();