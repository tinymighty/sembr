/*var Backbone = require('backbone'),
		Marionette = require('marionette'),
		Layout = require('view/plantings/layout'),
		Collection = require('../collections/plantings');*/
define(['sembr', 'sembr.controller', 'backbone','marionette',
	'trackr/views/layout', 'trackr/views/dashboard/dashboard',
	"components/loader/loader"],
function (sembr, Controller, Backbone, Marionette,
	Layout, DashboardView,
	LoaderView) {
	var DashboardController = Controller.extend({

		initialize:function (options) {
				this.layout = new Layout();
				this.loader  = new LoaderView();

				sembr.log('Dashboard controller initializing');
		},

		beforeModuleRoute: function(){
			sembr.log('Controller ID', this.id);
			//sembr.log('Setting plantings layout!');
			sembr.log(sembr);
			this.places = sembr.trackr.places;
			this.plants = sembr.trackr.plants;
			sembr.log('beforeModuleRoute... places...', sembr.trackr.places);
			sembr.base.setContent( this.layout );
			//this.layout.sidebar.show( new Sidebar({collection: this.collection}) );
		},

		dashboard: function(){
			//show loading view until places have been fetched
			this.layout.main.show( this.loader );

			//@todo: restrict to plantings based on criteria
			plantings = new sembr.trackr.collections.Plantings();
			plantings
				.fetch()
				.fail(function(err){
					sembr.log('Faled to load plantings.');
					sembr.showError('Failed to load user plantings.');
				})
				.done(function( plantings ){
					sembr.log('Loaded plantings. Showing dashboard view.');
					this.layout.main.show( new DashboardView({collections: {places: this.places, plants: this.plants, plantings: plantings}}) );
				}.bind(this));

		}


	});

	return DashboardController;
});
