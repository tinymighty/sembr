define(['sembr', 'backbone', 'marionette', 'default/router'], 
function(sembr, Backbone, Marionette, Router){

/* Primary module */
var defaultModule = sembr.module("default", function(module){

  module.addInitializer(function(){
    console.log('Dashboard module has been initialized');
  });

  module.vent = new Backbone.Wreqr.EventAggregator();
  module.router = new Router({ module: module });
  //bubble router events (adding a module parameter)
  module.vent.listenTo( module.router, 'all', module.vent.trigger);

  module.navigate = module.router.navigate; //for convenience...


});


return defaultModule;

});