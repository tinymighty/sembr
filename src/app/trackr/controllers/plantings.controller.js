/*var Backbone = require('backbone'),
		Marionette = require('marionette'),
		Layout = require('view/plantings/layout'),
		Collection = require('../collections/plantings');*/
define(['sembr', 'backbone', 'backbone.collectionbinder','marionette', 
	'../views/layout.js', '../collections/plantings.js', '../models/planting.js', '../collections/planting-actions.js', '../collections/places.js',
	"../views/plantings/add.js", "../views/sidebar.js", "../views/plantings/list.js", "../views/plantings/show.js", "../views/plantings/add-action.js",
	"components/loader/loader"],
function (Sembr, Backbone, CB, Marionette, 
	Layout, PlantingsCollection, PlantingModel, PlantingActionsCollection, PlacesCollection,
	AddPlantingView, Sidebar, PlantingsListView,	ShowPlantingView, AddActionView,
	LoaderView) {

	var PlantingsController = Backbone.Marionette.Controller.extend({

		initialize:function (options) {
				this.layout = new Layout();
				this.collection = new PlantingsCollection();
				this.loader  = new LoaderView();
				this.places = new PlacesCollection();
				//console.log('INIT PLANTINGS CONTROLLER', Math.random());
		},

		beforeModuleRoute: function(){
			console.log('Setting plantings layout!');
			Sembr.layout.setContent( this.layout );
			this.layout.sidebar.show( new Sidebar({collection: this.collection}) );
		},

		add: function(){
			this.layout.main.show( this.loader.render() );
			this.places.fetch().then(function(places){
				this.layout.main.show( new AddPlantingView( {places: this.places} ) );
			}.bind(this));
		},

		list: function(){
			var self = this;

			this.collection.fetch({wait:true, success: _(this.showPlantingListView).bind(this) });
			this.plantingListView = new PlantingsListView({collection: this.collection});
			/*plantingListView.on('load', function(){
				this.layout.list.show( plantingListView );
			});*/

			this.showSidebar();
			this.layout.main.show( new LoaderView() );
		}, 

		showPlantingListView: function(){
			this.collection.each(function(planting){
				planting.set('place', this.places.get( planting.get('place') ) );
			}.bind(this));
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
			new PlantingModel({_id: id})
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