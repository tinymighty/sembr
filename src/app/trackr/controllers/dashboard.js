/*var Backbone = require('backbone'),
		Marionette = require('marionette'),
		Layout = require('view/plantings/layout'),
		Collection = require('../collections/plantings');*/
define(['sembr', 'sembr.controller', 'backbone', 'backbone.collectionbinder','marionette', 
	'trackr/views/layout', 'trackr/views/dashboard/dashboard',
	"components/loader/loader"],
function (sembr, Controller, Backbone, CB, Marionette, 
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
			sembr.log('beforeModuleRoute... places...', sembr.trackr.places);
			sembr.base.layout.setContent( this.layout );
			//this.layout.sidebar.show( new Sidebar({collection: this.collection}) );
		},

		dashboard: function(){
			//show loading view until places have been fetched
			this.layout.main.show( this.loader );

			//@todo: restrict to plantings based on criteria
			plantings = new sembr.trackr.collections.Plantings();
			plantings
				.fetchWhere({user: sembr.user.get("_id")})
				.fail(function(err){
					console.error(err);
				})
				.done(function(plantings){
					sembr.log('Loaded plantings. Showing dashboard view.');
					this.layout.main.show( new DashboardView({places: this.places, plantings: plantings}) );
				}.bind(this));

		}


	});

	return DashboardController;
});