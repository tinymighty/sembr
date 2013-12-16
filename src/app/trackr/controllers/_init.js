define([
  'trackr/controllers/dashboard', 
  'trackr/controllers/places', 
  'trackr/controllers/plantings',
  'trackr/controllers/record'
],
function(
	Dashboard,
	Places,
	Plantings,
	Record
){
	
	return {
		Dashboard: Dashboard,
		Places: Places,
		Plantings: Plantings,
		Record: Record
	}


});