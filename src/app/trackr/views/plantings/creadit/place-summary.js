define( ['sembr', 'backbone', 'marionette', 'jquery', 
'hbs!./place-summary.tpl', 'hbs!./place-summary-empty.tpl'],
function(sembr, Backbone, Marionette, $, template, emptyTemplate) {
  //ItemView provides some default rendering logic
  return Backbone.Marionette.ItemView.extend( {
	
	attributes: {
		class: 'ui segment'
	},

	getTemplate: function(){
		if(this.model){
			return template;
		}else{
			return emptyTemplate;
		}
	},

	events: {

	},

	initialize: function(options){
		
	},

	onRender: function(){
		this.$('.ui.radio.checkbox')
		  .checkbox()
		;
	},

	serializeData: function(){
		if(this.model){
			return this.model.toJSON({include_associations:true});
		}
		return {};
	}


  });
});