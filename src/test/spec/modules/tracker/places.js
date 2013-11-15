define(['require', '../trackr/collections/places', 'trackr/models/place'],
function() {

	return describe('View :: Count Remaining Items', function() {
 
    beforeEach(function () {
      that.todos = new Todo.Collection();
      that.view = new View({collection: that.todos});
      that.mockData = { title: 'Foo Bar', timestamp: new Date().getTime() };
      $('#sandbox').html(that.view.render().el);
    });
  
  });

});