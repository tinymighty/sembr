/*
Load all models and then set up the associations
*/
define([
	'trackr/collections/_init', //make collections available for reference in the associations

  'trackr/models/action', 
  'trackr/models/place', 
  'trackr/models/plant', 
  'trackr/models/planting',
  'trackr/models/user'
],
function(
	collections, 

	Action,
	Place,
	Plant,
	Planting,
	User
){
	
	var models = {
		Action: Action,
		Place: Place,
		Plant: Plant,
		Planting: Planting,
		User: User
	}

	//models and collections are now all available to setup associations...

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


	models.Place.has()
	  .many('places', {
	    inverse: 'place',
	    collection: collections.Places
	  })
	  .one('place', {
	    inverse: 'places',
	    model: models.Place
	  });

	models.User.has()
	  .many('places', {
	    inverse: 'user',
	    collection: collections.Places
	  })
	  .many('plantings', {
	    inverse: 'user',
	    collection: collections.Plantings
	  });


	return models;

});