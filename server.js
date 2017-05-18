var http = require('http');
var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var kue = require('kue')
var queue = kue.createQueue() // parse application/x-www-form-urlencoded

app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

var jsonParser = bodyParser.json()

var mongoose = require('mongoose')

var PythonShell = require('python-shell')

// mongoose.connect('mongodb://localhost/drinks')
// var db = mongoose.connection

// app.get('/api/beers', function (req, res){
// 	db.collection('beer').find().toArray(function(err, results){
// 		res.json(results)
// 	})
// })

app.get('/', function (req, res){
	console.log(req.body)
	res.send("<h1>InstaLikerPlus API</h1>")
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
const job = queue.create('script', {
	//data
	'username':username,
	'password':password
}).save( function(err){
	console.log('const job queue create script: ' + req.body.username + " " + req.body.password)
	if (err){
		console.log('${job.id} error');
	}else{
		//process.exit(0)
	}	
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
	res.send("Success")

});

})





app.listen(8081, function(){
	console.log('Example app listening: Iteration v. 1.0')
	// v. 1.0 - working script on server without automation
})



