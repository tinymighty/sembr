/**
 * A view to quickly create a new plant while entering a planting
 */
define(['marionette', 'hbs!./create_plant.tpl'], function(Marionette, tpl){
	return Marionette.ItemView.extend({
		template: tpl
	});
})