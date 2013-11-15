define( ['sembr', 'backbone', 'marionette', 'jquery', 
'../../models/planting.js', '../../collections/plantings.js', './calendar-item.js'],
  function(Sembr, Backbone, Marionette, $, Model, Collection, ListItem) {
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
        //console.log('plantings list view closed.');
      }

    });
  });