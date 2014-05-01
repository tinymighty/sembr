/*var Backbone = require('backbone'),
		Marionette = require('marionette'),
		Layout = require('view/plantings/layout'),
		Collection = require('../collections/plantings');*/
define(['sembr', 'sembr.controller', 'backbone', 'marionette', 'ractive',
	'trackr/views/layout',
	'trackr/views/plantings/creadit/creadit', 'trackr/views/sidebar', 'trackr/views/plantings/list', 'trackr/views/plantings/show', "trackr/views/plantings/add-action", 'trackr/views/plantings/timeline/timeline',
	"components/loader/loader"],
function (sembr, Controller, Backbone, Marionette, Ractive,
	Layout,
	CreateEditPlantingView, Sidebar, PlantingsListView,	ShowPlantingView, AddActionView, TimelineView,
	LoaderView) {

	"use strict";
	
	var PlantingsController = Controller.extend({

		initialize:function (options) {
				this.layout = new Layout();
				this.loader  = new LoaderView();
				
				this.places = sembr.trackr.places;
				this.plants = sembr.trackr.plants;
				this.plantings = sembr.trackr.plantings;


				//sembr.log('INIT PLANTINGS CONTROLLER', Math.random());
		},

		beforeModuleRoute: function(){
			sembr.log('Controller ID: ', this.id);
			sembr.base.setContent( this.layout );


			//this.layout.sidebar.show( new Sidebar({collection: this.plantings}) );
		},

		add: function(){
			//this.layout.main.show( this.loader.render() );
			this.layout.main.show( new CreateEditPlantingView( {places: this.places} ) );
		},

		edit: function( planting_id ){

			sembr.trackr.models.Planting.findOrFetchById( planting_id )

				.done(function( planting ){
					console.warn('PLANTING FOUND, FETCHING LATEST DATA.')
					planting.fetch().done(function(){
						this.layout.main.show( new CreateEditPlantingView( {model: planting, places: this.places} ) );
					}.bind(this));
					console.log("Planting loaded for edit view", planting);
				}.bind(this))

				.fail(function(){
					sembr.error('Failed to load planting with id '+planting_id);
				})
			;
		},

		list: function(){
			sembr.log('Plantings list view...');
			var self = this;

			this.showSidebar();
			this.layout.main.show( new LoaderView() );

      /*this.listenTo(this.plantings,'all', function(name){
				sembr.log('PlantingsCollection: ', name);
			})
			this.listenTo(plantingListView,'all', function(name){
				sembr.log('PlantingListView:', name);
			})
      */
      /*var plantingListView = new PlantingsListView({
        el: 'body'
      });*/
			sembr.log('Fetching plantings', this.plantings);
			console.group('loading plantings.list');
			//this.plantings.findOrFetch( )
				//.done( function(){
					//sembr.log("Got plantings", this.plantings);
					//sembr.log("Planting associations", this.plantings.at(0));
					//sembr.log("Planting to JSON", this.plantings.at(0).toJSON() );

          var plantingListView = new PlantingsListView({
          	plantings: this.plantings
          });

          this.layout.main.show( plantingListView );
          console.groupEnd('loaded plantings.list');
				/*}.bind(this))
				.fail(function(err){
					console.error(err);
				});
*/


		},


		timeline: function(){
			console.group('Loading Timeline View');
			console.warn("loading plantings for timeline view");
			if(!this.timelineView){
				var plantings = new sembr.trackr.collections.Plantings();
				plantings
					.fetch()
					.fail(function(err){
						sembr.log('Faled to load plantings.');
						sembr.showError('Failed to load user plantings.');
					})
					.done(function( plantings ){
						sembr.log('Loaded plantings. Showing dashboard view.');
						this.timelineView = new TimelineView({collections: {places: this.places, plants: this.plants, plantings: plantings}});
						this.layout.main.show( this.timelineView );
						console.groupEnd();
					}.bind(this))
					.then(function(){
						console.groupEnd();
					});
			}else{
				this.layout.main.show( this.timelineView );
			}

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
			sembr.log('Getting planting', id);
			this.layout.main.show(new LoaderView() );
			//this.layout.sidebar.show(new LoaderView() );

			//load a planting, fetch it's actions
			sembr.trackr.models.Planting.findOrFetchById(id)
				.done(function(planting, data){
					sembr.log('Fetched planting', planting);//, data);

					this.showPlanting(planting);
				}.bind(this))
				.fail(function (err) {
					console.error('Failed to load planting model!');
				});
		},

		showPlanting: function(planting){
			this.layout.main.show( new ShowPlantingView({model: planting}) );
			//this.layout.sidebar.show( new AddActionView({collection: planting.actions(), planting: planting }) );
		}


	});

	return PlantingsController;
});
