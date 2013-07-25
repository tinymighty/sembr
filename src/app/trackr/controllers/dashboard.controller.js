/*var Backbone = require('backbone'),
		Marionette = require('marionette'),
		Layout = require('view/plantings/layout'),
		Collection = require('../collections/plantings');*/
define(['sembr', 'backbone', 'backbone.collectionbinder','marionette', 
	'../views/layout.js', '../collections/plantings.js', '../models/planting.js', '../collections/planting-actions.js',
	"components/loader/loader"],
function (Sembr, Backbone, CB, Marionette, 
	Layout, Collection, PlantingModel, PlantingActionsCollection,
	LoaderView) {

	var DashboardController = Backbone.Marionette.Controller.extend({

		initialize:function (options) {
				this.layout = new Layout();
				this.collection = new Collection();

		},

		beforeModuleRoute: function(){
			console.log('Setting plantings layout!');
			Sembr.layout.setContent( this.layout );
			//this.layout.sidebar.show( new Sidebar({collection: this.collection}) );
		},


		dashboard: function(){

		}


	});

	return DashboardController;
});