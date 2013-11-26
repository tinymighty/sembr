define(['backbone', 'jquery', 'pouchdb', 'sembr.module', 'underscore', 'handlebars', 
	'sembr.error', 'sembr.sync.pouch', 'sembr.mixins.readypromise'],
function (Backbone, $, PouchDB, Marionette, _, Handlebars, 
	Error, PouchSync, ReadyPromise) {

	Backbone.Model.prototype.idAttribute = '_id';

	var sembr = new Backbone.Marionette.Application();

	var settings = {
		container: 'body'
	}

	sembr.initModule = function(name, options){
		app_options = sembr.options[name] || {};
		options = _(options || {}).defaults(app_options);
		return this.module(name).start(options);
	}

	sembr.error = Error;
	sembr.isMobile = function() {
		var userAgent = navigator.userAgent || navigator.vendor || window.opera;
		return ((/iPhone|iPod|iPad|Android|BlackBerry|Opera Mini|IEMobile/).test(userAgent));
	}
	//mixin readypromise properties...
	_(sembr).extend( new ReadyPromise() );
	
	//sembr.log = (options.log && console) ? sembr.log : function(){};
	sembr.log = _(console.log).bind(console);

	sembr.showError = function(message){
		console.error(message);
	}

	sembr.addInitializer(function(options){
	
		//check for mobile user agents...
		sembr.mobile = sembr.isMobile();

		//setup PouchDB adapter as the default sync method
		sembr.db = PouchDB('sembr');
		PouchSync.db = sembr.db;
		Backbone.sync =  PouchSync;
	});

	sembr.on("initialize:before", function(options){
		sembr.options = _(options).defaults(settings);
		console.log('Setting container region:%o', sembr.options.container);
	  sembr.addRegions({
			container: sembr.options.container
		});
	});

	//load current user for the whole application...
	sembr.addInitializer(function(options){
		//temporary demo user!
		sembr.user = new Backbone.Model({'_id': 'sembr.es/user/andru', 'username': 'andru', 'email':'andru@sembr.es'});
	});

	sembr.addInitializer(function (options) {
		sembr.log('Sembr has loaded', sembr);

		_(sembr.submodules).each(function(module, name){
			//bubble all module events up to the application vent
			module.on('start', function(){
				if(module.vent){
					sembr.log('Module vent', module.vent);
					sembr.listenTo(module.vent, 'all', function(){
						var args =  Array.prototype.slice.call(arguments);
						//append the module name to the event args
						args.push(name);
						//sembr.log('Bubbling module event', args, sembr.vent.trigger.apply(Sembr, args));
						sembr.vent.trigger.apply(sembr.vent, args);
					});
				}
			});
		});

		if(options.log){
			sembr.vent.on('all', function(){
				sembr.log("Application Event:", arguments);
			});
		}

		//when all submodules are loaded and ready, mark the whole application as ready
		$.when.apply($, _(sembr.submodules).pluck('ready') )
			.done(function(){
				sembr._deferReady.resolve();
			})
			.fail(function(){
				//this._deferReady.reject('Failed to load a module.');
				throw Error('Failed to load a module.');
			});

	});

	sembr.on("initialize:after", function(options){
		sembr.log('Application initialized, starting Backbone.history');
		Backbone.history.start({pushState: true});
		//temporary hack for navigate until we make a proper app router
		sembr.navigate = Backbone.history.navigate.bind(Backbone.history);
	});

	return sembr;
});