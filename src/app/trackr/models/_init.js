/*
Load all models and then set up the associations
*/
define([
	'trackr/collections/_init', //make collections available for reference in the associations

  'trackr/models/action', 
  'trackr/models/place', 
  'trackr/models/plant', 
  'trackr/models/planting',
  'trackr/models/planting-action',
  'trackr/models/user'
],
function(
	collections, 

	Action,
	Place,
	Plant,
	Planting,
	PlantingAction,
	User
){
	
	var models = {
		Action: Action,
		Place: Place,
		Plant: Plant,
		Planting: Planting,
		PlantingAction: PlantingAction,
		User: User
	}

	//define module association setup functions. 
	//these are defined like this so we can reset all associations during 
	//unit testing, and just build the ones we need...	
	models._init = {
		all: function(){
			models._init.planting();
			models._init.place();
			models._init.user();
		},
		planting: function(){
			models.Planting.has()
			  .one('place', {
			    model: models.Place,
			    inverse: 'plantings',
			  })
			  .one('plant', {
			    model: models.Plant,
			    inverse: 'plantings'
			  })
			  .many('actions', {
			    inverse: 'planting',
			    collection: collections.PlantingActions
			  });
			},
		place: function(){
			models.Place.has()
			  .many('places', {
			    inverse: 'place',
			    collection: collections.Places
			  })
			  .one('place', {
			    inverse: 'places',
			    model: models.Place
			  });
		},
		user: function(){
			models.User.has()
			  .many('places', {
			    inverse: 'user',
			    collection: collections.Places
			  })
			  .many('plantings', {
			    inverse: 'user',
			    collection: collections.Plantings
			  });
		}
	}

	models._reset = {
		all: function(){
			_(models).each(function(model){
				if(model.reset)
					model.reset();
			});
		}
	}

	models._init.all();

	return models;

});