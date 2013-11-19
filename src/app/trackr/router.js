define(['backbone', 'sembr.modulerouter', 'trackr/controllers/dashboard', 'trackr/controllers/plantings', 'trackr/controllers/places'], 
function(Backbone, ModuleRouter, DashboardController, PlantingsController, PlacesController ) {
   return ModuleRouter.extend({
			//"index" must be a method in AppRouter's controller

			urlPrefix: "track",

			moduleRoutes: {
				"": {controller: DashboardController, method: 'dashboard'},
			  "plantings": {controller: PlantingsController, method: 'list'},
			  "planting/new": {controller: PlantingsController, method: 'add'},
			  "planting/:planting_id": {controller: PlantingsController, method: 'show'},

			  "places": {controller: PlacesController, method: 'dashboard'}
			}

   });
});