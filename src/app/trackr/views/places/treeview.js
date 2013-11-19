define( ['sembr', 'backbone', 'marionette', 'jquery', 
'trackr/views/places/treeview-item'],
function(sembr, Backbone, Marionette, $, 
TreeViewItem) {
  //ItemView provides some default rendering logic
  return Backbone.Marionette.CollectionView.extend( {
    itemView: TreeViewItem
  });
});