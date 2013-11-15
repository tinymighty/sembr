define( ['sembr', 'backbone', 'marionette', 'jquery', 
'hbs!./map-nested.tpl'],
function(Sembr, Backbone, Marionette, $, 
template) {
  //ItemView provides some default rendering logic
  return Backbone.Marionette.CompositeView.extend( {
    template: template,

    initialize: function(opts){
        this.collection = this.model.get('has_places');
    },

    onRender: function(){
       
    },

    appendHtml: function(collectionView, itemView){
        collectionView.$("div:first").append(itemView.el);
    }

  });
});