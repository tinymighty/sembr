define(['backbone', 'marionette'], function(Backbone, Marionette){
	Marionette.Module.extend = Marionette.extend;

	var Module = Marionette.Module.extend({
		addRouter: function(router){
			this.router = router;
			this.listenTo(router, 'route', function(){});
			this.listenTo(module, 'route', function( route, params){
          console.log('Dispatching route event to app vent', route, module, params);
          this.vent.trigger('route', route, module, params);
      });
		}
	});
	this.vent = new Backbone.Wreqr.EventAggregator();

	Module.addInitializer(function(options){
    
  });

	Module.extend = Marionette.extend;

	return Module;
});