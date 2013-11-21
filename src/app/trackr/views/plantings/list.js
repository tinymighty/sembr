define( ['sembr', 'backbone', 'marionette', 'jquery', 
'./list-item', 'hbs!./list.tpl'],
  function(sembr, Backbone, Marionette, $, ListItem, template) {
    //ItemView provides some default rendering logic
    return Backbone.Marionette.CollectionView.extend( {
      template: template,
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