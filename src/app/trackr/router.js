	define(['backbone', 'sembr.modulerouter', 'trackr/controllers/dashboard', 'trackr/controllers/plantings', 'trackr/controllers/places'], 
function(Backbone, ModuleRouter, DashboardController, PlantingsController, PlacesController ) {
   return ModuleRouter.extend({
			//"index" must be a method in AppRouter's controller

			urlPrefix: "track",

			moduleRoutes: {
				"": {controller: 'Dashboard', method: 'dashboard'},
			  "plantings": {controller: 'Plantings', method: 'list'},
			  "planting/new": {controller: 'Plantings', method: 'add'},
			  "planting/:planting_id": {controller: 'Plantings', method: 'show'},

			  "places": {controller: 'Places', method: 'dashboard'}
			}

   });
});