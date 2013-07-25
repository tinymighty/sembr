define(['sembr', 'backbone', 'marionette', './router.js'], 
function(Sembr, Backbone, Marionette, Router){

var Trackr = Sembr.module("Trackr", function(module){

  module.addInitializer(function(){
    console.log('Tracker module has been initialized');
  });
  module.router = new Router({ module: module });
	module.navigate = module.router.navigate; //for convenience...

  module.vent = new Backbone.Wreqr.EventAggregator();

  //bubble router events (adding a module parameter)
  module.vent.listenTo( module.router, 'all', module.vent.trigger);
});

return Trackr;

});