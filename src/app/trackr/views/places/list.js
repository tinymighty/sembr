define( ['sembr', 'backbone', 'marionette', 'jquery', 
'./list-item.js', 'hbs!./list.tpl'],
  function(Sembr, Backbone, Marionette, $, ListItem, template) {
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
        //console.log('plantings list view closed.');
      }

    });
  });