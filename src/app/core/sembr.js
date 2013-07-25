define(['backbone', 'pouchdb', 'backbone.pouch', 'marionette', 'underscore', 'handlebars'],
function (Backbone, PouchDB, BackbonePouch, Marionette, _, Handlebars) {
    console.log('Building Sembr');

    var Sembr = new Backbone.Marionette.Application({});

    function isMobile() {
        var userAgent = navigator.userAgent || navigator.vendor || window.opera;
        return ((/iPhone|iPod|iPad|Android|BlackBerry|Opera Mini|IEMobile/).test(userAgent));
    }

    Sembr.addRegions({
        body: "body"
    });

    Sembr.addInitializer(function () {
        console.log('Sembr has loaded', Sembr);

        Sembr.layout = Sembr.submodules.Layout; //for convenience


        _(Sembr.submodules).each(function(module, name){
            //bubble all module events up to the application vent
            if(module.vent){
                console.log('Module vent', module.vent);
                Sembr.listenTo(module.vent, 'all', function(){
                    var args =  Array.prototype.slice.call(arguments);
                    //append the module name to the event args
                    args.push(name);
                    //console.log('Bubbling module event', args, Sembr.vent.trigger.apply(Sembr, args));
                    Sembr.vent.trigger.apply(Sembr.vent, args);
                });
            }
        });

    });

    Sembr.on("initialize:after", function(options){
        Backbone.history.start({pushState: true});
        //temporary hack for navigate until we make a proper app router
        Sembr.navigate = Sembr.submodules.Default.router.navigate;
    });

    Sembr.mobile = isMobile();

    return Sembr;
});