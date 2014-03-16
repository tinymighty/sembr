define( ['sembr', 'backbone', 'sembr.ractiveview', 'underscore', 'backbone-undo', 'moment',
'rv!./timeline.tpl',
'less!trackr/resources/css/timeline'],
function( sembr, Backbone, RactiveView, _, BackboneUndo, moment,
template ){

  "use strict";

  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

  //linearScale and getPointsArray taken from graph example on ractivejs.org <3

  // this returns a function that scales a value from a given domain
  // to a given range. Hat-tip to D3
  function linearScale( domain, range ) {
    var d0 = domain[0], r0 = range[0], multipler = ( range[1] - r0 ) / ( domain[1] - d0 );

    return function ( num ) {
      return r0 + ( ( num - d0 ) * multipler );
    };
  };

  // this function takes an array of values, and returns an array of
  // points plotted according to the given x scale and y scale
  /*function getPointsArray( array, xScale, yScale, point ) {
    var result = array.map( function ( month, i ) {
      return xScale( i + 0.5 ) + ',' + yScale( month[ point ] );
    });

    // add the december value in front of january, and the january value after
    // december, to show the cyclicality
    result.unshift( xScale( -0.5 ) + ',' + yScale( array[ array.length - 1 ][ point ] ) );
    result.push( xScale( array.length + 0.5 ) + ',' + yScale( array[0][ point ] ) );

    return result;
  };*/

  var history = new Backbone.UndoManager;

  //ItemView provides some default rendering logic
  return RactiveView.extend( {
    template: template,

    attributes: {
      id: 'dashboard-planting-timeline',
      class: 'planting timeline'
    },

    events: {
      'setScale': '_setScale'
    },

    helpers: {
      'group': '_group',
      'formatDate': '_formatDate',
      'formatInterval': '_formatInterval',
      'dayIndex': '_getDayIndexFromDate',
      'plantingGroupLabel': '_plantingGroupLabelFromGroup',
      'plantingGroupIcon': '_plantingGroupIconFromGroup'
    },

    initialize: function(options){
      var 
        ractive = this.ractive,
        from,
        until
      ;

      this.options = _(options).defaults({group_by: 'plant'});

      if(!options.collections || _(['plants', 'places', 'plantings']).difference(_(options.collections).keys()).length  ){
        throw 'Plantings, places and plants collections must be passed to plantings/timeline view.';
      }

      history.register(options.collections);
      
      var baseDayWidth = 50;
      var currentWidth = $(window).width();
      var currentScale = 100; 

      //temporarily hard coded, these should actually be based on the extent of the planting dates...
      this.min_scale = 0.1;
      this.max_scale = 10; 

      this.set( 'zoomScale', currentScale );
      this.set( 'offset', currentWidth*-1.5);

      this.set( 'plants', options.collections.plants );
      this.set( 'places', options.collections.places );
      this.set( 'plantings', options.collections.plantings );

      this.set( 'groups', this._group( options.collections.plantings, this.options.group_by ) );
      this.set( 'group_by', this.options.group_by);

      var that = this;
      // because we're using SVG, we need to manually redraw
      // when the container resizes. You *can* use percentages
      // instead of pixel/em lengths, but not in transforms
      var redraw = function () {
        var 
          width = ractive.nodes.plantings_svg_wrapper.clientWidth, 
          height = ractive.nodes.plantings_svg_wrapper.clientHeight,
          num_days,
          intervals
        ;
        //until width and height are plus values value, don't bother drawing!
        if(!width || !height)
          return;

        console.log('Redrawing, wrapper width:', ractive.nodes.plantings_svg_wrapper.clientWidth);

        currentWidth = width;
        //centerDay = untilMoment.subtract('days', untilMoment.diff(from, 'days') / 2 );
        //ractive.set( 'zoomScale', currentScale );

        //generate enough time to fill 3 screens width (to provide drag-padding)
        num_days = (currentWidth*3) / (baseDayWidth * (currentScale));
        console.log('Calculated %o days: %o / ( %o * %o) ', num_days, currentWidth*3, baseDayWidth, currentScale);
        //split those days either side (HARDCODED TO TODAY FOR NOW!!!)
        from = moment().subtract('days', Math.floor(num_days/2) );
        until = moment().add('days', Math.ceil(num_days/2) );
        that.set('from', from);
        that.set('until', until);
        
        intervals = that.generateIntervals(from, until, currentScale);
        //that.set( 'center', center );
        that.set( 'intervals', intervals );
        //that.set( 'offset', )

        ractive.set( 'xScale', linearScale([ 0, num_days ], [ 0, currentWidth*3 ]) );
        ractive.set( 'yScale', linearScale([ 0, options.collections.plantings.length ], [ 0, currentScale ]) );

        ractive.set({
          width: width,
          height: height
        });
      };


      var 
        offset = 0
      ;

      // recompute xScale and yScale when we need to
      ractive.observe({
        //view scale is a number representing the amount of days which fit on screen
        viewScale: function ( scale ) {
          scale = Math.floor(scale); //coerce to integer
          //make sure the scale honors the current max_scale
          if(scale > this.max_scale){
            scale = this.max_scale;
          }
          redraw();
        },
        zoomScale: function( scale ){
          scale = Math.floor(scale) / 100;
          if(scale > this.max_scale){
            scale = this.max_scale;
          }
          if(scale < this.min_scale){
            scale = this.min_scale;
          }
          //don't redraw if zooming in
          /*if(scale > currentScale){
            currentScale = scale;
          }else{
            //we shouldn't redraw unless we've used up some of our left & right padding
            currentScale = scale;
            redraw();
          }*/

          currentScale = scale;
          redraw();
          
        },
        width: function ( width ){
          //this.viewScale( currentScale );
        },
        height: function ( height ){

        }
      });
      

      // update width and height when window resizes
      window.addEventListener( 'resize', redraw );

      this.on('show', redraw);
      //DomReady should have fired before the whole application
      //initialized, so I'm not sure why this is necessary, but it is...
      //this.$( resize );
      //redraw();
    },


    /**
     * Given an date range, return an array of intervals. 
     * This is used to provide a resolution to the timeline vie with the interval granularity 
     * updating based on the zoom extent
     * @param  Array days     An array of Date objects
     * @param  Number scale   The current view scale in days (ie. how many days fit the screen)
     * @return Array 
     */
    generateIntervals: function( from, to, scale ){
      console.warn('Regenerating intervals! From (%o) to (%o) at scale (%o)', from.format(), to.format(), scale);
      var 
        i,
        granularity, //the lowest current granularity (eg. days, weeks, months)
        breakpoints, 
        previous = {month:undefined}, //a cache for iterating
        inteval,
        intervals = [], 
        startIndex,
        intervalLength,
        dayMoment,
        toMoment = moment(to).startOf('day'),
        fromMoment = moment(from).startOf('day'),
        iMoment = moment(fromMoment).startOf('day'),
        label,
        diffs,
        skip
      ;

      //the percentage view-reduction breakpoints at which the level of granularity ends
      breakpoints = {
        days: 0.99, //stop showing  the view is zoomed out more than 500%
        weeks: 0.5, //over 100 days, don't show weeks
        months: 0.05, //over 600 days, don't show months
        //seasons: 3000, //over 3000 days, don't show seasons
        years: 0 //years are visible all the way up to the maximum zoom extent
      }
      
      //find the lowest granularity for the current scale
      _(breakpoints).find(function(refScale, granual){
        console.log('scale %o, refScale %o, granual %o', scale, refScale, granual);
        if( scale > refScale ){
          granularity = granual;
          return true;
        }
      });

      console.log("Scale: %o, Granularity: %o", scale, granularity);

      //calculate the number of days in the specified range
      //2014-01-01 to 2014-12-31 would output as 0 years, so the values
      //are pushed to their start and end limits, and then the end is ticked
      //forwards by one hour, so that 2014-12-31 becomes 2015-01-01, giving us the value
      //which we're actually interested in
      diffs = {
        days: moment(toMoment).endOf('day').add(1, 'hour').diff( moment(fromMoment).startOf('day'), 'days' ),
        weeks: moment(toMoment).endOf('week').add(1, 'hour').diff( moment(fromMoment).startOf('week'), 'weeks' ),
        months: moment(toMoment).endOf('month').add(1, 'hour').diff( moment(fromMoment).startOf('month'), 'months' ),
        years: moment(toMoment).endOf('year').add(1, 'hour').diff( moment(fromMoment).startOf('year'), 'years' )
      }
      
      console.log('Diffs %o', diffs);
      


      //build interval array
      //running multiple for loops isn't super efficient,
      //but it pays out when trying to render a scale of 2000 days
      //where a lot of time can be saved by only iterating through
      //larger time periods.



      
      /** 
       * This enables iterating over weeks and months instead of days when
       * the viewScale is too large to show days, while still using day numbers
       * as the scale.  For this reason it makes for a significant performance 
       * increase.
       */
      function getIndex(iMoment, intervalGranularity){
        return moment(iMoment).startOf(intervalGranularity).diff( fromMoment, 'days' );
      }

      console.log('Iterating over '+diffs[granularity]+' '+granularity);

      for( i=0; i < diffs[granularity]; i++){

        iMoment = moment(fromMoment).add(i, granularity).startOf(granularity);
        console.log(iMoment.format());
        //show days
        if( scale > breakpoints.days ){
          intervalLength = 1;
          if( scale > 2.3 ){
            label = iMoment.format('dddd Do');
          }
          else
          if( scale > 1.4){
            label = iMoment.format('ddd Do');
          }
          else
          if( scale > 0.7){
            label = iMoment.format('D');
          }
          else{
            label = '';
          }
          intervals.push({
            type: 'day',
            startIndex: i,
            endIndex: i+intervalLength,
            intervalLength: intervalLength,
            label: label, 
            date: iMoment.toDate()
          });
        }
  
        //show weeks
        if( scale > breakpoints.weeks ){
          //if the granularity is days, only add an interval
          //on the first day of each week
          //if it's weeks, just add an interval
          if( iMoment.day()===0 || granularity==='weeks'){
            
            startIndex = getIndex( iMoment, 'week' );
            intervalLength = 7;

            intervals.push({
              type: 'week',
              startIndex: startIndex,
              endIndex: startIndex + intervalLength,
              intervalLength: intervalLength,
              label: iMoment.format('w'), 
              date: iMoment.toDate()
            });
          }
          
        }

        //show months
        if( scale > breakpoints.months  ){
          if( previous.month!==iMoment.month() || granularity==='months' ){
            //ensure we don't render a month more than once when iterating
            //over days or weeks
            previous.month = iMoment.month(); 
            startIndex = getIndex( iMoment, 'month' );
            intervalLength = iMoment.daysInMonth();
            if( scale < 300){
              label = iMoment.format('MMMM');
            }else{
              label = iMoment.format('MMM');
            }
            intervals.push({
              type: 'month',
              startIndex: startIndex,
              endIndex: startIndex + intervalLength,
              intervalLength: intervalLength,
              label: label, 
              date: iMoment.toDate()
            });
          }
        }

        //seasons not implemented yet!

        //always show years
        if( iMoment.dayOfYear() === 1 ){
          if( iMoment.dayOfYear()===1 || granularity==='years' ){
            startIndex = getIndex( iMoment, 'year' );
            intervalLength = iMoment.isLeapYear() ? 366 : 365;
            intervals.push({
              type: 'year',
              startIndex: startIndex,
              endIndex: startIndex + intervalLength,
              intervalLength: intervalLength,
              label: iMoment.format('YYYY'), 
              date: iMoment.toDate()
            });
          }
        }


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


    /*
     * Get the index of the date in the days array, if present
     * otherwise -1
     */
    _getDayIndexFromDate: function( iso_date_string ){
      var 
        from = this.get('from'),
        until = this.get('until'),
        referenceMoment = moment( iso_date_string ),
        diff = referenceMoment.diff( from, 'days' )
      ;
      //console.log('getDayIndexFromDate: ref(%o), until(%o), diff in days(%o)', referenceMoment.format(), until.format(), diff);
      return diff;
    },

    _formatDate: function( date, format ){
      return moment(date).calendar();
    },

    _formatInterval: function( date ){
      return months[ date.getMonth() ];
    },

    /*
     * Ractive Helper. Get a planting group icon based on the group provided.
     */
    _plantingGroupIconFromGroup: function( group ){
      if( this.get('group_by') === 'plant' ){
        return '';
      }
      else 
      if( this.get('group_by') === 'place'){
        return '';
      }
    },

    _plantingGroupLabelFromGroup: function( group ){
      if( this.get('group_by') === 'plant' ){
        return group.at(0).get('plant').get('use_name');
      }
      else 
      if( this.get('group_by') === 'place'){
        return group.at(0).get('place').get('name');
      }  
    }, 

    _setScale: function( event ){
      console.log("Setting scale via button click", event.node);
      this.set('zoomScale', event.node.value );
    }


  });
});