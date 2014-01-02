define( ['sembr', 'backbone', 'sembr.ractiveview', 'underscore',
'rv!./timeline.tpl'],
function( sembr, Backbone, RactiveView, _,
template ){

  //linearScale and getPointsArray taken from graph example on ractivejs.org <3


  // this returns a function that scales a value from a given domain
  // to a given range. Hat-tip to D3
  linearScale = function ( domain, range ) {
    var d0 = domain[0], r0 = range[0], multipler = ( range[1] - r0 ) / ( domain[1] - d0 );

    return function ( num ) {
      return r0 + ( ( num - d0 ) * multipler );
    };
  };

  // this function takes an array of values, and returns an array of
  // points plotted according to the given x scale and y scale
  getPointsArray = function ( array, xScale, yScale, point ) {
    var result = array.map( function ( month, i ) {
      return xScale( i + 0.5 ) + ',' + yScale( month[ point ] );
    });

    // add the december value in front of january, and the january value after
    // december, to show the cyclicality
    result.unshift( xScale( -0.5 ) + ',' + yScale( array[ array.length - 1 ][ point ] ) );
    result.push( xScale( array.length + 0.5 ) + ',' + yScale( array[0][ point ] ) );

    return result;
  };

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
      'formatInterval': '_formatInterval',
      'dayIndex': '_getDayIndexFromDate'
    },

    initialize: function(options){
      var 
        ractive = this.ractive,
        resize
      ;

      this.options = _(options).defaults({group_by: 'plant'});

      if(!options.collections || _(['plants', 'places', 'plantings']).difference(_(options.collections).keys()).length  ){
        throw 'Plantings, places and plants collections must be passed to plantings/timeline view.';
      }

      var 
        days = this.generateDays(),
        intervals = this.getIntervals(days)
      ;


      this.set( 'plants', options.collections.plants );
      this.set( 'places', options.collections.places );
      this.set( 'plantings', options.collections.plantings );
      this.set( 'days', days );
      this.set( 'intervals', intervals )


      this.set( 'groups', this._group( options.collections.plantings, this.options.group_by ) );

      this.set( 'group_by', this.options.group_by);


      // because we're using SVG, we need to manually redraw
      // when the container resizes. You *can* use percentages
      // instead of pixel/em lengths, but not in transforms
      resize = function () {
        var width, height;

        width = ractive.nodes.plantings_svg_wrapper.clientWidth;
        height = ractive.nodes.plantings_svg_wrapper.clientHeight;

        ractive.set({
          width: width,
          height: height
        });
      };

      // recompute xScale and yScale when we need to
      ractive.observe({
        width: function ( width ) {
          console.log('Setting xScale: [0,%o] : [0,%o]', days.length, width);
          this.set( 'xScale', linearScale([ 0, days.length ], [ 20, width || 0 ]) );
        },
        height: function ( height ) {
          this.set( 'yScale', linearScale([ 0, plantings.length ], [ 20, height ]) );
        }
      });

      // update width and height when window resizes
      window.addEventListener( 'resize', resize );
      resize();
      this.on('show render', function(){
        console.log('VIEW HAS BEEN SHOWN/RENDERED, RESIZING!');
        resize();
      });
      //DomReady should have fired before the whole application
      //initialized, so I'm not sure why this is necessary, but it is...
      this.$( resize );
    },

    generateDays: function(){
      var days, today, start, end, current;
      days = [];
      today = new Date();
      //start the track a month behind the current month, just for context
      start = new Date();
      start.setMonth(today.getMonth()-1);
      //and set us a year and a half ahead for a good long view
      end = new Date();
      end.setMonth(today.getMonth()+18);
      current = new Date(start);
      while(current < end){
        current.setDate(current.getDate()+1);
        days.push( new Date(current) );
      }
      this.days = days;
      return days;
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


    getIntervals: function( days ){
      //always months for now...
      return this.intervals = _( days ).chain()
        .groupBy(function( day ){ return day.getFullYear()+'-'+(day.getMonth()+1)+'-01'; })
        .keys()
        .map(function( datestring ){ 
          /*var d = new Date(), ds = datestring.split('-'); 
          d.setYear( ds[0] ); 
          d.setMonth( ds[1] ); 
          return d; */
          return new Date( datestring );
        })
        .value();
    },

    _getDayIndexFromDate: function( days, iso_date_string ){
      var 
        day_strings = _(days).map(function( day ){ return day.getFullYear()+'-'+day.getMonth()+'-'+day.getDate(); });
        input_date = new Date(iso_date_string),
        reference_day_string = input_date.getFullYear()+'-'+input_date.getMonth()+'-'+input_date.getDate()
      ;
      //console.log(day_strings, reference_day_string);
      return day_strings.indexOf( reference_day_string );
    },

    _formatInterval: function( date ){
      var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
      return months[ date.getMonth() ];
    }

  });
});