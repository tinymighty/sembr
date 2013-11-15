define(['backbone', 'pouchdb', 'sembr.sync.pouch', 'marionette', 'sembr.module', 'underscore', 'handlebars'],
function (Backbone, PouchDB, PouchSync, Marionette, Module, _, Handlebars) {
    console.log('Building Sembr');

    var Sembr = new Backbone.Marionette.Application({});

    function isMobile() {
        var userAgent = navigator.userAgent || navigator.vendor || window.opera;
        return ((/iPhone|iPod|iPad|Android|BlackBerry|Opera Mini|IEMobile/).test(userAgent));
    }

    //setup PouchDB to work with Backbone
    Sembr.db = PouchDB('sembr');
    PouchSync.db = Sembr.db;
    Backbone.sync =  PouchSync;
    Backbone.Model.prototype.idAttribute = '_id';

    Sembr.addRegions({
        body: "body"
    });

    //temporary demo user!
    Sembr.user = new Backbone.Model({'_id': 'sembr.es/user/andru', 'username': 'andru', 'email':'andru@sembr.es'}),


    Sembr.addInitializer(function () {
        console.log('Sembr has loaded', Sembr);

        //Sembr.layout = Sembr.submodules.Layout; //for convenience


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
        console.log('Application initialized, starting Backbone.history');
        Backbone.history.start({pushState: true});
        //temporary hack for navigate until we make a proper app router
        Sembr.navigate = Sembr.submodules.default.router.navigate;
    });

    Sembr.mobile = isMobile();

    return Sembr;
});