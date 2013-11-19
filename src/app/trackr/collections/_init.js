define([
  'trackr/collections/places', 
  'trackr/collections/plantings', 
  'trackr/collections/planting-actions', 
  'trackr/collections/plants'
],
function(
	Places,
	Plantings,
	PlantingActions,
	Plants
){
	
	var collections = {
		Places: Places,
		Plants: Plants,
		Plantings: Plantings,
		PlantingActions: PlantingActions
	}

	return collections;

});