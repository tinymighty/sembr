define( ['sembr', 'backbone', 'marionette', 'jquery', 
'trackr/views/plantings/timeline/planting'],
function(sembr, Backbone, Marionette, $, ListItem) {
  //ItemView provides some default rendering logic
  return Backbone.Marionette.CollectionView.extend( {
    itemView: ListItem,

    attributes:{
      class: 'plantings'
    },
    // View Event Handlers
    events: {

    },

    initialize: function(options){
      if(!this.collection){
        throw 'No collection passed to view.';
      }
      this.options = _(options).defaults({
        groupBy: 'plant'
      });
      this.$el.attr('data-group_by',this.options.groupBy);

      //sembr.log(this.collection.models);
      this.grouped_by_plants = _(this.collection.models).groupBy(function(model){
        return model.plant().get('_id');
      });

      this.grouped_by_place = _(this.collection.models).groupBy(function(model){
        if(model.place && model.place()){
          return model.place().get('_id');
        }else{
          return null;
        }
      });

    },

    onRender: function(){
      console.log('Rendering plantings for timeline...');
    },

    onClose: function(){
      //sembr.log('plantings list view closed.');
    }

  });
});