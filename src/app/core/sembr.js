define(['backbone', 'pouchdb', 'sembr.sync.pouch', 'marionette', 'sembr.module', 'underscore', 'handlebars'],
function (Backbone, PouchDB, PouchSync, Marionette, Module, _, Handlebars) {
    console.log('Building Sembr');

    var sembr = new Backbone.Marionette.Application({});

    function isMobile() {
        var userAgent = navigator.userAgent || navigator.vendor || window.opera;
        return ((/iPhone|iPod|iPad|Android|BlackBerry|Opera Mini|IEMobile/).test(userAgent));
    }

    //setup PouchDB to work with Backbone
    sembr.db = PouchDB('sembr');
    PouchSync.db = sembr.db;
    Backbone.sync =  PouchSync;
    Backbone.Model.prototype.idAttribute = '_id';

    sembr.addRegions({
        body: "body"
    });

    //temporary demo user!
    sembr.user = new Backbone.Model({'_id': 'sembr.es/user/andru', 'username': 'andru', 'email':'andru@sembr.es'}),


    sembr.addInitializer(function () {
        console.log('Sembr has loaded', sembr);

        //sembr.layout = sembr.submodules.Layout; //for convenience


        _(sembr.submodules).each(function(module, name){
            //bubble all module events up to the application vent
            if(module.vent){
                console.log('Module vent', module.vent);
                sembr.listenTo(module.vent, 'all', function(){
                    var args =  Array.prototype.slice.call(arguments);
                    //append the module name to the event args
                    args.push(name);
                    //console.log('Bubbling module event', args, sembr.vent.trigger.apply(Sembr, args));
                    sembr.vent.trigger.apply(sembr.vent, args);
                });
            }
        });

    });

    sembr.on("initialize:after", function(options){
        console.log('Application initialized, starting Backbone.history');
        Backbone.history.start({pushState: true});
        //temporary hack for navigate until we make a proper app router
        sembr.navigate = sembr.submodules.default.router.navigate;
    });

    sembr.mobile = isMobile();

    return sembr;
});