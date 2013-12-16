define( ['sembr', 'backbone', 'marionette', 'jquery', 
'hbs!./treeview-item.tpl'],
function(sembr, Backbone, Marionette, $, 
template) {
  //ItemView provides some default rendering logic
  return Backbone.Marionette.CompositeView.extend( {
    template: template,
    itemViewContainer: 'div.list',
    tagName: 'div',
    attributes: {
        class: 'item' 
    },

    initialize: function(opts){
        this.collection = this.model.places();
        console.log('Places leaf', this.model);
    },

    onRender: function(){
      if(!this.model.places().length){
        this.$('.list').remove();
      }
    },

    //appendHtml: function(collectionView, itemView){
        // ensure we nest the child list inside of 
        // the current list item
        //collectionView.$("li").append(itemView.el);
    //}

  });
});