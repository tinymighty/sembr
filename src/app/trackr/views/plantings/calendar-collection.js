define( ['sembr', 'backbone', 'marionette', 'jquery', 
'trackr/views/plantings/calendar-item'],
  function(sembr, Backbone, Marionette, $, ListItem) {
    //ItemView provides some default rendering logic
    return Backbone.Marionette.CollectionView.extend( {
      itemView: ListItem,

      // View Event Handlers
      events: {

      },

      initialize: function(opts){
        if(!this.collection){
          throw 'No collection passed to view.';
        }
      },

      onClose: function(){
        //sembr.log('plantings list view closed.');
      }

    });
  });