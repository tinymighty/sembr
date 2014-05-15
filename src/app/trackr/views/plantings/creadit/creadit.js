/**
 * Create/Edit Planting screen
 */
define( ['sembr', 'backbone', 'sembr.ractiveview', 'jquery', 'moment', 'pickadate', 'selectize', 'vex', 'vex.dialog',
'trackr/views/plantings/creadit/create_plant', 'trackr/views/plantings/creadit/create_place',
'rv!./creadit.tpl',
'less!./creadit.less'],
function(sembr, Backbone, RactiveView, $, moment, pickadate, Selectize, vex, dialog,
CreatePlantView, CreatePlaceView,
template) {

	"use strict";


  //ItemView provides some default rendering logic
  return RactiveView.extend( {
		template: template,

		promptIsOpen: false,

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
			plantSelect: 'select.plant',
			placeSelect: 'select.place',
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
			'actions': function( actions ){
				console.log('action change observed');
			},
			'planted_from': function( newValue ){
				console.log("planted_from set to ", newValue);
			},
			'planted_until': function( newValue ){
				console.log("planted_from set to ", newValue);
			},
		// 	'planting.plant_id': function( newValue ){
  //       if( !this.model.has('name') ){
  //         this.model.set('name', );
  //       }
		// 	}
		},

		decorators: {
			plantSelectize: 'plantFieldDecorator',
			placeSelectize: 'placeFieldDecorator'
		},

		_beforeRactive: function( options ){
			var plantNames = [];
      sembr.trackr.plants.each(function( plant ){
        plantNames.push({ id: plant.get('id'), name: plant.get('use_name') });
        if( plant.has('binomial') ){
          plantNames.push({ id: plant.get('id'), name: plant.get('binomial') });
        }
      });
      console.log("PLANT NAMES", plantNames);
      this.data.plantNames = plantNames;
			this.data.places = sembr.trackr.places;
      
			if( options.model ){
				this.model = options.model;
			}else{
				this.model = sembr.trackr.models.Planting.create();
				this.model.set('planted_from', moment().format() );
			}

			this.data.planting = this.model;
		},

		initialize: function( opts ){
			var 
				ractive = this.ractive
			;

			//this.plantIdsToNames = sembr.trackr.plants.;

			this.promptIsOpen = false;

			this.model.on('change', function(mdl){ console.log( "Model change:", mdl.toJSON() ) });
			this.model.on('validated', function(isValid, model, errors){ console.log('Model validated: %o, %o', isValid, errors); })

			this.harvests = new Backbone.Collection();

			//this.set('planting', this.model);
			//this.set('places', sembr.trackr.places);
			//this.set('plants', sembr.trackr.plants);

			this.set('actions', this.model.actions() );
			this.set('action_types', sembr.trackr.models.PlantingAction.prototype.action_types);

			this.set('is_new', this.model.isNew() );

		},


		onRender: function(){
			//this.ui.fromDateInput.pickadate();
			//this.ui.untilDateInput.pickadate();
		},

		onShow: function(){
			//this.set('plants', sembr.trackr.plants);
			//this.render();
		},

    /**
     * A generic prompt modal
     */
		createPrompt: function( msg, viewEl ){
			var deferred = new $.Deferred();
			if(this.promptIsOpen){
				//callback(false);
				return deferred.reject();
			}
			this.promptIsOpen = true;
			dialog.open({
				className: 'vex-theme-flat-attack',
        message: msg,
        input: viewEl,
        buttons: [
            $.extend({}, dialog.buttons.YES, {text: 'Save'}),
            $.extend({}, dialog.buttons.NO, {text: 'Cancel'})
        ],
        callback: function(data){ 
          this.promptIsOpen = false; 
          if(data){
            deferred.resolve();
          }else{
            deferred.reject();
          }
        }.bind(this)
      });
      return deferred.promise();
		},



    /**
    * Set up the Selectize instance for the Place selection field
    */		
		placeFieldDecorator: function( node ){
      var self = this;
      $(node).selectize({
        create: function( input, callback ){
          //prompt to create a new plant with the name given in input
          self.createPlacePrompt( input )
            .done( function( model ){
              callback({
                text: model.get('name'), 
                value: model.get('id')
                });
              })
            .fail( function(){
              console.error('Failed to create a new place.');
              callback(false);
            })
          ;
          
        },
        createOnBlur: false,
        maxItems: 1,
        hideSelected: false,
        onChange: function( id ){
          self.model.set('place_id', id);
        }
      });

      return {
        teardown: function(){
          node.selectize.destroy();
        }
      };
    },

		createPlacePrompt: function( name ){
			var 
				deferred = new $.Deferred(),
				model = new sembr.trackr.models.Place({
					name: name
				}),
				view = new CreatePlaceView( {model: model} )
			;

			this.createPrompt( 'You are adding '+name+' as a new place...', view.render().$el )
				.done(function( data ){
					model.set( data );
          model.save();
          view.close();
          deferred.resolve( model );
				})
				.fail(function(){
					deferred.reject();
				})
			;

			return deferred.promise();

		},
		
		

    /**
    * Set up the Selectize instance for the Plant selection field
    */
    plantFieldDecorator: function( node ){
      var self = this;
      //Plant selectize field
      $(node).selectize({
        create: function( input, callback ){
          //prompt to create a new plant with the name given in input
          self.createPlantPrompt( input )
            .done( function( model ){
              console.log('Plant added, promise resolved with arguments %o', arguments);
              callback({
                text: model.get('use_name'),
                value: model.get('id')
              });
            })
            .fail( function(){
              console.error('Failed to create a new plant.');
              callback(false);
            })
          ;
          
        },
        createOnBlur: false,
        maxItems: 1,
        hideSelected: false,
        onChange: function( id ){
          self.model.set('plant_id', id);
        }
      });

      return {
        teardown: function(){
          node.selectize.destroy();
        }
      }
    },

		createPlantPrompt: function( name ){
			var 
				deferred = new $.Deferred(),
				newPlantModel = new sembr.trackr.models.Plant({
					use_name: name
				}),
				newPlantView = new CreatePlantView( {model: newPlantModel} )
			;

			this.createPrompt( 'You are adding '+name+' as a new plant... %o', newPlantView.render().$el )
				.done(function( data ){
					newPlantModel.set(data);
		    	newPlantModel.save();
		    	console.log('Added a new plant %o', newPlantModel);
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