/*var Backbone = require('backbone'),
		Marionette = require('marionette'),
		Layout = require('view/plantings/layout'),
		Collection = require('../collections/plantings');*/
define(['sembr', 'sembr.controller', 'backbone', 'backbone.collectionbinder','marionette', 
	'../views/layout.js', 
	'../collections/plantings.js', '../collections/places.js',
	'../models/planting.js',
	"../views/plantings/add.js", "../views/sidebar.js", "../views/plantings/list.js", "../views/plantings/show.js", "../views/plantings/add-action.js",
	"components/loader/loader"],
function (sembr, Controller, Backbone, CB, Marionette, 
	Layout,
	Plantings, Places,
	Planting,
	AddPlantingView, Sidebar, PlantingsListView,	ShowPlantingView, AddActionView,
	LoaderView) {

	var PlantingsController = Controller.extend({

		initialize:function (options) {
				this.layout = new Layout();
				this.plantings = new Plantings({ where: {user: sembr.user.get('_id')} })
				this.loader  = new LoaderView();
				//this.places = new Places({ where: {user:sembr.user.get('_id')} });
				//console.log('INIT PLANTINGS CONTROLLER', Math.random());
		},

		beforeModuleRoute: function(){
			console.log('Controller ID: ', this.id);
			sembr.layout.setContent( this.layout );
			this.places = sembr.trackr.places;
			//this.layout.sidebar.show( new Sidebar({collection: this.plantings}) );
		},

		add: function(){
			this.layout.main.show( this.loader.render() );
			this.places.fetch().then(function(places){
				this.layout.main.show( new AddPlantingView( {places: this.places} ) );
			}.bind(this));
		},

		list: function(){
			var self = this;

			var plantingListView = new PlantingsListView({collection: this.plantings});
			this.listenTo(this.plantings,'all', function(name){
				console.log('PlantingsCollection: ', name);
			})
			this.listenTo(plantingListView,'all', function(name){
				console.log('PlantingListView:', name);
			})
			this.plantings.fetch().done( function(){
				console.log("Got plantings", this.plantings); 
				console.log("Planting to JSON", this.plantings.at(0).toJSON() );

				this.layout.main.show( plantingListView.render() );
			}.bind(this));

			//, success: _(this.showPlantingListView).bind(this) });
			
			/*this.plantingListView.on('load', function(){
				this.layout.list.show( plantingListView );
			});*/

			this.showSidebar();
			this.layout.main.show( new LoaderView() );
		}, 

		showSidebar: function(){
			
		},

		error: function(err){
			throw err;
		},


		show: function(id){
			if(!id){
				this.error('Planting id missing.');
			}
			console.log('Getting planting', id);
			this.layout.main.show(new LoaderView() );
			this.layout.sidebar.show(new LoaderView() );
			console.log('Finding plant with id '+id, Planting.find({'_id': id}) );
			//load a planting, fetch it's actions
			Planting.findOrFetch({'_id': id})
				.done(function(planting, data){
					console.log('Fetched planting', planting, planting.get('actions'));//, data);
					this.showPlanting(planting);
				}.bind(this))
				.fail(function (err) {
					console.error('Failed to load planting model!');
				});
		},

		showPlanting: function(planting){
			this.layout.main.show( new ShowPlantingView({model: planting}) );
			this.layout.sidebar.show( new AddActionView({collection: planting.get('actions'), planting: planting }) );
		}


	});

	return PlantingsController;
});