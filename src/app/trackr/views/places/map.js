define( ['sembr', 'backbone', 'marionette', 'jquery', 
'./map-nested.js'],
function(Sembr, Backbone, Marionette, $, 
MapNested) {
  //ItemView provides some default rendering logic
  return Backbone.Marionette.CollectionView.extend( {
    itemView: MapNested
  });
});