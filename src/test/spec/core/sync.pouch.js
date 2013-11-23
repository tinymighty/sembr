define(['sembr', 'sembr.sync.pouch', '/test/fixtures/model.js', '/test/fixtures/collection.js'],
function(sembr, sync, model, collection) {

	describe('PouchSync', function() {
    var fake_pouchdb, model_inst, collection_inst, fake_rows;
    beforeEach(function(){

      fake_pouchdb = jasmine.createSpyObj('fake_pouchdb', ['allDocs', 'query', 'get', 'put', 'post', 'remove']);
      model.prototype.sync = sync;
      collection.prototype.sync = sync;
      collection.prototype.model = model;/*function(attrs, options){
        return new model(attrs, options)
      };*/
      fake_rows = [{
        "doc": {
         "_id": "0B3358C1-BA4B-4186-8795-9024203EB7DD",
         "_rev": "1-5782E71F1E4BF698FA3793D9D5A96393",
         "blog_post": "my blog post"
        },
        "id": "0B3358C1-BA4B-4186-8795-9024203EB7DD",
        "key": "0B3358C1-BA4B-4186-8795-9024203EB7DD",
        "value": {
         "rev": "1-5782E71F1E4BF698FA3793D9D5A96393"
        }
      }]
      model_inst = new model({_id:'123'});
      collection_inst = new collection;
      sync.db = fake_pouchdb;
    });

    describe('when fetching via a model instance', function(){
      beforeEach(function(){
        
      });
      it('expects _id attribute to be defined', function(){
        expect(model_inst.attributes._id).toBeDefined();
      });
      it('should return a promise object', function(){
        model.sync = fake_pouchdb;
        expect(sync('read', model_inst, {})).toBePromise();
      });
      it('should attempt to load by _id via allDocs', function(){
        //spyOn(sync.db, 'allDocs');
        sync('read', model_inst, {});
        expect(sync.db.allDocs).toHaveBeenCalled();
      });
      it('should reject the promise if the callback receives an error', function(){
        var promise;
        runs(function(){
          sync.db.allDocs.andCallFake(function(options, callback){
            //simulate allDocs throwing an error...
            callback({error:'error'});
          });
          promise = sync('read', model_inst);
        });
        waitsFor(function(){
          return trueWhen.promiseNotPending(promise);
        }, 10);
        runs(function(){
          expect(promise).toBeRejected();
        });
      });
    });

    describe('when fetching via a collection', function(){
      it('expects a query property to be defined on the object', function(){
        expect(collection_inst.query).toBeDefined();
      });
      it('should return a promise', function(){
        expect(sync('read', collection_inst)).toBePromise();
      })
      it('should resolve the promise when the collection has loaded', function(){
        var promise;
        runs(function(){
          sync.db.query.andCallFake(function(fun, options, callback){
            //simulate allDocs throwing an error...
            callback(undefined, fake_rows);
          });
          sync.db.allDocs.andCallFake(function(options, callback){
            //simulate allDocs throwing an error...
            callback(undefined, [fake_rows[0].doc]);
          });
          promise = sync('read', collection_inst, {});
          promise.fail(function(err){
            console.log('ERROR YO', err);
          });
        });
        waitsFor(function(){
          return trueWhen.promiseNotPending(promise);
        }, 10);
        runs(function(){
          expect(promise).toBeResolved();
        });

      });
    });


  });

});