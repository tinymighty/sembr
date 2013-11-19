
require(['underscore', 'jquery', 'jasmine-html'], function(_, $, jasmine){
 
  var jasmineEnv = jasmine.getEnv();
  jasmineEnv.updateInterval = 1000;
 
  var htmlReporter = new jasmine.TrivialReporter();
 
  jasmineEnv.addReporter(htmlReporter);
 
  jasmineEnv.specFilter = function(spec) {
    return htmlReporter.specFilter(spec);
  };
 
  var specs = [
    '/test/spec/helpers.js',
    '/test/spec/core.js',
    '/test/spec/modules/trackr/places.js',
    '/test/spec/modules/trackr/plantings.js'
    ]; 
 
  $(function(){
    require(specs, function(){


      jasmineEnv.execute();
    });
  });
 
});