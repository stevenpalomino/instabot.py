var http = require('http');
var express = require('express')
var app = express()
var bodyParser = require('body-parser')

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

const kue = require('kue')
 , queue = kue.createQueue({jobEvents: false})

var thirtyMinutesAgo = Math.round(new Date().getTime()/1000-1800)
			kue.Job.rangeByState('queued', 0, 99999, 'asc', function(err, jobs){
				jobs.forEach(function(job){
				  if (job.created_at > thirtyMinutesAgo) return;
				  job.remove();
				})
			})

queue.watchStuckJobs(1000)
 queue.process('script', 3,  (job, done) => {
 	script(job.data, (err) => {
 		if(err){
 			console.log('error processing ' + job.id)
 			done(err)
 		}else{
 			console.log('Process job success ' + job.id)
 			// console.log(job.id)
			var thirtyMinutesAgo = Math.round(new Date().getTime()/1000-1800)
			kue.Job.rangeByState('queued', 0, 99999, 'asc', function(err, jobs){
				jobs.forEach(function(job){
				  if (job.created_at > thirtyMinutesAgo) return;
				  job.remove();
				})
			})
			
			kue.Job.rangeByState( 'complete', 0, n, 'asc', function( err, jobs ) {
  			  jobs.forEach( function( job ) {
    			    job.remove( function(){
      			      console.log( 'removed ', job.id );
    			    });
  			  });
			});
 			done()
 		}
 	})
 })

 const script = (data, callback) => {

 	//actual work
	var jsonReq = data.body
 	console.log('Processing job...')
 	//console.log(data.expiryKey)
  	var timestamp = Math.round(new Date().getTime()/1000)
	User.update({username:data.username}, {$set:{jobExpiryKey:data.expiryKey, lastRun:timestamp}}, function(err, resultUser){
		if (err) {
			console.log(err)
		}else{
			console.log('updated user expiry key')
		};
	});
	var oneUser
	User.find({username:data.username}, function (err, person){
		console.log('~~~one person: ')
		oneUser = person[0]
		console.log(oneUser["username"])


		if (oneUser.likes > 0) {
		// Only run the script if user has likes available, give "free" likes up to rate
		// "restart" likes when user buys instead of adding to negative
			//console.log(oneUser);
			console.log('sending python data...');
			var options = {
		 		mode: 'text',
		  		args: JSON.stringify(oneUser)
			};

			pyshell = new PythonShell('example.py', options);
			PythonShell.run('example.py', options, function (err, results){
			if (err){
				console.log('~~ Error: '+err)
			};

			console.log('Done with script');

			})


			pyshell.on('message', function (message) {
			    // received a message sent from the Python script (a simple "print" statement)
			    //console.log('message received!');
			    console.log(message);
			});

			pyshell.end(function (err) {
			  	//if (err) throw err;
			  	newLikes = oneUser.likes - oneUser.rate
			  	var timestamp = Math.round(new Date().getTime()/1000)
				User.update(oneUser, {$set:{likes:newLikes, lastRun:timestamp}}, function(err, resultUser){
					if (err) {
						console.log(err)
					}else{
						console.log('updated user likes')
						// console.log(oneUser)
						// console.log('finished');
						callback(null)
					};
				});
			  
			});
		}
		}) //end of User.find

	

 }
