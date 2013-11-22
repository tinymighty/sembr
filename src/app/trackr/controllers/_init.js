define([
  'trackr/controllers/dashboard', 
  'trackr/controllers/places', 
  'trackr/controllers/plantings'
],
function(
	Dashboard,
	Places,
	Plantings
){
	
	return {
		Dashboard: Dashboard,
		Places: Places,
		Plantings: Plantings
	}


});