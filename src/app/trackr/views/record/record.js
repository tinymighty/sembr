define(['sembr', 'jquery', 'underscore', 'backbone', 'marionette', 'natural', //'snowball',
'hbs!./record.tpl'
],function(sembr, $, _, Backbone, Marionette, natural, //Snowball,
template){
	var view = Marionette.ItemView.extend({
		template: template,

		events:{
			'keyup .action.description.entry': 'quickEntryKeyup'
		},

		ui:{
			'quickEntry': '.action.description.entry'
		},

		actionToPastTest: {
			'plant': ['planted'],
			'sow': ['sown', 'sowed', 'sew'],
			'transplant': ['transplanted']
		},

		initialize: function(options){
			if(!options.collections || _(['plants', 'places', 'plantings']).difference(_(options.collections).keys()).length  ){
        throw 'Plantings, places and plants collections must be passed to dashboard view.';
    	}
      this.collections = options.collections;

			this.actionRegex = {};
			_(this.actionToPastTest).each(function(tenses, action){
				this.actionRegex[action] = new RegExp('('+tenses.join('|')+')');
			}, this);
		},

		patterns: function(sentence){
			return sentence;
			
 
			this.$('.parsed').html(parsed);
		},

		interpret: function(sentence){
			//break the sentence down into chunks, processing from the start to the end
			_(this.startPatterns).each(function(pattern){

			});
		},

		quickEntryKeyup: function(ev){
			var val = this.ui.quickEntry.val();
			this.patterns(val);
			console.log(val);
		},

		serializeData: function(){
			var data = {
				actions: ['plant', 'sow', 'transplant']
			}

			return data;
		}
	});
	return view;
});

/*
I sowed Bed 5 with carrots
I sowed carrots in bed5
I planted 

I (actioned) ((plant)(,|and)?)+ in (place)
I (actioned) (quantity) (plant) in (place)
I (actioned) (place) with (plant)
I (actioned) (place) with (quantity)(plant)

I harvested 10 lettuces from bed 7

I mulched bed 5 with 2cm of compost
I sheet mulched bed 5 with cardboard

I fetilized with a chicken tractor for 7 days

(I\s)?

*/