define( ['sembr', 'backbone', 'sembr.ractiveview', 'underscore', 'backbone-undo', 'moment',
'rv!./timeline.tpl',
'less!'],
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
        resize
      ;

      this.options = _(options).defaults({group_by: 'plant'});

      if(!options.collections || _(['plants', 'places', 'plantings']).difference(_(options.collections).keys()).length  ){
        throw 'Plantings, places and plants collections must be passed to plantings/timeline view.';
      }

      history.register(options.collections);
      

      var currentWidth = $(window).width();
      var currentScale = 30; 

      this.set( 'plants', options.collections.plants );
      this.set( 'places', options.collections.places );
      this.set( 'plantings', options.collections.plantings );

      this.set( 'groups', this._group( options.collections.plantings, this.options.group_by ) );
      this.set( 'group_by', this.options.group_by);

      var that = this;
      //generate the day scale according to a center day and a scale
      function scaleDays( center, scale ){
        var 
          from = moment(center).subtract('days', scale/2),
          until = moment(center).add('days', scale/2),
          days,
          intervals
        ;
        days = that.generateDays(from.toDate(), until.toDate());
        intervals = that.generateIntervals(days, currentScale);
        that.set( 'days', days );
        that.set( 'intervals', intervals );
      }

      // because we're using SVG, we need to manually redraw
      // when the container resizes. You *can* use percentages
      // instead of pixel/em lengths, but not in transforms
      var redraw = function () {
        var 
          width = ractive.nodes.plantings_svg_wrapper.clientWidth, 
          height = ractive.nodes.plantings_svg_wrapper.clientHeight
        ;

        console.log('window.resize triggered, resizing', ractive.nodes.plantings_svg_wrapper.clientWidth);

        currentWidth = width;

        scaleDays( moment().startOf('day').toDate(), currentScale );
        ractive.set( 'viewScale', currentScale );

        ractive.set( 'xScale', linearScale([ 0, currentScale ], [ 0, currentWidth ]) );
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
          var 
            center, 
            centerIndex, 
            centerDay
          ;
          //find the current center of the timeline, we'll scale around this point
          center = currentWidth/2;
          //reverse the linear scale to find index from width
          centerIndex = Math.floor( linearScale([0, currentWidth], [0, currentScale])(center) );
          centerDay = this.get('days')[centerIndex];
          //regenerate days and intervals for the new scale
          scaleDays( centerDay, scale );
          currentScale = scale;
          //recalculate the linear scales for the new day scale
          this.set( 'xScale', linearScale([ 0, scale ], [ 0, currentWidth]) );
          this.set( 'yScale', linearScale([ 0, options.collections.plantings.length ], [ 0, scale ]) );
        },
        width: function ( width ){
          this.viewScale( currentScale );
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

    generateDays: function(from, til){
      var days, start, end, current;
      days = [];
      //start the track a month behind the current month, just for context
      start = new Date(from);
      //and set us a year and a half ahead for a good long view
      end = new Date(til);
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

    /**
     * Given an array of days, return an array of intervals (currently
     * hardcoded to months). 
     * This is used to provide a resolution to the timeline view, to eventually
     * encompass the ability to zoom in and out, with the interval granularity 
     * updating based on the zoom extent
     * @param  Array days     An array of Date objects
     * @param  Number scale   The current view scale in days (ie. how many days fit the screen)
     * @return Array 
     */
    generateIntervals: function( days, scale ){

      var 
        inteval,
        intervals = [], 
        intervalLength,
        dayMoment,
        label
      ;
      _( days ).each( function( day, i ){

        dayMoment = moment(day).startOf('day');

        //console.log(dayMoment);

        switch(true){
          //show days
          case scale < 30:
            intervalLength = 1;
            intervals.push({
              type: 'day',
              startIndex: i,
              endIndex: i+intervalLength,
              intervalLength: intervalLength,
              label: dayMoment.format('ddd'), 
              date:day
            });

          //show weeks
          case scale < 100:
            //if it's the first day of the week, add an interval
            if( dayMoment.isSame( moment(day).startOf('week') ) ){
              intervalLength = dayMoment.endOf('week').diff( moment(day).startOf('week'), 'days' );
              intervals.push({
                type: 'week',
                startIndex: i,
                endIndex: i+intervalLength,
                intervalLength: intervalLength,
                label: dayMoment.format('w'), 
                date:day
              });
            }

          //show months
          case scale < 600:
            //if it's the first day of the month, add an interval
            if( dayMoment.isSame( moment(day).startOf('month') ) ){
              if( scale < 300){
                label = dayMoment.format('MMM');
              }else{
                label = dayMoment.format('MMMM');
              }
              intervalLength = dayMoment.daysInMonth();
              intervals.push({
                type: 'month',
                startIndex: i,
                endIndex: i+intervalLength,
                intervalLength: intervalLength,
                label: label, 
                date:day
              });
            }

          //show seasons
          case scale < 2000:
            //if it's the first day of a quarter, add an interval
            if( moment(day).quarter() !== moment(day).subtract('d', 1).quarter() ){
              //find a way to calculate the length of a quarter
              intervalLength = dayMoment.daysInMonth();
            }

          //show year
          default:
            //if it's the first day of a year, add an interval
            if( dayMoment.isSame( moment(day).startOf('year') )  ){
              intervalLength = dayMoment.isLeapYear ? 366 : 365;
              intervals.push({
                type: 'month',
                startIndex: i,
                endIndex: i+intervalLength,
                intervalLength: intervalLength,
                label: dayMoment.format('YYYY'), 
                date:day
              });
            }
          break;
        }
        /*
        if(day.getDate()===1 || i===0){
          intervalLength = moment(day).daysInMonth();
          intervals.push({
            startIndex: i,
            endIndex: i+intervalLength,
            intervalLength: intervalLength,
            label:this._formatInterval( day ), 
            date:day
          });
        }*/
      }, this);

      return intervals;
    },

    /*
     * Get the index of the date in the days array, if present
     * otherwise -1
     */
    _getDayIndexFromDate: function( iso_date_string ){
      var days, ref, reference_day_string, index = -1;
      try{
        days = this.get('days');
        ref = new Date( iso_date_string );
        _( days ).each( function( day, i){
          if( 
            day.getFullYear() === ref.getFullYear()
            && day.getMonth() === ref.getMonth()
            && day.getDate() === ref.getDate() 
          ){
            index = i;
          }
        });
      }catch(err){
        console.error(err);
      }
      return index;
    },

    _formatDate: function( date, format ){
      //for now format is ignored...
      if(! (date instanceof Date) ){
        date = new Date(date);
      }
      //return date.getFullYear()+'.'+months[date.getMonth()]+'.'+date.getDate();
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


  });
});