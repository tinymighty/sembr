define( ['sembr', 'backbone', 'sembr.ractiveview', 'jquery', 'underscore', 'backbone-undo', 'moment',
'drop',
'rv!./timeline.tpl',
'less!./timeline'],

/**
 * The Timeline view renders plantings as a graph with a horiztonal time axis, 
 * which can be scrolled to move through time, and zoomed in and out to change
 * the granularity.
 */
function( sembr, Backbone, RactiveView, $, _, BackboneUndo, moment,
Drop,
template ){

  "use strict";

  /**
   * Given a domain and a range, returns a function which will scale
   * a value from the domain to the range.  Crude example:
   * domain 1-100
   * range 1-10
   * input 50
   * output 5
   */
  function linearScale( domain, range ) {
    var d0 = domain[0], r0 = range[0], multipler = ( range[1] - r0 ) / ( domain[1] - d0 );

    return function ( num ) {
      //console.log( 'Calculating linear scale: num(%o), multiplier(%o), domain(%o), range(%o)', num, multipler, domain, range);
      return r0 + ( ( num - d0 ) * multipler );
    };
  }

  /**
   * Some core variables
   */
  var 
    groupableBy = ['plant', 'place'],
    groupBy = 'plant',
    plantingHeight = 30,
    dayWidth = 10,  //the width for a day at scale factor 1
    defaultScale = 1,
    y_offset = 100, //the initial vertical offset for planting groups
    planting_group_spacing = 30, //the spacing between planting groups
    previous_group_y = y_offset, //used when calculating vertical group positions
    previous_group_height = 0 //used when calculating vertical group positions
  ;
  
  
  /**
   * Ractive decorator.
   * Show a tooltip when hovering over actions
   */
  var actionDecorator = function( node ){
    console.log('Decorating planting action: %o', node._ractive.root.get(node._ractive.keypath));
    var
      model = node._ractive.root.get(node._ractive.keypath),
      action_type = model.action_type,
      from_moment = moment(model.from),
      until_moment = moment(model.until)
    ;
    var drop = new Drop({
      target: node,
      position: 'top middle',
      content: action_type + '<br>' + from_moment.format('Do MMM') + ' - ' + until_moment.format('Do MMM'),
      openOn: 'hover',
      classes: 'drop-theme-arrows-bounce-dark'
    });

    return {
      teardown: function(){
        drop.destroy();
      }
    };
  };
  
  /**
   * Ractive decorator.
   * Set up the filter field as a selectize widget.
   */
  var filterFieldDecorator = function( node ){
    var 
      self = this,
      options = []
    ;
    sembr.trackr.plants.each(function( plant ){
      options.push({
        label: 'plant',
        value: 'plant/'+plant.get('id'), 
        text: plant.get('name') || plant.get('use_name')
      });
    })
    $(node).selectize({
      create: false,
      createOnBlur: false,
      //maxItems: 1,
      options: options
    });

    return {
      teardown: function(){
        node.selectize.destroy();
      }
    }
  }
  
  
  /*
  * Ractive Helper. 
  Get a planting group icon based on the group provided.
  */
  var plantingGroupLabelFromGroup = function( group ){
   return group.name;
  };
  


  return RactiveView.extend( {
    template: template,

    attributes: {
      id: 'dashboard-planting-timeline',
      class: 'planting timeline'
    },

    data: {
      'offset': 0,
      'zoomScale': 1,
      'showDays': false,
      'formattingBreakpoint':0,
      'plantingHeight': plantingHeight
    },

    decorators: {
      action: actionDecorator,
      filterBy: filterFieldDecorator
    },

    events: {
      'setScale': '_setScale',
      'plantingClick': '_plantingClickEvent'
    },

    helpers: {
      'xScale': function(){ return 0; }, //temporary xScale object, it'll be overridden when rendered
      'group': '_group',
      'formatDate': '_formatDate',
      'formatDay': '_formatDay',
      'formatMonth': '_formatMonth',
      'dayIndex': '_getDayIndexFromDate',
      'plantingGroupLabel': plantingGroupLabelFromGroup,
      'plantingGroupIcon': '_plantingGroupIconFromGroup',
      'echoInterval': function(){
          console.log('Drawing intervals, yo.');
      },
      'verticalGroupPos': function( index ){
        previous_group_y = previous_group_y + previous_group_height + (index===0 ? 0 :  planting_group_spacing); 
        previous_group_height = this.groups[index].models.length * plantingHeight;
        return previous_group_y;
      },
    },

    observers: {
      'zoomScale': 'zoomScaleObserver',
      'width': 'widthObserver',
      'height': 'heightObserver',
      'offset': 'offsetObserver',
      'filterBy': 'filterByObserver',
      'formattingBreakpoint': 'formattingBreakpointObserver',
      'xScale': 'xScaleObserver',
      'intervals': 'intervalsObserver'
    },   

    min_scale: 0.00001,
    max_scale: 10, 

    _beforeRactive: function( options ){
      this.options = options = _(options).defaults({group_by: 'plant'});
      
      this.data.plants = options.collections.plants;
      this.data.places = options.collections.places;
      options.collections.plantings.sortBy('planted_from');
      this.groups = this.data.groups = this.groupPlantings( options.collections.plantings, groupBy );
      this.data.group_by = options.group_by;

      this.data.intervals = [];//this.generateIntervals(this.from, this.until, this.scale)

      this._ractiveOptions.magic = false;
    },

    initialize: function( options ){
      var 
        ractive = this.ractive,
        from,
        until
      ;

      if(!options.collections || _(['plants', 'places', 'plantings']).difference(_(options.collections).keys()).length  ){
        throw 'Plantings, places and plants collections must be passed to plantings/timeline view.';
      }

      this.history = new Backbone.UndoManager();
      this.history.register(options.collections);
      
      this.group_by = options.group_by;
      this.drawn = false;
      this.baseWidth = 0;
      this.screenWidth = $(window).width;
      this.width = this.baseWidth;
      this.numDays = 0;

      this.scale = defaultScale;

      this.offset = 0;

      //find the earliest and latest plantings, or just show 1 year if there are no plantings
      if( options.collections.plantings.length ){
        this.earliestDate = options.collections.plantings.min(function(p){
          return new Date(p.get('planted_from'));
        }).get('planted_from');
        this.latestDate = options.collections.plantings.max(function(p){
          return new Date(p.get('planted_until'));
        }).get('planted_until');
      }else{
        console.log( 'No plantings found.' );
        this.earliestDate = moment().subtract(6, 'months').toDate();
        this.latestDate   = moment().add(6, 'months').toDate();
      }

      console.log('Earliest (%o) and latest (%o) plantings', new Date(this.earliestDate), new Date(this.latestDate) );

      if(moment(this.latestDate).diff(this.earlestDate, 'years') > 5){
        sembr.error('Woah, trying to display 5 years of data. Performance is still too sucky for that, sorry!');
      }


      // update width and height when window resizes
      $(window).resize( _(this.onResize).bind(this) );

      this.on('render show', _(this.render).bind(this) );
      //DomReady should have fired before the whole application
      //initialized, so I'm not sure why this is necessary, but it is...
      $( _(this.onReady).bind(this) );

    },

    /**
     * Handler for the render event
     */
    render: function(){
      console.warn("RENDER CALLED!");
      this.draw();
    },

    onReady: function(){
      this.startScrollListeners();
      this.onResize();
      this.render();
    },

    draw: function ( force ) {
      console.log('Draw called', !!force);

      var 
        containerWidth = $(this.ractive.nodes.plantings_svg_wrapper).width(), 
        containerHeight = this.ractive.nodes.plantings_svg_wrapper.clientHeight,
        intervals
      ;
      //until width and height are plus values value, don't bother drawing!
      if( !containerWidth && !force ){
        console.warn('Draw called before element %o has width (%s)!', this.ractive.nodes.plantings_svg_wrapper, $(this.ractive.nodes.plantings_svg_wrapper).width());
        return;
      }
      
      if( this.drawn && containerWidth === this.screenWidth && !force){
        console.warn('Draw was called, but the screen width hasnt changed since it was last drawn. Pass the force argument as true to override this.');
        return;
      }

      this.drawn = false;

      this.screenWidth = containerWidth;
      this.baseWidth = this.width = containerWidth * 3;

      console.log('Redrawing scroll width(%o) for screen width (%o)', this.width, this.screenWidth);


      this.from = moment( this.earliestDate ).startOf('day').subtract(3, 'months');
      this.until = moment( this.latestDate ).endOf('day').add(3, 'months');
      this.numDays = this.until.diff( this.from, 'days');
      
      console.log('Calculated %o days based on planting dates with 3 months padding either side', this.numDays);

      intervals = this.generateIntervals(this.from, this.until, this.scale);
      console.log('Setting xScale from domain(%o) to range(%o)', [ 0, this.numDays ], [ 0, this.baseWidth ]);

      //this.set( 'center', center );
      this.set( {
          'intervals': intervals,
          'xScale': linearScale([ 0, this.numDays ], [ 0, this.baseWidth ])
      });

      
      this.drawn = true;
    },

    onResize: function(){
      var 
        containerWidth = this.ractive.nodes.plantings_svg_wrapper.clientWidth, 
        containerHeight = this.ractive.nodes.plantings_svg_wrapper.clientHeight
      ;
      if( !this.drawn || !containerWidth || !containerHeight ){
        return;
      }
      this.set({
        width: containerWidth,
        height: containerHeight
      });
    },
    
    intervalsObserver: function( intervals ){
      console.log('intervals changed! %o', intervals);
    },
    
    xScaleObserver: function( xScale ){
        console.log('xScale changed!');
    },

    /**
     * Width observer. When the width is changed, check whether we need to redraw.
     */
    widthObserver: function ( width ){
      if(!width){
        return;
      }
      this.width = width;
      console.log("Setting width", width);
      if(width*0.9 > this.baseWidth){
        this.draw();
      }
    },
    heightObserver: function ( height ){

    },
    /**
     * Make sure offset never exceeds the bounds of the content
     */
    offsetObserver: function( offset ){
      //console.log('Offset change observed: ', offset);
      //console.log('Offset right side is %o, screenWidth is %o', offset+this.width, this.screenWidth);
      if(offset+this.width < this.screenWidth ){
        this.set('timeline_x', this.screenWidth-this.width );
        return;
      }
      if(offset > 0){
        this.set('timeline_x', 0);
        return;
      }
      this.set('timeline_x', offset);
    },
    /**
     * formattingBreakpoint is updated whenever
     */
    formattingBreakpointObserver: function(){
      console.log('Formatting breakpoint changed!');
    },

    /**
     * Resize the view according to the current scale factor
     */
    zoomScaleObserver: function( scale ){
      if(!scale){
        console.warn("Invalid value for scale: ", scale);
        return;
      }

      //this hard crops the scale to the min and max
      //it would be good to animate this, to show a bounce-back to the min and max
      //to provide visual feedback to the user that their input was understood
      //but not possible
      if(scale > this.max_scale){
        scale = this.max_scale;
      }
      if(scale < this.min_scale){
        scale = this.min_scale;
      }

      this.scale = scale;
      console.log('Scale set to ', scale);

      //make sure the view has drawn first!
      if(!this.drawn){
        console.log('Scale set, but view has not yet been drawn.');
        return;
      }
      //when the left & right draw padding is close to used up,
      //redraw to generate more padding
      console.log('currentWidth %o : screenWidth %o = %o (baseWidth %o)', this.width, this.screenWidth, this.width/this.screenWidth, this.baseWidth);
      /*if( currentWidth / screenWidth < 1.2  ){
        redraw();
      }*/

      //console.log('Recalculating width: %o x %o = %o', baseWidth, scale, baseWidth*scale);

      //if the timeline width is wider than the screen, zoom it
      if( this.baseWidth * this.scale > this.screenWidth){
        var center = this.offset-(this.screenWidth/2);
        var percentOffset = center/this.width;
        //console.log('Center is %o and center factor is %o', center, percentOffset);
        this.width = this.baseWidth * this.scale;
        //scale around the current center

        this.offset = ((this.width*percentOffset) + this.screenWidth/2);
        this.set( 'offset', this.offset );
        this.set( 'xScale', linearScale([ 0, this.numDays ], [ 0, (this.width) ]) );
      }else{
        //it would be great to show a subtle animation here to show the
        //zoom draw out and bounce back, to indicate that it's at the maximum
        //zoom extent
      }

      var intervalDisplayBreakpoints = {
        days: 8, //stop showing  the view is zoomed out more than 500%
        weeks: 0.3, //over 100 days, don't show weeks
        months: 0, //always show months
        //seasons: 3000, //over 3000 days, don't show seasons
        years: 0 //years are visible all the way up to the maximum zoom extent
      }

      /**
       * Until we can find a performant way of rendering days, this is out.
       */
      /*if(scale > intervalDisplayBreakpoints.days){
        this.set('showDays', true);
      }else{
        this.set('showDays', false);
      }*/

      //console.log('Checking formatting breakpoints', this.formattingBreakpoints);
      //console.log('Checking formatting breakpoints', this.currentFormattingBreakpoints);
      _(this.formattingBreakpoints).each(function( breakpoints, interval ){
        var bp = _(breakpoints).find(function(bp){
          if( scale > bp ){
            return true;
          }
        });

        if( bp!==undefined && this.currentFormattingBreakpoints[interval]!==bp){
          this.currentFormattingBreakpoints[interval] = bp;
          console.warn("Expensive operation: Setting breakpoint to %o", bp);
          //trigger a redraw of all interval formatting
          //this value isn't directly used, it's just a way to trigger a re-draw
          this.set('formattingBreakpoint', scale);
        }
      }, this);
      
    },
    
    
    /** 
     * When the filter field changes, update the planting groups accordingly
     */
    filterByObserver: function(){
      
    },
    

    /**
     * Attach listeners for Scroll Wheel events
     */
    startScrollListeners: function(){
      console.log("Attaching scroll listeners.");
      this.$el[0].addEventListener('DOMMouseScroll', _(this.onScrollWheel).bind(this) ,false);
      this.$el[0].addEventListener('mousewheel',_(this.onScrollWheel).bind(this),false);
    },


    /**
     * Scroll wheel/track pad scroll event handler
     * 
     * Tries to balance out the various ways scroll deltas are set accross devices
     * and browsers, then sets the current scale and offset accordingly
     */ 
    onScrollWheel: function( evt ){
      //for standard mouse wheels, try to balance out the various browser deltas
      var delta = evt.wheelDelta ? evt.wheelDelta/40 : evt.detail ? -evt.detail : 0;

      //if we've got a horizontal delta, just take it at value
      if(evt.wheelDeltaX !== undefined ){
        this.offset += evt.wheelDeltaX;
        //if there's no horizontal scrolling, accept vertical as a zoom
        if(evt.wheelDeltaY && evt.wheelDeltaX===0){
          this.set('zoomScale', this.scale + (evt.wheelDeltaY/500) );
        }
      }else{
        //console.log('Scroll delta!', delta);
        this.offset += delta*10;
      }
      //ensure offset doesn't go out of bounds...
      if(this.offset+this.width < this.screenWidth ){
        this.offset = this.screenWidth-this.width;
      }
      if(this.offset > 0){
        this.offset = 0;
      }
      this.set('offset', this.offset);
      return evt.preventDefault() && false;
    },

    /**
     * Given a date range and the current view scale, return an array of intervals. 
     * 
     * Used to provide a resolution to the timeline vie with the interval granularity 
     * updating based on the zoom extent
     * 
     * @param  Date from      The starting date of the range
     * @param  Date to        The ending date of the range
     * @param  Number scale   The current view scale
     * @return Array 
     */
    generateIntervals: function( from, to, scale ){
      console.warn('Regenerating intervals! From (%o) to (%o) at scale (%o)', from.format(), to.format(), scale);
      var 
        i,
        breakpoints, 
        previous = {week:undefined, month:undefined, year:undefined}, //a cache for iterating
        intervals = [], 
        startIndex,
        intervalLength,
        toMoment = moment(to).startOf('day'),
        fromMoment = moment(from).startOf('day'),
        iMoment = moment(fromMoment).startOf('day'),
        diffs
      ;

      //the percentage view-reduction breakpoints at which the level of granularity ends
      breakpoints = {
        days: 0.99, //stop showing  the view is zoomed out more than 500%
        weeks: 0.5, //over 100 days, don't show weeks
        months: 0.05, //over 600 days, don't show months
        //seasons: 3000, //over 3000 days, don't show seasons
        years: 0 //years are visible all the way up to the maximum zoom extent
      };

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
      };
      
      console.log('Diffs %o', diffs);
      

      function getIndex(iMoment, intervalGranularity){
        return moment(iMoment).startOf(intervalGranularity).diff( fromMoment, 'days' );
      }

      console.log('Iterating over '+diffs.days+' days');

      for( i=0; i < diffs.weeks; i++){

        iMoment = moment(fromMoment).add(i, 'week');
        //console.log(iMoment.format());

        //add days

        /*intervals.push({
          type: 'day',
          startIndex: i,
          endIndex: i+1,
          intervalLength: 1,
          labels: [iMoment.format('dddd Do'), iMoment.format('ddd Do'), iMoment.format('D'), ''], 
          date: iMoment.toDate()
        });*/
  
        if( previous.week!==iMoment.week()  ){
          previous.week = iMoment.week(); 
          startIndex = getIndex( iMoment, 'week' );
          intervalLength = 7;

          intervals.push({
            type: 'week',
            startIndex: startIndex,
            endIndex: startIndex + intervalLength,
            intervalLength: intervalLength,
            date: iMoment.toDate(),
            moment: iMoment
          });
        }
          

        //add months
        if( previous.month!==iMoment.month()  ){
          //ensure we don't render a month more than once when iterating
          //over days or weeks
          previous.month = iMoment.month(); 
          startIndex = getIndex( iMoment, 'month' );
          intervalLength = iMoment.daysInMonth();
          intervals.push({
            type: 'month',
            startIndex: startIndex,
            endIndex: startIndex + intervalLength,
            intervalLength: intervalLength,
            date: iMoment.toDate(),
            moment: iMoment
          });
        }

        //seasons not implemented yet!

        //add months
        if( previous.year!==iMoment.year()  ){
          previous.year = iMoment.year(); 
          startIndex = getIndex( iMoment, 'year' );
          intervalLength = iMoment.isLeapYear() ? 366 : 365;
          intervals.push({
            type: 'year',
            startIndex: startIndex,
            endIndex: startIndex + intervalLength,
            intervalLength: intervalLength,
            date: iMoment.toDate(),
            moment: iMoment
          });
        }


      }
      console.log("Generated intervals", intervals);
      return intervals;
    },


    /**
     * Given a Plantings collection and a property to group by, returns
     * Collections of Planting models grouped by that property
     * @param  {Plantings Collection} plantings A Plantings Collection
     * @param  {String} by        Property name to group by
     * @return {Array}           An array of Collections
     */
    groupPlantings: function( plantings, by ){
      var 
        groups = [], 
        grouped, 
        getGroupName
      ;
      if( by===undefined){
        by = groupBy;
      }else{
        if( _(groupableBy).indexOf(by) > -1){
          groupBy = by;
        }else{
          by = groupBy;
        }
      }

      grouped = plantings.groupBy( function( model ){
        switch( by ){
          case 'plant':
            return model.get('plant_id');
          case 'place':
            return (model.place()) ? model.get('place_id') : null; //place can be undefined
        }
      }.bind(this));

      getGroupName = function( member ){
        switch( by ){
          case 'plant':
            return member.plant().get('use_name');
          case 'place':
            return (member.place()) ? member.place().get('name') : 'Unspecified';
        }
      };

      _(grouped).each(function(models, id){
        //models = new sembr.trackr.collections.Plantings(models);
        /*models.comparator = function(model){
          return model.get('planted_from');
        }
        models.sort();*/
        groups.push( { name: getGroupName( models[0] ), models: models });
      }.bind(this));

      return groups;

    },


    /*
     * Get the index of the date in the days array, if present
     * otherwise -1
     */
    _getDayIndexFromDate: function( iso_date_string, fallback, fallback_adjustment ){
      var 
        from = this.from,
        referenceMoment = moment( iso_date_string || fallback ).add(fallback_adjustment),
        diff = referenceMoment.diff( from, 'days' )
      ;
      //console.log('getDayIndexFromDate: ref(%o), until(%o), diff in days(%o)', referenceMoment.format(), until.format(), diff);
      return diff;
    },

    _formatDate: function( date, format ){
      return moment(date).calendar();
    },

    formattingBreakpoints:{
      month: [0.8, 0],
      day: [6,5,4]
    },
    currentFormattingBreakpoints: {
      month: 0, 
      day: 0
    },

    _formatMonth: function( m, formattingBreakpoint ){
      console.log("RENDERING MONTH FORMATs", m.format(), this.scale, formattingBreakpoint);
      if(this.scale > this.formattingBreakpoints.month[0]){
        return m.format('MMMM');
      }
      else
      if(this.scale > this.formattingBreakpoints.month[1]){
        return m.format('MMM');
      }
    },

    _formatDay: function( m, addDays, formattingBreakpoint ){
      console.log('RE-RENDERING DAY FORMATS!', this.scale, formattingBreakpoint);
      var dayMoment = moment(m).add(1, addDays);
      if( this.scale > this.formattingBreakpoints.day[0] ){
        return dayMoment.format('dddd');
      }
      else
      if( this.scale > this.formattingBreakpoints.day[1] ){
        return dayMoment.format('ddd');
      }
      else
      if( this.scale > this.formattingBreakpoints.day[2] ){
        ///only show the last two days of the week, to reduce clutter
        if(dayMoment.day()===5 || dayMoment.day()===6){
          return dayMoment.format('dd');
        }
      }else{
        return '';
      }
    },
    
     
    _plantingGroupIconFromGroup: function( group ){
      if( this.group_by === 'plant' ){
        return 'iconclass-plant-group';
      }
      else 
      if( this.group_by === 'place'){
        return 'iconclass-place-group';
      }
    },

    _setScale: function( event ){
      console.log("Setting scale via button click", event.node);
      this.set('zoomScale', event.node.value );
    },

    _plantingClickEvent: function( event ){
      sembr.trackr.editPlanting( event.context.get('id') );
    },


    close: function(){
      console.warn('Closing Timeline View!');
      //RactiveView.prototype.close.apply(this);
    }


  });
});