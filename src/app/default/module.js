define(['sembr', 'backbone', 'marionette',  
'default/controllers/dashboard',
'default/router'], 
function(sembr, Backbone, Marionette, 
DashboardController,
Router){
"use strict";
/* Primary module */
var defaultModule = sembr.module("default", function(module){

  module.addInitializer(function(){
    sembr.log('Default module has been initialized');
  });

  module.vent = new Backbone.Wreqr.EventAggregator();
  module.router = new Router({ module: module });
  //bubble router events (adding a module parameter)
  module.vent.listenTo( module.router, 'all', module.vent.trigger);

  module.isDependentOn('base');

  module.navigate = module.router.navigate; //for convenience...

  module.controllers = {
  	Dashboard: DashboardController
  }
});


return defaultModule;

});