define(['backbone', 'jquery', 'sembr.module', 'underscore', 'ractive', 'ractive.backbone', 'moment',
	'sembr.error', 'sembr.hoodup', 'sembr.mixins.readypromise'],
function (Backbone, $, Marionette, _, Ractive, Rb, moment,
	Error, Hoodup, ReadyPromise) {

	"use strict";

	var sembr = new Backbone.Marionette.Application();


	Hoodup.connect().attach();
	//dev convenience for testing...
	sembr.hoodup = Hoodup;
	//sembr.hoodie = Hoodup.hoo
	Hoodup.hoodie.account.signIn('andru', 'andru');

	var settings = {
		container: 'body'
	}

	//we should set this to user locale
	moment.lang('en-GB'); 

	sembr.initModule = function(name, options){
		var app_options = sembr.options[name] || {};
		options = _(options || {}).defaults(app_options);
		return this.module(name).start(options);
	}

	sembr.error = Error;
	sembr.isMobile = function() {
		var userAgent = navigator.userAgent || navigator.vendor || window.opera;
		return ((/iPhone|iPod|iPad|Android|BlackBerry|Opera Mini|IEMobile/).test(userAgent));
	}
	//mixin readypromise properties...
	_.extend( sembr, new ReadyPromise() );

	//sembr.log = (options.log && console) ? sembr.log : function(){};
	sembr.log = _(console.log).bind(console);

	sembr.showError = function(message){
		console.error(message);
	}

	sembr.addInitializer(function(options){
		//check for mobile user agents...
		sembr.mobile = sembr.isMobile();
	});

	sembr.on("initialize:before", function(options){
		sembr.options = _(options).defaults(settings);
		console.log('Setting container region:%o', sembr.options.container);
	  sembr.addRegions({
			container: sembr.options.container
		});
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
