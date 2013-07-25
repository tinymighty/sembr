define(['backbone', 'sembr.modulerouter', './controllers/dashboard.controller.js'], 
function(Backbone, ModuleRouter, DashboardController) {
   return ModuleRouter.extend({
			//"index" must be a method in AppRouter's controller

			urlPrefix: "",

			moduleRoutes: {
				"": {controller: DashboardController, method: "home"},
			  "dashboard": {controller: DashboardController, method: "home"}
			}

   });
});