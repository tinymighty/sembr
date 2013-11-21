define( ['sembr', 'backbone', 'marionette', 'jquery', 
'trackr/views/plantings/calendar-collection', 
'hbs!./calendar.tpl'],
function( Sembr, Backbone, Marionette, $, 
CalendarCollectionView, 
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
      sembr.log(this.collection.models);
      /*var grouped_by_plants = _(this.collection.models).groupBy(function(model){
      	sembr.log(model.get);
      	return model.get('plant').get('use_name');
      });
      sembr.log(grouped_by_plants);*/
      this.collectionView = new CalendarCollectionView({collection: opts.collection, group_by:'plant'});
    },

    onRender: function(){
    	this.plantings.show(this.collectionView.render());
    },

    onClose: function(){
      //sembr.log('plantings list view closed.');
    },

    /*serializeData: function(){
    	var json = this.model.toJSON();
    	json.
    }*/

  });
});