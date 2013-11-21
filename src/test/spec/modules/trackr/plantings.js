define(['sembr', 'init'],
function(sembr) {

	describe('Planting Model', function() {
    var planting, mock_data, 
        PlantingModel = sembr.trackr.models.Planting;
    sembr.trackr.models._reset.all();
    beforeEach(function () {
      sembr.trackr.models._init.all();

      //planting = new PlantingModel();

      mock_data = {
        type: 'planting',
        _id: 'a123',
        plant: {
          type: 'plant',
          _id: 'a345',
          use_name: 'Sunflower',
        },
        place: {
          type: 'place',
          _id: 'c456',
          name: 'Garden'
        },
        actions: [
          {
            type: 'action',
            subject_type: 'planting',
            subject_id: 'a123',
            action_type: 'planted'
          }
        ]
      }

      mock_data = {
        "_id":"204DF154-8D69-4366-BCA6-9D5422B81525",
        "type":"planting",
        "place_id":"44519B65-9468-4185-BE30-DD5C3DD83330",
        "plant_id":"52C1619D-4F41-46D3-918D-8CE6A9DA0822",
        "date":"2012-12-01",
        "added":"2012-12-01",
        "removed":"2013-15-04",
        "user":"sembr.es/user/andru",
        "_rev":"8-1243a6aa9b1aae51cf3ee81673fec046",
        "place":{
          "type":"place",
          "name":"Veggie Garden",
          "in_place":"89EC04EE-C69E-41AC-8416-236277C88128",
          "user":"sembr.es/user/andru",
          "_id":"44519B65-9468-4185-BE30-DD5C3DD83330",
          "_rev":"2-dde7f10dbe7ef06ab1c9fdcc579c20fc",
          "order":0
        },
        "plant":{
          "type":"plant",
          "use_name":"Heading Brocolli",
          "plant_names_db_id":"dfghjkl",
          "_id":"52C1619D-4F41-46D3-918D-8CE6A9DA0822",
          "_rev":"3-fe602a4ac2468718184cb7c0dff43f60"
        },
        "actions":[
          {
            "type":"action",
            "order":0,
            "date":"2012-04-02",
            "notes":"Added a second successional sowing.",
            "action_type":"planting",
            "subject_type":"planting",
            "subject_id":"204DF154-8D69-4366-BCA6-9D5422B81525",
            "user":"sembr.es/user/andru",
            "_id":"6135D230-2E8F-4AEB-93F3-2C1C558F9FE2",
            "_rev":"2-eeb868326aa67e9689164f64852e8e5e",
          } 
        ]
      }
    });

    afterEach(function(){
      sembr.trackr.models._reset.all();
    });
    
    describe('Model class', function(){
      it('should have a find method', function(){
        expect(PlantingModel.find).toBeDefined();
      })
      it('should have a findOrFetch method', function(){
        expect(PlantingModel.findOrFetch).toBeDefined();
      })
      it('should have associations', function(){
        expect(PlantingModel.associations).toBeDefined();
        console.log(PlantingModel.associations());
        expect(PlantingModel.associations().plant).toBeDefined();
        expect(PlantingModel.associations().place).toBeDefined();
        expect(PlantingModel.associations().actions).toBeDefined();

      });
    });

    describe('findOrFetch', function(){
      beforeEach(function(){
        planting = PlantingModel.create();
      });
      it("should return a promise from", function() {
  	    var promise = planting.fetch({id: ''});
  	    expect(promise).toBePromise();
  	  });

      it("should reject the promise when the ID does not represent a valid document ID", function() {
        
        var callback = jasmine.createSpy();

        var promise = planting.fetch({id: 'nowaywillthiseverbeanidfoooool'}).fail(callback);
        expect(promise).toBePromise();

        waitsFor(function() {
            return callback.callCount > 0;
        }, '', 500);

        runs(function() {
            expect(callback).toHaveBeenCalled();
        });

      });
    });

    /*it('should return a model and a json document representation', function(){
      var callback = jasmine.createSpy();

      planting.fetch({id: 'fixture-id'}).done(callback);

      waitsFor(function() {
          return callback.callCount > 0;
      }, '', 500);

      runs(function(){
        expect(callback).toHaveBeenCalledWith();
      });
    });*/
    describe('Instantiation', function(){
      beforeEach(function(){
      });
      it('should set data and associations when instantiated with data', function(){
        planting = PlantingModel.create(mock_data);
        expect(planting).toBeDefined();
        expect(planting.get('_id')).toBe(mock_data._id);
        expect(planting.plant).toBeDefined();
        expect(planting.place).toBeDefined();
        expect(planting.actions).toBeDefined();
      });

      it('should set data and associations when data is set()', function(){
        planting = PlantingModel.create();
        planting.set(mock_data);
        expect(planting).toBeDefined();
        expect(planting.get('_id')).toBe(mock_data._id);
        expect(planting.plant).toBeDefined();
        expect(planting.place).toBeDefined();
        expect(planting.actions).toBeDefined();
      });

      it('should throw an error if there is no plant_id assigned', function(){
        delete mock_data.plant_id;
        delete mock_data.plant;
        
        expect( PlantingModel.create.bind(this, mock_data) ).toThrow();
      });

      it('should instantiate without error when place_id and/or place are undefined', function(){
        delete mock_data.place_id;
        delete mock_data.place;
        console.log( "CREATE PLANTING WITHOUT PLANT", mock_data, PlantingModel.create(mock_data) );
        expect( PlantingModel.create.bind(this, mock_data) ).not.toThrow();
      });
      describe('when place is undefined', function(){
        beforeEach(function(){
          delete mock_data.place_id;
          delete mock_data.place;
          planting = PlantingModel.create(mock_data);
        });
        it('should not create a place assocation when place_id or place properties are undefined in attributes', function(){
          expect( planting._place ).toBeUndefined();
        });

        it('should not create a place assocation when place_id or place properties are undefined in attributes', function(){
          expect( planting._place ).toBeUndefined();
        });

        it('should still define the place() association accessor, but return false', function(){
          expect(planting.place).toBeDefined();
          expect(planting.place()).toBeFalsy();
        });
      });
    });

    describe('An instance', function(){
      beforeEach(function(){
        PlantingModel.reset();
        planting = new PlantingModel(mock_data);
      });
      it('should expose association names as an array', function(){
        expect(planting._associations).toBeDefined();
        expect(planting._associations).toContain('plant');
        expect(planting._associations).toContain('place');
        expect(planting._associations).toContain('actions');
      });
    });

    describe('the save method', function(){
      beforeEach(function(){
        planting = new PlantingModel(mock_data);
      });
      it('should call sync', function(){
        spyOn(planting, 'sync');
        planting.save();
        expect(planting.sync).toHaveBeenCalled();
      });

    });

    describe('Exporting data', function(){
      it('should include associations in JSON', function(){
        planting = PlantingModel.create(mock_data);
        var json = planting.toJSON();
        expect(json).toBeDefined();
        expect(json.plant).toBeDefined();
        expect(json.place).toBeDefined();
        expect(json.actions).toBeDefined();
      })
      xit('should return JSON which matches the original data', function(){
        planting = PlantingModel.create(mock_data);
        expect(planting.toJSON()).toEqual(mock_data);
      })
    });

  });


});