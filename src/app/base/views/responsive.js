define([
	'require', 'sembr', 'backbone', 'marionette', 'base/views/navigation', 'semantic-ui',
	'hbs!base/templates/responsive', 
	/* CSS Resources */
	'css!/../libs/semantic-ui/css/semantic', 'css!base/resources/css/commonstyles.css', 'css!base/resources/css/fonts/museo/stylesheet.css',
	/* LESS resources */ 
	'less!base/resources/less/app-layout.less',	'less!base/resources/less/forms.less'
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
			appNav: 'nav[data-role="app-nav"]',
			content: '[data-role="content"]',
			footer: '[data-role="footer"]'
		},

		initialize: function(){
			this.navView = new NavView();
		},

		onRender: function(){
			this.appNav.show( this.navView );
		},

		preventDefault: function($ev){
			//$ev.preventDefault();
			//return false;
		}

	});
});