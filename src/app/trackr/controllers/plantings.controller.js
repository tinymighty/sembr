/*var Backbone = require('backbone'),
		Marionette = require('marionette'),
		Layout = require('view/plantings/layout'),
		Collection = require('../collections/plantings');*/
define(['sembr', 'sembr.controller', 'backbone', 'backbone.collectionbinder','marionette', 
	'../views/layout.js', '../collections/plantings.js', '../models/planting.js', '../collections/planting-actions.js', '../collections/places.js',
	"../views/plantings/add.js", "../views/sidebar.js", "../views/plantings/list.js", "../views/plantings/show.js", "../views/plantings/add-action.js",
	"components/loader/loader"],
function (Sembr, Controller, Backbone, CB, Marionette, 
	Layout, PlantingsCollection, PlantingModel, PlantingActionsCollection, PlacesCollection,
	AddPlantingView, Sidebar, PlantingsListView,	ShowPlantingView, AddActionView,
	LoaderView) {

	var PlantingsController = Controller.extend({

		initialize:function (options) {
				this.layout = new Layout();
				this.plantings = new PlantingsCollection({ user: Sembr.user.get('_id') });
				this.loader  = new LoaderView();
				this.places = new PlacesCollection({ user:Sembr.user.get('_id') });
				//console.log('INIT PLANTINGS CONTROLLER', Math.random());
		},

		beforeModuleRoute: function(){
			console.log('Controller ID: ', this.id);
			Sembr.layout.setContent( this.layout );
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

			this.plantings.fetch({wait:true}).then( this.showPlantingListView.bind(this) );
			//, success: _(this.showPlantingListView).bind(this) });
			this.plantingListView = new PlantingsListView({collection: this.plantings});
			/*plantingListView.on('load', function(){
				this.layout.list.show( plantingListView );
			});*/

			this.showSidebar();
			this.layout.main.show( new LoaderView() );
		}, 

		showPlantingListView: function(){
			console.log("Got plantings", this.plantings); 
			console.log("Planting to JSON", this.plantings.at(0), this.plantings.at(0).toJSON() );
			//console.log("Is blocked", this.plantings.at(0)._queue.isBlocked() );
			var self = this;
			setTimeout(function(){ console.log(self.plantings.at(0).toJSON() ); }, 1000);
			/*this.plantings.each(function(planting){
				planting.set('place', this.places.get( planting.get('place') ) );
			}.bind(this));*/
			this.layout.main.show( this.plantingListView );
		},


		showSidebar: function(){
			
		},


		show: function(id){
			console.log('Getting planting', id);
			this.layout.main.show(new LoaderView() );
			this.layout.sidebar.show(new LoaderView() );
			var self = this;
			//load a planting, fetch it's actions
			PlantingModel.findOrCreate({_id: id})
				.fetch()
				.done(function(planting, data){
					console.log('Fetched planting', planting, data);
					planting.fetchActions()
						.done(function(){ console.log('Fetched planting actions', planting.actions); self.showPlanting(planting) })
						.fail(function(){ console.error('Failed to load planting actions') });
				})
				.fail(function (err) {
					console.error('Failed to load planting model!');
				});
		},

		showPlanting: function(planting){
			this.layout.main.show( new ShowPlantingView({model: planting}) );
			this.layout.sidebar.show( new AddActionView({collection: planting.actions, planting: planting }) );
		}


	});

	return PlantingsController;
});