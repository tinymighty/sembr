define(['require', 'sembr', 'backbone', 'marionette', 
'base/models/user',
'base/collections/users',
'base/views/responsive'], 
function(require, sembr, Backbone, Marionette, 
UserModel,
UsersCollection,
ResponsiveLayout){

/* Primary module */
var BaseModule = sembr.module("base", function(module){

	module.controllers = {
		
	};
	module.collections = {
		Users: UsersCollection
	};
	module.models = {
		User: UserModel
	};

	var layout = new ResponsiveLayout();
	sembr.body.show(layout);

	//the layout should be managed via a consistent API defined by this module
	module.setContent = function(view){
		layout.content.show(view);
	};

	module.vent = new Backbone.Wreqr.EventAggregator();


});

return BaseModule;

});