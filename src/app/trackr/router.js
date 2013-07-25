define(['backbone', 'sembr.modulerouter', './controllers/dashboard.controller.js', './controllers/plantings.controller.js'], 
function(Backbone, ModuleRouter, DashboardController, PlantingsController ) {
   return ModuleRouter.extend({
			//"index" must be a method in AppRouter's controller

			urlPrefix: "track",

			moduleRoutes: {
				"": {controller: DashboardController, method: 'dashboard'},
			  "plantings": {controller: PlantingsController, method: 'list'},
			  "planting/new": {controller: PlantingsController, method: 'add'},
			  "planting/:planting_id": {controller: PlantingsController, method: 'show'}
			}

   });
});