define( ['sembr', 'backbone', 'sembr.ractiveview', 'jquery', //'pickadate',
'trackr/views/places/treeview', 'trackr/views/plantings/add/place-summary',
'rv!./add.tpl', 'rv!./add/search_message.tpl'],
function(sembr, Backbone, RactiveView, $, //pickadate,
PlacesTree, PlaceSummary,
template, searchMessageTemplate) {

	"use strict";

  //ItemView provides some default rendering logic
  return RactiveView.extend( {
		template: template,

		// View Event Handlers
		events: {
			save: 'save'
		},

		ui:{
			plantSearch: '.ui.plant.search',
			placeSelect: '.place.selection',
			placeInput: '.place.id',
			plantSearchPrompt: '.plant.search .prompt',
			placeSummary: '.place.summary',
			fromDateInput: '.date.planted.from',
			untilDateInput: '.date.planted.until'
		},

		initialize: function(opts){
			var 
				ractive = this.ractive,
				model = this.newModel()
			;

			this.model.on('change', function(mdl){ console.log( "Model change:", model.toJSON() ) });

			this.set('planting', this.model);
			this.set('yes', 'whaaat');
			this.set('places', sembr.trackr.places);
			this.set('plants', sembr.trackr.plants);
			console.log('PLACES', sembr.trackr.places);

			/*this.views = {
				placesTree: new PlacesTree({collection: this.places}),
				placeSummary: new PlaceSummary()
			}*/
		},

		/*onRender: function(){
			var ids, names, plants;

			ids = _(this.plants.toJSON())
				.pluck('_id')
			;
			names = _(this.plants.toJSON())
				.pluck('use_name')
			;
			plants = _(this.plants.toJSON())
				.chain()
				.map(function(p){
					return {label: p.use_name, value:p.id};
				})
				.value()
			;
			console.log( "PLANTS", plants );

			$.fn.search.settings.templates.input = function(response){
				var
					html = ''
				;
				if(response.results !== undefined) {
					// each result
					$.each(response.results, function(index, result) {
						if(result.label && result.value){
						  html  += '<a class="result">';
						  if(result.image !== undefined) {
							html+= ''
							  + '<div class="image">'
							  + ' <img src="' + result.image + '">'
							  + '</div>'
							;
						  }
						  html += '<div class="title" data-value="'+result.value+'">'+result.label+'</div>';
						  html  += ''
							+ '</div>'
							+ '</a>'
						  ;
						}
					});
					return html;
				}
				return false;
			};

			this.ui.plantSearch.search(plants, {
				type: 'input',
				searchFields: ['label'],
				onSelect: function(){
					console.log('Item selected', arguments);
					return 'default';
				},
				onResultsOpen: _(function(){
					console.log('Results opened');
					this.ui.plantSearch.find('.results .add.button').click(function(ev){
						ev.preventDefault();
						ev.stopPropagation();
						ev.stopImmediatePropagation();
						console.log('ADD IT', arguments);
					});
				}).bind(this),
				templates:{
					message: function(message, type){
						return searchMessageTemplate({message: message, type:type});
					}
				}
			});

			this.ui.plantSearchPrompt.on('change', function(){
				console.log('Plant search field change!');
			})


			this.ui.placeSelect.append( this.views.placesTree.render().$el );

			this.$('.ui.selection.dropdown')
				.dropdown({onChange: function(){ $(this).find('input').trigger('change'); } })
	    ;

	    this.ui.placeSummary.append( this.views.placeSummary.render().$el );
		},*/

		onRender: function(){
			//console.log(this.ui);
			//this.ui.fromDateInput.pickadate();
			var d = new Date();
			this.ui.fromDateInput.val( d.toISOString() );
		},

		onShow: function(){
			//this.set('plants', sembr.trackr.plants);
			//this.render();
		},

		setPlace: function(ev){
			var 
				$el = $(ev.target),
				_id = $el.attr('data-_id')
			;
			this.ui.placeInput.val(_id);
			this.ui.placeSelect.find('.item.active').removeClass('active');
			$el.parent('.item').addClass('active');
			this.views.placeSummary.model = sembr.trackr.allPlaces.get(_id);
			this.views.placeSummary.render();
		},

		save: function(){
			sembr.log('Save the model: ', this.model.toJSON());
			this.model.save();
			window.model = this.model;
			//this.collection.add(this.model);
		},

		newModel: function(planting){
			return this.model = new sembr.trackr.models.Planting();
		},

		clear: function(){
			this.model.clear();
		}

  });
});