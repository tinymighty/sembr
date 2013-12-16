define(['grated'], function(grated){
	
	var planting = grated('planting');
	planting.add([
		'_id', 
		'plant_id',
		'place_id',
		'present_from',
		'present_until'
	]);

	return planting;

});