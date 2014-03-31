define( ['sembr', 'backbone', 'marionette', 'jquery', 
'trackr/views/places/treeview', 'trackr/views/plantings/timeline/timeline',
'hbs!./dashboard.tpl'],
function(sembr, Backbone, Marionette, $, 
PlacesTreeView, PlantingsTimelineView,
template) {

  "use strict";
  
  //ItemView provides some default rendering logic
  return Backbone.Marionette.Layout.extend( {
    //el: '#trackr-dashboard-view',
    tagName: 'section',
    template: template,

    regions:{
      places: '#places',
      plantings: '#plantings'
    },

    initialize: function(options){
    	if(!options.collections || _(['plants', 'places', 'plantings']).difference(_(options.collections).keys()).length  ){
        throw 'Plantings, places and plants collections must be passed to dashboard view.';
    	}
      this.collections = options.collections;

    	sembr.log('Dashboard layout init.');

      //this.placesListView = new PlacesTreeView({collection: topLevelPlaces});

    	this.plantingsView = new PlantingsTimelineView({collections: this.collections});

    },

    onRender: function(){
    	//this.places.show( this.placesListView );
    	this.plantings.show( this.plantingsView );
    }
  });
});