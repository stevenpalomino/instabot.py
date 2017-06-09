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



app.get('/', function (req, res){
	//console.log(req.body)
	res.send("<h1>InstaLikerPlus API</h1>")
})


app.post('/api/createUser', function (req, res){
	// new user sign up create listing in db
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
	res.json({success : "Created Successfully", status : 200});

})

app.put('/api/updateUser', function (req, res){
	//console.log("updated user")
	//console.log(req.body)
	//console.log(req.body.hashtags)	
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
			res.json({success : "Saved Successfully", status : 200});

		}

		console.log(newUser);
	})
})

app.post('/api/getUserInfo', function (req, res){
	//takes username and returns user data
	var newUser = new User({
		username: req.body.username,
		password: req.body.password, 
		hashtags: req.body.hashtags,
		rate: req.body.rate,
		likes: req.body.likes,
		lastRun: req.body.lastRun
	})

	User.find({username:req.body.username}, function (err, person){
		currentUser = person[0]
		console.log(currentUser)
		res.send(currentUser)

	})

})

app.get('/api/getUsersInfo', function (req, res){
	//console.log(req.body)
	User.find({}, function(err, users){
		if (err) throw err;

		console.log(users);
		res.send(users)

	})

	console.log("Get user info")
})

app.post('/api/login', function (req, res){
// check username/password
var username = req.body.username
var password = req.body.password
// var hashtags = req.body.hashtags
// var rate = req.body.rate
// var likes = req.body.likes

console.log('sending python data...');
var options = {
		mode: 'text',
		args: JSON.stringify(req.body)
};

pyshell = new PythonShell('loginChecker.py', options);
PythonShell.run('loginChecker.py', options, function (err, results){
if (err){
	console.log('~~ Error: '+err)
};

	//console.log('Done with script');
	//console.log('done '+results[results.length-1])
	message = results[results.length-1]
	if (message == 444) {
    	// wrong creds
    	console.log("444 message")
    	res.json({success : "Check Credentials", status : 444});
    }else if(message == 443){
    	// connection issue
    	console.log("443 message")
  	res.json({success : "Check Connection", status : 443});

    }else if(message == 200){
    	//success
    	console.log("200 message")
    	res.json({success : "Login Successfully", status : 200});

    }else{
    	//console.log("any other message")
    };
})


pyshell.on('message', function (message) {
    // received a message sent from the Python script (a simple "print" statement)
    //console.log('message received!');
    // if (message === 444) {
    // 	// wrong creds
    // 	console.log("444 messager")
    // 	res.sendStatus(444)
    // 	res.send("done")
    // 	Response.end()
    // }else if(message === 443){
    // 	// connection issue
    // 	console.log("443 message")
    // 	sendStatus(443)
    // }else if(message === 200){
    // 	//success
    // 	res.sendStatus(200)
    // 	res.end()
    // 	console.log("200 message")
    // }else{
    // 	//console.log("any other message")
    // };
    console.log(message);
});

pyshell.end(function (err) {
  	//if (err) throw err;
  	//newLikes = oneUser.likes - oneUser.rate
  	if (err) {
  		console.log("error end: "+err)
  	}else{
  		//callback(null)
  		//console.log("end")
  	}
  
});


})


// ~~~~~~~~~~~~~~ MAIN SCRIPT ENDPOINT ~~~~~~~~~~~~~~
app.post('/api/script', function (req, res){
// run script with created user, also resume job if deleted with /deleteaJob
// req must include empty expiryKey for script to run
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
			queue.every('60 minutes', job);
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
			res.json({success : "Saved Successfully", status : 200});
			//res.send("Success save")
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
					res.json({success : "Deleted Successfully", status : 200});
				};
			})
		};
	})

})







app.listen(8080, function(){
	console.log('Example app listening: Iteration v. 1.1')
	// v. 1.0 - working script on server without automation
	// v. 1.0.1 - some automation
	// v. 1.1 - automation works
})



