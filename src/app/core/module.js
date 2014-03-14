define(['sembr', 'jquery', 'backbone', 'marionette', 'sembr.promises', 'sembr.mixins.readypromise'], 
function(sembr, $, Backbone, Marionette, Promises, ReadyPromise){
  "use strict";
	var MarionetteModule = Marionette.Module;

	//create new Marionette constructor
	Marionette.Module = function(name, app){

		this.on('start', this._runInitializerPromises.bind(this));
		this.name = name;
		this.vent = new Backbone.Wreqr.EventAggregator();

		//by default, do not start module with the application

		_(this).extend( new ReadyPromise() );

		MarionetteModule.apply(this, arguments);

		this.startWithParent = false;

		/* This is an imperfect solution, but without a rewrite of Marionette.Module it'll have
		to do...
		Marionette.Module currently provides no way of checking for the existence of a module definition
		via a module name string without automatically creating it if it does not exist...

		So, for now dependencies can only be siblings (that is, other modules defined as submodules of the this.app
		object.

		Additionally, there is currently 
		*/
		this.dependencies = [];

	}
	//copy over all static methods and properties
	_.extend(Marionette.Module, MarionetteModule);

	_.extend(Marionette.Module.prototype, MarionetteModule.prototype);

	_.extend(Marionette.Module.prototype, {

		constructor: Marionette.Module,
		_start: Marionette.Module.prototype.start,
		start: function(){

			//start any dependent modules first
			if(this.dependencies){
				_(this.dependencies).each(function(moduleName){
					if(this.app.submodules[moduleName] && !this.app.submodules[moduleName]._isInitialized){
	          this.app.log('Module %o is a dependency of module %o but is not initialized. Lazy initializing...', moduleName, this.name);
	          this.app.module(moduleName).start();
					}
				}.bind(this));
			}

			this._start.apply(this, arguments);
		},

		isDependentOn: function(moduleName){
			this.dependencies.push(moduleName);
		},

		addRouter: function(router){
			this.router = router;
			this.navigate = router.navigate; //convenience method
			this.listenTo(router, 'route', function( name, params){
          this.vent.trigger('route', name, params);
	    }.bind(this));
		},

	  // Run initializerPromises on start
	  _runInitializerPromises: function(options){
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

	  }

	});

	return Marionette.Module;
});