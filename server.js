var http = require('http');
var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var kue = require('kue-scheduler')
var queue = kue.createQueue() // parse application/x-www-form-urlencoded

app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

var jsonParser = bodyParser.json()

var mongoose = require('mongoose')

var PythonShell = require('python-shell')
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/test_user')
var db = mongoose.connection;
var User;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(){
	User = require('./models/User.js')
})


// app.get('/api/beers', function (req, res){
// 	db.collection('beer').find().toArray(function(err, results){
// 		res.json(results)
// 	})
// })

app.get('/', function (req, res){
	//console.log(req.body)
	res.send("<h1>InstaLikerPlus API</h1>")
})

app.post('/api/createUser', function (req, res){
	console.log(req.body.likes)

	
	var newUser = new User({
		username: req.body.username,
		password: req.body.password, 
		hashtags: req.body.hashtags,
		rate: req.body.rate,
		likes: req.body.likes,
		jobExpiryKey: ""
	})

	newUser.save(function(err, newUser){
		if (err) console.error(err);
		console.log('Created successfully')
		
	})

	console.log("~~~")
	res.sendStatus(200)
	//console.log(User)
	//res.send("<h1>InstaLikerPlus API</h1>")
})

app.put('/api/updateUser', function (req, res){
	//console.log(req.body.likes)	
	var newUser = new User({
		username: req.body.username,
		password: req.body.password, 
		hashtags: req.body.hashtags,
		rate: req.body.rate,
		likes: req.body.likes
	})

	User.findOneAndUpdate({username:newUser.username}, {username:newUser.username, password:newUser.password, hashtags:newUser.hashtags, rate:newUser.rate, likes:newUser.likes}, function(err, resultUser){
		if (err) {
			console.log("~~~ User NOT updated ~~~")
			res.sendStatus(400)
		}else{
			console.log("~~~ Updated User ~~~")
			res.sendStatus(200)
		}

		console.log(newUser);
	})
})


app.get('/api/getUsers', function (req, res){
	//console.log(req.body)
	User.find({}, function(err, users){
		if (err) throw err;

		console.log(users);
		res.send(users)

	})

	console.log("******")
	//console.log(User)
	//res.send("<h1>InstaLikerPlus API</h1> <br>"+users)
})

app.post('/api/services', function (req, res){
	// db.collection('beer').find().toArray(function(err, results){
	// 	res.json(results)
	// })
	console.log(req.body)
	res.send(req.body)
})

// ~~~~~~~~~~~~~~ TEST ~~~~~~~~~~~~~~
app.post('/api/script', function (req, res){

var username = req.body.username
var password = req.body.password
var hashtags = req.body.hashtags
var rate = req.body.rate
var likes = req.body.likes

	User.find({username:req.body.username}, function (err, person){
	currentUser = person[0]
		if (currentUser.jobExpiryKey.length == 0 || !currentUser.jobExpiryKey) {
			const job = queue.createJob('script', {
				//data
				'username':username,
				'password':password,
				'hashtags':hashtags,
				'rate':rate,
				'likes':likes
			}).attempts(1).priority('normal');
			queue.every('2 minutes', job);
			console.log("expiry: "+job.expiry);
			//queue.now(job);

			console.log('~~~~~ const job queue create script: ' + req.body.username + " " + req.body.password)

			job.on('complete', function(){
				console.log('job complete')
				//res.send("Success save")
				//res.end()
			 		//res.send("Success")
			// 		console.log('success')
			// 		res.end()
			// 		process.exit(0)
			}).on('failed', function(){
				console.log("job failed")
			})
			job.removeOnComplete(true).save();
			res.send("Success save")
			res.end()
		}
	})
})

app.post('/api/deleteJob', function (req, res){
// takes username and deletes job from queue using expiryKey
	console.log("delete job")
	User.find({username:req.body.username}, function (err, person){
		console.log(req.body.username)
		console.log(person)
		currentUser = person[0]
		if (currentUser) {
			console.log(currentUser.jobExpiryKey);
			queue.remove({jobExpiryKey:currentUser.jobExpiryKey}, function(error, response){
				if (error) {
					console.log("Delete Job error: "+error)
				}else{
					User.update({username:currentUser.username}, {$set:{jobExpiryKey:""}}, function(err, resultUser){
						if (error) {
							console.log("Delete Job error: "+error)
						}else{
							console.log("expiry key cleared for reset")
						}
					})
					console.log("Job deleted successfully")
					res.send(200)
				};
			})
		};
	})

})

app.post('/api/test', function (req, res){


var pyshell = new PythonShell('example.py')
var jsonReq = req.body
//console.log("wut: "+jsonReq)
if (!req.body) return res.sendStatus(400)
//console.log("res: "+req.body)
pyshell.send(JSON.stringify(jsonReq));

pyshell.on('message', function (message) {
    // received a message sent from the Python script (a simple "print" statement)
    console.log(message);
});

// end the input stream and allow the process to exit
pyshell.end(function (err) {
    
    console.log('finished');
	res.sendStatus("Success")


});

})





app.listen(8081, function(){
	console.log('Example app listening: Iteration v. 1.0.1')
	// v. 1.0 - working script on server without automation
	// v. 1.0.1 - some automation
})



