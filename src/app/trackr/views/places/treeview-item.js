define( ['sembr', 'backbone', 'marionette', 'jquery', 
'hbs!./treeview-item.tpl'],
function(Sembr, Backbone, Marionette, $, 
template) {
  //ItemView provides some default rendering logic
  return Backbone.Marionette.CompositeView.extend( {
    template: template,

    initialize: function(opts){
        this.collection = this.model.get('places');
    },

    onRender: function(){
       
    },

    appendHtml: function(collectionView, itemView){
        // ensure we nest the child list inside of 
        // the current list item
        collectionView.$("li:first").append(itemView.el);
    }

  });
});