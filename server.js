var http = require('http');
var express = require('express')
var app = express()
var bodyParser = require('body-parser')
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

var jsonParser = bodyParser.json()

var mongoose = require('mongoose')

var PythonShell = require('python-shell')

mongoose.connect('mongodb://localhost/drinks')
var db = mongoose.connection

app.get('/api/beers', function (req, res){
	db.collection('beer').find().toArray(function(err, results){
		res.json(results)
	})
})

app.post('/api/services', function (req, res){
	// db.collection('beer').find().toArray(function(err, results){
	// 	res.json(results)
	// })
	console.log(req.body)
	res.send(req.body)
})

app.post('/api/test', function (req, res){

var pyshell = new PythonShell('example.py')
var jsonReq = req.body
console.log("wut: "+jsonReq)
if (!req.body) return res.sendStatus(400)
console.log("res: "+req.body)
pyshell.send(JSON.stringify(jsonReq));

pyshell.on('message', function (message) {
    // received a message sent from the Python script (a simple "print" statement)
    console.log(message);
});

// end the input stream and allow the process to exit
pyshell.end(function (err) {
    
    console.log('finished');
});
// PythonShell.run('example.py', function (err) {
//   if (err) throw err;
//   console.log('finished');
// });

})

app.get('/api/script', function (req, res){
	//console.log('script')
	var spawn = require("child_process").spawn
	var process = spawn('python', ['example.py'])
	var data = '{"username": "stevenpalominomarketing", "password": "Pickone1!"}'
	//var stringified = JSON.stringify(data)
	dataString = ''

	//res.send("hello")
	process.stdout.on('data', function(data){
		//print("from js: " + data)
		dataString += data.toString()
		console.log('back from script')
		//console.log(data)
		//res.send(data.json)
	})
	process.stdout.on('end', function(){
		console.log('end script')
		console.log(dataString)
		res.send(dataString)
	})

	process.stdin.write(data)
	process.stdin.end()

	// db.collection('beer').find().toArray(function(err, results){
	// 	res.json(results)
	// })
})





app.listen(8080, function(){
	console.log('Example app listening on port 8080')
})



