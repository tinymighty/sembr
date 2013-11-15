define( ['sembr', 'backbone', 'marionette', 'jquery', 
'../../models/planting.js', '../../collections/plantings.js', './calendar-collection.js', 
'hbs!./calendar.tpl'],
function( Sembr, Backbone, Marionette, $, 
PlantingModel, PlantingsCollection, CalendarCollectionView, 
template ){
  //ItemView provides some default rendering logic
  return Backbone.Marionette.Layout.extend( {
    template: template,

    regions:{
      plantings: '.calendar-collection'
    },

    // View Event Handlers
    events: {

    },

    initialize: function(opts){
      if(!this.collection){
        throw 'No collection passed to view.';
      }
      console.log(this.collection.models);
      /*var grouped_by_plants = _(this.collection.models).groupBy(function(model){
      	console.log(model.get);
      	return model.get('plant').get('use_name');
      });
      console.log(grouped_by_plants);*/
      this.collectionView = new CalendarCollectionView({collection: opts.collection, group_by:'plant'});
    },

    onRender: function(){
    	this.plantings.show(this.collectionView.render());
    },

    onClose: function(){
      //console.log('plantings list view closed.');
    },

    /*serializeData: function(){
    	var json = this.model.toJSON();
    	json.
    }*/

  });
});