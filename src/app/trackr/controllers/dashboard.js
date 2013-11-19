/*var Backbone = require('backbone'),
		Marionette = require('marionette'),
		Layout = require('view/plantings/layout'),
		Collection = require('../collections/plantings');*/
define(['sembr', 'sembr.controller', 'backbone', 'backbone.collectionbinder','marionette', 
	'trackr/views/layout', 'trackr/views/dashboard/dashboard',
	'trackr/collections/places', 'trackr/collections/plantings',
	"components/loader/loader"],
function (sembr, Controller, Backbone, CB, Marionette, 
	Layout, DashboardView,
	Places, Plantings,
	LoaderView) {
	var DashboardController = Controller.extend({

		initialize:function (options) {
				this.layout = new Layout();
				this.loader  = new LoaderView();

				console.log('Dashboard controller initializing');
		},

		beforeModuleRoute: function(){
			console.log('Controller ID', this.id);
			//console.log('Setting plantings layout!');
			console.log(sembr);
			this.places = sembr.trackr.places;
			console.log('beforeModuleRoute... places...', sembr.trackr.places);
			sembr.base.layout.setContent( this.layout );
			//this.layout.sidebar.show( new Sidebar({collection: this.collection}) );
		},

		dashboard: function(){
			//show loading view until places have been fetched
			this.layout.main.show( this.loader );

			//@todo: restrict to plantings based on criteria
			plantings = new Plantings();
			plantings
				.fetchWhere({user: sembr.user.get("_id")})
				.fail(function(err){
					console.error(err);
				})
				.done(function(plantings){
					console.log('Loaded plantings. Showing dashboard view.');
					this.layout.main.show( new DashboardView({places: this.places, plantings: plantings}) );
				}.bind(this));

		}


	});

	return DashboardController;
});