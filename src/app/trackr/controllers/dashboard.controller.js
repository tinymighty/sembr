/*var Backbone = require('backbone'),
		Marionette = require('marionette'),
		Layout = require('view/plantings/layout'),
		Collection = require('../collections/plantings');*/
define(['sembr', 'sembr.controller', 'backbone', 'backbone.collectionbinder','marionette', 
	'../views/layout.js', '../views/dashboard/dashboard.js',
	"components/loader/loader"],
function (Sembr, Controller, Backbone, CB, Marionette, 
	Layout, DashboardView,
	LoaderView) {
	var DashboardController = Controller.extend({

		initialize:function (options) {
				this.layout = new Layout();
		},

		beforeModuleRoute: function(){
			console.log('Controller ID', this.id);
			//console.log('Setting plantings layout!');
			Sembr.layout.setContent( this.layout );
			//this.layout.sidebar.show( new Sidebar({collection: this.collection}) );
		},

		dashboard: function(){
			this.layout.main.show( new DashboardView() );
		}


	});

	return DashboardController;
});