var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');
var mongoose = require('mongoose');
var flash = require('express-flash');
var validate = require('mongoose-validator')
var session = require('express-session');

app.use(flash());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, './static')));
app.use(session({
    secret: 'hasdflkjasfdpiuhwlkj',
    resave: false,
    saveUninitialized: true,
  }))
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');


mongoose.connect('mongodb://localhost/quoting_dojo');
mongoose.Promise = global.Promise;

var nameValidator = [
    validate({
        validator: 'isLength',
        arguments: [3, 50],
        message: 'Name should be between {ARGS[0]} and {ARGS[1]} characters',
    }),
    validate({
        validator: 'isAlphanumeric',
        passIfEmpty: true,
        message: 'Name should contain alpha-numeric characters only',
    }),
]

var quoteValidator = [
    validate({
        validator: 'isLength',
        arguments: [3, 50],
        message: 'Quote should be between {ARGS[0]} and {ARGS[1]} characters',
    })
]

var UserSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Name is required'],
        validate: nameValidator 
    },
    quote: { 
        type: String, 
        required: [true, 'Quote is required'],
        validate: quoteValidator 
    },
    
},{timestamps: true});

mongoose.model('User', UserSchema); // We are setting this Schema in our Models as 'User' Registering Model
var User = mongoose.model('User')

app.get('/', function (req, res) {

    res.render('index')
})

//  db.users.find().sort({createdAt: -1}).exec

app.get('/quotes', function(req, res){
	User.find({}).sort({createdAt: -1}).exec(function(err, users){
		res.render('quotes', {users: users})
	})
	
})


app.post('/results', function (req, res) {
    var user = new User(req.body);
    user.save(function (err) {
        if (err) {
            // if there is an error upon saving, use console.log to see what is in the err object 
            console.log("We have an error!", err);
            // adjust the code below as needed to create a flash message with the tag and content you would like
            for (var key in err.errors) {
                req.flash('registration', err.errors[key].message);
            }
            // redirect the user to an appropriate route
            res.redirect('/');
        } else {
            console.log("POST DATA", req.body);
            var user_inst = new User({ name: req.body.name, quote: req.body.quote});
            // This is where we would add the user from req.body to the database.
            user_inst.save(function (err) {
                // if there is an error console.log that something went wrong!
                if (err) {
                    console.log('something went wrong');
                } else {
                	 // else console.log that we did well and then redirect to the root route
                    console.log('successfully added a user!');
                }
                res.redirect('/quotes');
            })     // This is where we will retrieve the users from the database and include them in the view page we will be rendering.
        }
    });
});








app.listen(8000, function() {
    console.log("listening on port 8000");
})