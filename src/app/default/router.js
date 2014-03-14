define(['backbone', 'sembr.modulerouter'], 
function(Backbone, ModuleRouter, DashboardController) {
   "use strict";
   return ModuleRouter.extend({
			//"index" must be a method in AppRouter's controller

			urlPrefix: "",

			moduleRoutes: {
				"": {controller: 'Dashboard', method: "home"},
			  "dashboard": {controller: 'Dashboard', method: "home"}
			}

   });
});