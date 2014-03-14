define([
	'require', 'sembr', 'backbone', 'marionette', 'base/views/navigation', 'semantic-ui',
	'hbs!base/templates/responsive', 
	'css!base/resources/css/reset', 'css!/../libs/semantic-ui/css/semantic', 'css!base/resources/css/commonstyles.css', 'css!base/resources/css/fonts/museo/stylesheet.css'
], function (
	require, sembr, Backbone, Marionette, NavView, SemanticUI, 
	template
) {
	//ItemView provides some default rendering logic
	return Backbone.Marionette.Layout.extend({
		template:template,

		attributes: {'data-role': "layout"},

		events:{
			'click a': 'preventDefault'
		},
		
		regions:{
			header: '[data-role="header"]',
			content: '[data-role="content"]',
			footer: '[data-role="footer"]'
		},

		initialize: function(){
			this.navView = new NavView();
		},

		onRender: function(){
			this.header.show( this.navView );
		},

		preventDefault: function($ev){
			//$ev.preventDefault();
			//return false;
		}

	});
});