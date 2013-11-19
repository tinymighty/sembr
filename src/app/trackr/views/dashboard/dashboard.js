define( ['sembr', 'backbone', 'marionette', 'jquery', 
'trackr/views/places/treeview', 'trackr/views/plantings/calendar',
'hbs!./dashboard.tpl'],
function(sembr, Backbone, Marionette, $, 
PlacesTreeView, PlantingsCalendarView,
template) {
  //ItemView provides some default rendering logic
  return Backbone.Marionette.Layout.extend( {
    tagName: 'div',
    template: template,

    regions:{
      places: '#places',
      plantings: '#plantings'
    },

    initialize: function(opts){
    	if(!opts || !opts.places || !opts.plantings){
    		throw 'No places collection was passed to DashboardView';
    	}

    	console.log('Dashboard layout init.');


    	this.placesCollection = opts.places;
      var topLevelPlaces = new sembr.trackr.collections.Places( this.placesCollection.filter(function(place){
          if(place.has('in_place'))
            return false;
          return true;
        })
      );
      console.log('TopLevelPlaces %o', topLevelPlaces);
    	this.placesListView = new PlacesTreeView({collection: topLevelPlaces});

    	this.plantingsCollection = opts.plantings;
    	this.plantingsView = new PlantingsCalendarView({collection: this.plantingsCollection});

    },

    onRender: function(){
    	this.places.show( this.placesListView.render() );
    	this.plantings.show( this.plantingsView.render() );
    }
  });
});