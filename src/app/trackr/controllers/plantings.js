/*var Backbone = require('backbone'),
		Marionette = require('marionette'),
		Layout = require('view/plantings/layout'),
		Collection = require('../collections/plantings');*/
define(['sembr', 'sembr.controller', 'backbone', 'backbone.collectionbinder','marionette', 
	'trackr/views/layout', 
	'trackr/views/plantings/add', 'trackr/views/sidebar', 'trackr/views/plantings/list', 'trackr/views/plantings/show', "trackr/views/plantings/add-action",
	"components/loader/loader"],
function (sembr, Controller, Backbone, CB, Marionette, 
	Layout,
	AddPlantingView, Sidebar, PlantingsListView,	ShowPlantingView, AddActionView,
	LoaderView) {

	var PlantingsController = Controller.extend({

		initialize:function (options) {
				this.layout = new Layout();
				this.plantings = new sembr.trackr.collections.Plantings();
				this.loader  = new LoaderView();
				this.places = sembr.trackr.places;
				//console.log('INIT PLANTINGS CONTROLLER', Math.random());
		},

		beforeModuleRoute: function(){
			console.log('Controller ID: ', this.id);
			sembr.base.setContent( this.layout );
			this.places = sembr.trackr.places;
			//this.layout.sidebar.show( new Sidebar({collection: this.plantings}) );
		},

		add: function(){
			this.layout.main.show( this.loader.render() );
			this.layout.main.show( new AddPlantingView( {places: this.places} ) );
		},

		list: function(){
			console.log('Plantings list view...');
			var self = this;

			var plantingListView = new PlantingsListView({collection: this.plantings});
			this.listenTo(this.plantings,'all', function(name){
				console.log('PlantingsCollection: ', name);
			})
			this.listenTo(plantingListView,'all', function(name){
				console.log('PlantingListView:', name);
			})
			console.log('Fetching plantings', this.plantings, this.plantings.model());
			this.plantings.fetchWhere({user: sembr.user.get('_id')})
				.done( function(){
					console.log("Got plantings", this.plantings); 
					console.log("Planting associations", this.plantings.at(0));
					console.log("Planting to JSON", this.plantings.at(0).toJSON() );

					this.layout.main.show( plantingListView.render() );
				}.bind(this))
				.fail(function(err){
					console.error(err);
				});

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

			//load a planting, fetch it's actions
			sembr.trackr.models.Planting.findOrFetch({'_id': id})
				.done(function(planting, data){
					console.log('Fetched planting', planting);//, data);

					this.showPlanting(planting);
				}.bind(this))
				.fail(function (err) {
					console.error('Failed to load planting model!');
				});
		},

		showPlanting: function(planting){
			this.layout.main.show( new ShowPlantingView({model: planting}) );
			this.layout.sidebar.show( new AddActionView({collection: planting.actions(), planting: planting }) );
		}


	});

	return PlantingsController;
});