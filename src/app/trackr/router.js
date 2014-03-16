	define(['backbone', 'sembr.modulerouter'], 
function(Backbone, ModuleRouter) {
	"use strict";
	return ModuleRouter.extend({
		//'index' must be a method in AppRouter's controller

		urlPrefix: 'track',

		moduleRoutes: {
			'': 'Dashboard.dashboard',
		  'plantings': 'Plantings.list',
		  'timeline': 'Plantings.timeline',
		  'planting/new': 'Plantings.add',
		  'planting/:planting_id': 'Plantings.show',

		  'places': 'Places.dashboard',

		  'record': 'Record.record',
		}

	});
});