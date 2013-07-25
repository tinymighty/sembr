define(['jquery', 'bootstrap'], function($, Bootstrap) {

  var TypeDown = function(el, opts) {
      var options = this.options = $.extend({}, {
        minLength: 0,
        items: 1000
      }, opts);

      var typeahead = this.typeahead = $(el).find('input').typeahead(options).data('typeahead');
        
      typeahead.$menu.addClass('dropdown-scroll');

      $(el).find('[data-trigger=dropdown]').click(function(ev) {
        //console.log(typeahead.shown);
        if(typeahead.shown) {
          typeahead.hide();
        } else {
          //typeahead.show();
          /*
            Bug: If the user uses the keyboard to navigate and select an item, then clicks the button, it still shows the list based on their original entry
            not the updated text. We need to refresh the list on show...
            */   
          
          //hide other dropdowns when this one is clicked
          for(var i = 0, l = TypeDown.instances.length; i < l; i++) {
            if(TypeDown.instances[i] !== this) TypeDown.instances[i].typeahead.hide();
          }
          //bootstrap typeahead doesn't define the query until something is typed, so we need to make sure it's defined
          if(typeahead.query === undefined) typeahead.query = '';
          //bootstrap typeahead won't populate the list if the field is empty, so we have to do it manually
          //the process method calls the show method
          typeahead.process(_(options.source).isFunction() ? options.source() : options.source);
        }
        
        ev.preventDefault();
        return false;
      });

      $(window).click(function(ev) {
        if(ev.target !== el) {
          typeahead.hide();
        }
      });

      TypeDown.instances.push(this);

    }

  TypeDown.instances = [];


  $.fn.typedown = function(option) {
    return this.each(function() {
      var $this = $(this),
        data = $this.data('typeahead-dropdown'),
        options = typeof option == 'object' && option
      if(!data) $this.data('typeahead-dropdown', (data = new TypeDown(this, options)))
      if(typeof option == 'string') data[option]()
    })
  }
  
  return TypeDown;

});