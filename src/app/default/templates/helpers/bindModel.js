define(['handlebars'], function ( Handlebars ){
  function bindModel ( context, options ) {
    // Assume it's a string for simplicity.
    return '<span data-model="'+context+'">{{'+context+'}}</span>';
  }

  Handlebars.registerHelper( 'model', bindModel );
  return bindModel;
});
