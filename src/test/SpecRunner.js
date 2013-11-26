
require(['underscore', 'jquery', 'jasmine-html', 'init'], function(_, $, jasmine, init){
 
  var jasmineEnv = jasmine.getEnv();
  jasmineEnv.updateInterval = 1000;
 
  
 
  var specs = [
    '/test/helpers.js',
    '/test/spec/core/sync.pouch.js',
    '/test/spec/trackr/collections/plantings.js',
    '/test/spec/trackr/models/planting.js',
    '/test/spec/trackr/collections/plants.js',
    '/test/spec/trackr/models/plant.js',
    ]; 
 
  $(function(){

    require(specs, function(){
      var htmlReporter = new jasmine.HtmlReporter();
 
      jasmineEnv.addReporter(htmlReporter);
     
      jasmineEnv.specFilter = function(spec) {
        return htmlReporter.specFilter(spec);
      };

      jasmineEnv.execute();
    });
  });
 
});