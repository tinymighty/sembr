define(['backbone', 'jquery', 'pouchdb',  'marionette', 'sembr.module', 'underscore', 'handlebars', 
	'sembr.error', 'sembr.sync.pouch', 'sembr.mixins.readypromise'],
function (Backbone, $, PouchDB, Marionette, Module, _, Handlebars, 
	Error, PouchSync, ReadyPromise) {

	Backbone.Model.prototype.idAttribute = '_id';

	var sembr = new Backbone.Marionette.Application();
	sembr.error = Error;
	sembr.isMobile = function() {
		var userAgent = navigator.userAgent || navigator.vendor || window.opera;
		return ((/iPhone|iPod|iPad|Android|BlackBerry|Opera Mini|IEMobile/).test(userAgent));
	}
	//mixin readypromise properties...
	_(sembr).extend( new ReadyPromise() );


	sembr.addInitializer(function(options){
		//setup logging...
		sembr.log = (options.log && console) ? console.log : function(){};

		//check for mobile user agents...
		sembr.mobile = sembr.isMobile();

		//setup PouchDB adapter as the default sync method
		sembr.db = PouchDB('sembr');
		PouchSync.db = sembr.db;
		Backbone.sync =  PouchSync;
	});

	sembr.addInitializer(function(){
		sembr.user = new Backbone.Model({'_id': 'sembr.es/user/andru', 'username': 'andru', 'email':'andru@sembr.es'});
	});

	sembr.addRegions({
		body: "body"
	});

	//temporary demo user!




	sembr.addInitializer(function (options) {
		console.log('Sembr has loaded', sembr);

		//sembr.layout = sembr.submodules.Layout; //for convenience

		_(sembr.submodules).each(function(module, name){
			//bubble all module events up to the application vent
			module.on('start', function(){
				if(module.vent){
					sembr.log('Module vent', module.vent);
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

		if(options.log){
			sembr.vent.on('all', function(){
				console.log("Application Event:", arguments);
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
		console.log('Application initialized, starting Backbone.history');
		Backbone.history.start({pushState: true});
		//temporary hack for navigate until we make a proper app router
		sembr.navigate = sembr.submodules.default.router.navigate;
	});

	return sembr;
});