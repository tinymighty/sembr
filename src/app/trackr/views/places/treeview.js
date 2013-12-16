define( ['sembr', 'backbone', 'marionette', 'jquery', 
'trackr/views/places/treeview-item'],
function(sembr, Backbone, Marionette, $, 
TreeViewItem) {
  //ItemView provides some default rendering logic
  return Backbone.Marionette.CollectionView.extend( {
    itemView: TreeViewItem,
    tagName: 'ul',
    attributes: {
    	class: 'places list'
    },
    initialize: function(options){
    	if(options.places){
    		this.collection = options.places;
    	}
    	if(!this.collection){
    		throw new Error('No places collection supplied to places/treeview');
    	}
    }
  });
});