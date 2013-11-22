define(['jquery', 'backbone', 'marionette', 'sembr.promises', 'sembr.mixins.readypromise'], function($, Backbone, Marionette, Promises, ReadyPromise){
	
	MarionetteModule = Marionette.Module;

	//create new Marionette constructor
	Marionette.Module = function(name, app){

		this.on('start', this._runInitializerPromises.bind(this));
		this.name = name;
		this.vent = new Backbone.Wreqr.EventAggregator();

		//by default, do not start module with the application

		_(this).extend( new ReadyPromise() );

		MarionetteModule.apply(this, arguments);

		this.startWithParent = false;

	}
	//copy over all static methods and properties
	_.extend(Marionette.Module, MarionetteModule);

	_.extend(Marionette.Module.prototype, MarionetteModule.prototype);

	_.extend(Marionette.Module.prototype, {

		constructor: Marionette.Module,

		addRouter: function(router){
			this.router = router;
			this.navigate = router.navigate; //convenience method
			this.listenTo(router, 'route', function( route, params){
          sembr.log('Route event received by module, bubbling:', route, this, params);
          this.vent.trigger('route', route, this.moduleName, params);
	    }.bind(this));
		},

	  // Run initializerPromises on start
	  _runInitializerPromises: function(options){
	  	//sembr.log("Running initializer promises", this._initializerPromises);
	  	this._initializerPromises.run(options, this)
	    	.fail(function(err){
	    		this._deferReady.reject(err);
	    	}.bind(this))
	    	.always(function(){
	    		this._deferReady.resolve();
		    }.bind(this));	
	  },


	  /* Override method to add initializer Promises */
	  __setupInitializersAndFinalizers: Marionette.Module.prototype._setupInitializersAndFinalizers,
	  _setupInitializersAndFinalizers: function(){
	  	this.__setupInitializersAndFinalizers.apply(this, arguments);
	    this._initializerPromises = new Promises();
	  },

	  addAsyncInitializer: function(callback){
	  	this._initializerPromises.add(callback);
	  	//sembr.log('Adding AsyncInitializer', this._initializerPromises);

	  }

	});




	return Marionette.Module;
});