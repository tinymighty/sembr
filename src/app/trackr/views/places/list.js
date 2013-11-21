define( ['sembr', 'backbone', 'marionette', 'jquery', 
'trackr/views/places/list-item', 'hbs!./list.tpl'],
  function(sembr, Backbone, Marionette, $, ListItem, template) {
    //ItemView provides some default rendering logic
    return Backbone.Marionette.CollectionView.extend( {
      template: template,
      itemView: ListItem,

      // View Event Handlers
      events: {

      },

      initialize: function(opts){

      },

      onClose: function(){
        //sembr.log('plantings list view closed.');
      }

    });
  });