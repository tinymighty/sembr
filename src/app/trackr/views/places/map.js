define( ['sembr', 'backbone', 'marionette', 'jquery', 
'trackr/views/plantings/map-nested'],
function(sembr, Backbone, Marionette, $, 
MapNested) {
  //ItemView provides some default rendering logic
  return Backbone.Marionette.CollectionView.extend( {
    itemView: MapNested
  });
});