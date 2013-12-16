define( ['sembr', 'backbone', 'marionette', 'jquery', 
'trackr/views/plantings/timeline/track-item'],
	function(sembr, Backbone, Marionette, $, ListItem) {
		//ItemView provides some default rendering logic
		return Backbone.Marionette.CollectionView.extend( {
			itemView: ListItem,
			attributes:{
				class: 'track'
			},
			// View Event Handlers
			events: {

			},

			initialize: function(opts){
				//to render the track of months, we use a collection and a collectionview
				this.collection = new Backbone.Collection();
				var today = new Date();
				//start the track a month behind the current month, just for context
				var start = new Date();
				start.setMonth(today.getMonth()-1);
				//and set us a year and a half ahead for a good long view
				var end = new Date();
				end.setMonth(today.getMonth()+18);
				var current = new Date(start);
				while(current < end){
					current.setMonth(current.getMonth()+1);
					this.collection.add( new Backbone.Model({date: new Date(current) }) );
				}
			},

			onDomRefresh: function(){
				console.log('DOM REFRESHHHH');
			},

			onRender: function(){
				var that = this;
				var $el = this.$el;
				//for some reason the width of the element isn't yet defined
				//so set an internval to run every ms until it's available...
				//Even at 1ms I've never seen this run more than once! - Andru
				var waitForWidth = setInterval(function(){
					if($el.width()){
						that.setItemWidth();
						clearInterval(waitForWidth);
					}
					//console.log('Checking for width...'+$el.width())
				}, 1);

				
			},

			setItemWidth: function(containerWidth){
				var number_of_children = this.children.length;
				var width = this.$el.width() / number_of_children;
				this.children.each(function(view, i){
					view.$el.css({'width':width, left:width*i});
				});
			},

			onClose: function(){
				//sembr.log('plantings list view closed.');
			}

		});
	});