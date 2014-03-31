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

		/* This is an imperfect solution, but without a rewrite of Marionette.Module it'll have
		to do...
		Marionette.Module currently provides no way of checking for the existence of a module definition
		via a module name string without automatically creating it if it does not exist...
		So, for now dependencies can only be siblings (that is, other modules defined as submodules of the this.app
		object... dependency checking doesn't function for nested modules until I can find a way to check
		for their existence)
		*/
		this.startWithParent = false;
		this.dependencies = [];

	}
	//copy over all static methods and properties
	_.extend(Marionette.Module, MarionetteModule);
	//copy over the old Marionette.Module prototype
	_.extend(Marionette.Module.prototype, MarionetteModule.prototype);
	
	_.extend(Marionette.Module.prototype, {

		constructor: Marionette.Module,

		//create a convenience reference to the old start method
		_start: Marionette.Module.prototype.start,
		start: function(){

			//an array of promises returned by module dependencies
			var dependencyPromises = [];

			//start module dependencies first
			if( this.dependencies.length ){
				
				_( this.dependencies ).each( function( moduleName ){
					//only start it if it's already defined and hasn't already been initialized
					if(this.app.submodules[moduleName] && !this.app.submodules[moduleName]._isInitialized){
	          this.app.log('Module %o is a dependency of module %o but is not initialized. Lazy initializing...', moduleName, this.name);
	          //start the dependency
	          this.app.submodules[moduleName].start();
	          //add the module promise to the stack
	          dependencyPromises.push( this.app.submodules[moduleName].done );
					}
				}, this);

				//when all module dependencies are resolved, start this module
				$.when.apply( this, dependencyPromises )

					.done( function(){
						this.app.log('All module dependencies loaded for %o. Starting.', this.name);
	          this._start.apply(this, arguments);
					}.bind(this))

					.fail( function(){
						this.app.error('Module initialization failed.');
					}.bind(this))
				;

			}else{
				//no dependencies, so just start the module
				this._start.apply(this, arguments);
			}
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