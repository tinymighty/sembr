define( ['sembr', 'backbone', 'sembr.ractiveview', 'underscore',
'text!./timeline.tpl.html'],
function( sembr, Backbone, RactiveView, _,
template ){
  //ItemView provides some default rendering logic
  return RactiveView.extend( {
    template: template,

    attributes: {
      id: 'dashboard-planting-timeline',
      class: 'planting timeline'
    },

    events: {

    },

    helpers: {
      'group': '_group',
      'formatInterval': '_getMonthFromDate'
    },

    initialize: function(options){
      this.options = _(options).defaults({group_by: 'plant'});
      console.log('Timeline init', options);
      if(!options.collections || _(['plants', 'places', 'plantings']).difference(_(options.collections).keys()).length  ){
        throw 'Plantings, places and plants collections must be passed to plantings/timeline view.';
      }

      console.log("THA DATA", this.data);

      this.set( 'plants', options.collections.plants );
      this.set( 'places', options.collections.places );
      this.set( 'plantings', options.collections.plantings );
      this.set( 'intervals', this.generateIntervals() );

      this.set( 'groups', this._group( options.collections.plantings, this.options.group_by ) );

      this.set( 'group_by', this.options.group_by)
    },

    generateIntervals: function(){
      var intervals, today, start, end, current;
      intervals = [];
      today = new Date();
      //start the track a month behind the current month, just for context
      start = new Date();
      start.setMonth(today.getMonth()-1);
      //and set us a year and a half ahead for a good long view
      end = new Date();
      end.setMonth(today.getMonth()+18);
      current = new Date(start);
      while(current < end){
        current.setMonth(current.getMonth()+1);
        intervals.push( new Date(current) );
      }
      return intervals;
    },

    _groupableBy: ['plant', 'place'],


    _group: function( plantings, by ){
      var 
        groups = [], 
        grouped, 
        getGroupName
      ;

      this.set('group_by', by);

      grouped = plantings.groupBy( function( model ){
        switch( by ){
          case 'plant':
            return model.plant().get('id');
          case 'place':
            return (model.plant()) ? model.plant().get('id') : null; //place can be undefined
            break;
        }
      }.bind(this));

      function getGroupName( member ){
        switch( by ){
          case 'plant':
            return member.plant().get('use_name');
          case 'place':
            return (member.place()) ? member.place().get('name') : 'Unspecified';
        }
      };

      _(grouped).each(function(models, id){
        groups.push( { name: getGroupName( models[0] ), models: models, group: plantings.get(id) });
      }.bind(this));

      return groups;

    },

    _getMonthFromDate: function( date ){
      var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
      return months[ date.getMonth() ]+', '+date.getYear();
    }

  });
});