define( ['sembr', 'backbone', 'marionette', 'jquery', 
'./treeview-item.js'],
function(Sembr, Backbone, Marionette, $, 
TreeViewItem) {
  //ItemView provides some default rendering logic
  return Backbone.Marionette.CollectionView.extend( {
    itemView: TreeViewItem
  });
});