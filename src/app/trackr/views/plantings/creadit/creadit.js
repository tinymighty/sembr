/**
 * Create/Edit Planting screen
 */
define( ['sembr', 'backbone', 'sembr.ractiveview', 'jquery', 'pickadate', 'selectize', 'vex', 'vex.dialog',
'trackr/views/plantings/creadit/create_plant', 'trackr/views/plantings/creadit/create_place',
'rv!./creadit.tpl',
'less!./creadit.less'],
function(sembr, Backbone, RactiveView, $, pickadate, Selectize, vex, dialog,
CreatePlantView, CreatePlaceView,
template) {

	"use strict";

	var 
		promptIsOpen = false
	;

  //ItemView provides some default rendering logic
  return RactiveView.extend( {
		template: template,

		// View Event Handlers
		events: {
			save: 'save',
			addHarvest: function(){
				var action = this.model.addAction('harvest');
				action.on('change', function(){
					console.log("action change: ", action);
				})
				//this.ractive.update();
			}
		},

		ui:{
			plantSearch: '.ui.plant.search',
			placeSelect: '.place.selection',
			placeInput: '.place.id',
			plantSearchPrompt: '.plant.search .prompt',
			placeSummary: '.place.summary',
			fromDateInput: '.date.planted.from',
			untilDateInput: '.date.planted.until'
		},

		observers: {
			/*"planting.plant_id": function( newValue ){
				this.set('plant_name', sembr.trackr.plants.findWhere({id: newValue}).get('use_name') );
			},
			"planting.place_id": function( newValue ){
				this.set('place_name', sembr.trackr.places.findWhere({id: newValue}).get('name') );
			},*/
			actions: function( actions ){
				console.log('action added');
			},
			planted_from: function( newValue ){
				console.log("planted_from set to ", newValue);
			},
			planted_until: function( newValue ){
				console.log("planted_from set to ", newValue);
			}
		},

		initialize: function(opts){
			var 
				ractive = this.ractive
			;

			//this.plantIdsToNames = sembr.trackr.plants.;
			if(opts.model){
				this.model = opts.model;
			}else{
				this.model = sembr.trackr.models.Planting.create();
			}

			this.model.on('change', function(mdl){ console.log( "Model change:", mdl.toJSON() ) });
			this.model.on('validated', function(isValid, model, errors){ console.log('Model validated: %o, %o', isValid, errors); })

			this.harvests = new Backbone.Collection();

			this.set('planting', this.model);
			this.set('places', sembr.trackr.places);
			this.set('plants', sembr.trackr.plants);

			this.set('actions', this.model.actions() );
			this.set('action_types', sembr.trackr.models.PlantingAction.prototype.action_types);

			this.set('is_new', this.model.isNew() );
			/*this.views = {
				placesTree: new PlacesTree({collection: this.places}),
				placeSummary: new PlaceSummary()
			}*/
		},


		onRender: function(){

			//this.ui.fromDateInput.pickadate();
			//this.ui.untilDateInput.pickadate();

			var view = this;
			
			//Plant selectize field
			this.$('#add_planting-select_plant select').selectize({
				create: function( input, callback ){
					//prompt to create a new plant with the name given in input
					view.createPlantPrompt( input )
						.done( function( model ){
				     	callback({
				     		text: model.get('use_name'), 
				     		value: model.get('id')
				     	});
				    })
				    .fail( function(){
				    	console.error('Failed to create a new plant.');
				    	callback(false);
				    });
					
				},
				createOnBlur: false,
				maxItems: 1,
				hideSelected: false,
				onChange: function( id ){
					view.model.set('plant_id', id);
				}
			});


			//Place selectize field
			this.$('#add_planting-select_place select').selectize({
				create: function( input, callback ){
					//prompt to create a new plant with the name given in input
					view.createPlacePrompt( input )
						.done( function( model ){
				     	callback({
				     		text: model.get('name'), 
				     		value: model.get('id')
				     	});
				    })
				    .fail( function(){
				    	console.error('Failed to create a new place.');
				    	callback(false);
				    });
					
				},
				createOnBlur: false,
				maxItems: 1,
				hideSelected: false,
				onChange: function( id ){
					view.model.set('place_id', id);
				}
			});

		},

		onShow: function(){
			//this.set('plants', sembr.trackr.plants);
			//this.render();
		},

		createPrompt: function( msg, viewEl ){
			var deferred = new $.Deferred();
			if(promptIsOpen){
				//callback(false);
				return;
			}
			promptIsOpen = true;
			dialog.open({
				className: 'vex-theme-flat-attack',
		    message: msg,
		    input: viewEl,
		    buttons: [
		        $.extend({}, dialog.buttons.YES, {text: 'Save'}),
		        $.extend({}, dialog.buttons.NO, {text: 'Cancel'})
		    ],
		    callback: function(data){ 
		    	promptIsOpen = false; 
		    	if(data){
		    		deferred.resolve();
		    	}else{
		    		deferred.reject()
		    	}
		   	}
		  });
		  return deferred.promise();
		},

		createPlacePrompt: function( name ){
			var 
				deferred = new $.Deferred(),
				newPlaceModel = new sembr.trackr.models.Place({
					name: name
				}),
				newPlaceView = new CreatePlaceView( {model: newPlaceModel} );
			;

			this.createPrompt( 'You are adding '+name+' as a new place...', newPlaceView.render().$el )
				.done(function( data ){
					newPlaceModel.set(data);
		    	newPlaceModel.save();
		    	deferred.resolve( newPlaceModel );
				})
				.fail(function(){
					deferred.reject();
				})
			;

			return deferred.promise();

		},

		createPlantPrompt: function( name ){
			var 
				deferred = new $.Deferred(),
				newPlantModel = new sembr.trackr.models.Plant({
					use_name: name
				}),
				newPlantView = new CreatePlantView( {model: newPlantModel} );
			;

			return this.createPrompt( 'You are adding '+name+' as a new plant...', newPlantView.render().$el )
				.done(function( data ){
					newPlantModel.set(data);
		    	newPlantModel.save();
		    	deferred.resolve( newPlantModel );
				})
				.fail(function(){
					deferred.reject();
				})
			;

			return deferred.promise();

		},

		save: function(){
			sembr.log('Save the model: ', this.model.toJSON());
			this.model.save()
				.done(function( model ){
					model.actions().each(function( action ){
						action.save();
					});
				})
				.fail(function(){

				});
			window.model = this.model;
			//this.collection.add(this.model);
		},

		clear: function(){
			this.model.clear();
		}

  });
});