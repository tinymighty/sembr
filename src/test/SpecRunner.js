
require(['underscore', 'jquery', 'jasmine-html', 'init'], function(_, $, jasmine, init){
 
  var jasmineEnv = jasmine.getEnv();
  jasmineEnv.updateInterval = 1000;
 
  var htmlReporter = new jasmine.TrivialReporter();
 
  jasmineEnv.addReporter(htmlReporter);
 
  jasmineEnv.specFilter = function(spec) {
    return htmlReporter.specFilter(spec);
  };

  var sembr = init();
 
  var specs = [
    '/test/spec/helpers.js',
    '/test/spec/core.js',
    '/test/spec/modules/trackr/places.js',
    '/test/spec/modules/trackr/plantings.js'
    ]; 
 
  $(sembr.ready.done(function(){
    require(specs, function(){
      jasmineEnv.execute();
    });
  }));
 
});