
require(['underscore', 'jquery', 'jasmine-html', 'init'], function(_, $, jasmine, init){
 
  var jasmineEnv = jasmine.getEnv();
  jasmineEnv.updateInterval = 1000;
 
  
 
  var specs = [
    '/test/spec/helpers.js',
    '/test/spec/core.js',
    '/test/spec/modules/trackr/places.js',
    '/test/spec/modules/trackr/plantings.js'
    ]; 
 
  $(function(){
    var sembr = init({
      container: '#sembr'
    });

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