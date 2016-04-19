// server.js

// modules =================================================
var express        = require('express');
var app            = express();
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var mongoose       = require('mongoose');



var testdbfunc = function(){
   
    // Create Schema
    var carSchema = mongoose.Schema({
        name: String,
        color: String,
        year: String,
        type: String
    });

    // Compile Schema into a Model
    var Car = mongoose.model('Car', carSchema);


    //TEST -----------------
    //PRINTS THE DB TO TERMINAL
    // Car.find(function (err, cars) {
    //     if (err) return console.error(err);
    //     console.log(cars);
    // });

    //Add text entry
    //  var ferrari = new Car({ 
    //    name: 'lambo',
    //    color: 'blue'
    //  });
    // // save the sample car
    //  ferrari.save(function(err) {
    //    if (err) throw err;
    //    console.log('Test car saved successfully');
    //  });





    //   {"name":"lamborghini", "color": "blue", "year": "2005", "type":"sportcar"}
    // Adds the new Car to DB
    app.post('/api/cars', function(req, res){

        //console.log(req);
        var carinfo = req.body;
        // Inits Car.db object
        var newCar = new Car({
            name:   carinfo.name, 
            color:  carinfo.color, 
            year:   carinfo.year, 
            type:   carinfo.type
        });

         // Save to the mongo DB
        newCar.save ( function(err, response){
              if (err) return console.error(err);
            //console.log(response);
            res.json(response);
        });
    });

    // Find everything 
    app.get('/api/cars', function(req, res){
        //console.log(req.query);
       
        //limit (return  limited items)
        if (req.query.limit) {
            Car.find().limit(req.query.limit).exec(function (err, cars) {
                if (err) return handleError(err);
                res.json(cars);
            });
        
        //return only with field
        } else if(req.query.fields){
            //console.log(req.query.fields);
            Car.find().select(req.query.fields).exec(function (err, cars) {
                if (err) return handleError(err);
                res.json(cars);
            });
        
        //return with offset (skipped items)
        } else if(req.query.offset){
            //console.log(req.query.offset);
            Car.find().skip(req.query.offset).exec(function (err, cars) {
                if (err) return handleError(err);
                res.json(cars);
            });

        // return with filter
        } else if(req.query){
            Car.find(req.query).exec(function (err, cars) {
                if (err) return handleError(err);
                res.json(cars);
            });

        //return all items
        } else{
            Car.find(function (err, cars) {
              if (err) return handleError(err);
                //console.log(cars);
                res.json(cars);
            });
        }
    });
    

    //Get Car by id
    app.get('/api/cars/:id', function(req, res){
        Car.findOne({'_id': req.params.id}, function(err, response){
             if (err) return console.error(err);
             // If the result exists (Car found)
            if(response) {
                  res.json(response);
                }
                
                // No results found
                else {
                   res.json(false);
                }
        });
   });

   
//DELETE /cars/{id} - Delete a specific car resource
    app.delete('/api/cars/:id', function(req, res){
        //console.log("REMOVE id", req.params.id);
        //send response back to controller
        Car.remove({_id : req.params.id}, function(err, response){
            if (err) return console.error(err);
            //console.log(response);
            res.json(response);
        });
     
    });
 
    //update selected Cars data
    app.put('/api/Cars/:id', function(req, res){
        //console.log("MODIFY id", req.params.id);
        var carID = req.params.id;
        var carinfo = req.body;

        Car.findByIdAndUpdate(carID, {
            name: carinfo.name, 
            color: carinfo.color, 
            year: carinfo.year, 
            type: carinfo.type
        },{new: true}, function (err, response){
            if (err) return console.error(err);
            console.log(response);
            res.json(response);
        });
    });

}
    
// config files
var db = require('./config/db');

// set our port
var port = process.env.PORT || 8080; 

// connect to our mongoDB database 
// (uncomment after you enter in your own credentials in config/db.js)
mongoose.connect(db.url); 

// Check if the DB connection is OK
var dbconn = mongoose.connection;
dbconn.on('error', console.error.bind(console, 'connection error:'));
dbconn.once('open', function() {
  // we're connected!
    process.stdout.write("Connected to DB\n");
    testdbfunc();
});



// get all data/stuff of the body (POST) parameters
// parse application/json 
app.use(bodyParser.json()); 

// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); 

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true })); 

// override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(methodOverride('X-HTTP-Method-Override')); 

// set the static files location /public/img will be /img for users
//app.use(express.static(__dirname + '/public')); 

// routes ==================================================
//require('./app/routes')(app); // configure our routes

// start app ===============================================
// startup our app at http://localhost:8080
app.listen(port);               

// shoutout to the user                     
console.log('Magic happens on port ' + port);

// expose app           
exports = module.exports = app;                         
