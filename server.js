var http = require('http');
var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var mongoose = require('mongoose')

app.use(bodyParser.json())

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



