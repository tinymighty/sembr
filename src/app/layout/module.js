define(['sembr', 'backbone', 'marionette', './views/responsive.js'], 
function(Sembr, Backbone, Marionette, ResponsiveLayout){

/* Primary module */
var LayoutModule = Sembr.module("Layout", function(module){

	//active layout is private to discourage using it directly
	var activeLayout = new ResponsiveLayout();
	Sembr.body.show(activeLayout);

	//the layout should be managed via a consistent API defined by this module
	module.setContent = function(view){
		activeLayout.content.show(view);
	};

	module.vent = new Backbone.Wreqr.EventAggregator();


});

return LayoutModule;

});