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
var pyshell = new PythonShell('example.py',{
	mode:'text'
})

const kue = require('kue')
 , queue = kue.createQueue()

 queue.process('script', (job, done) => {
 	script(job.data, (err) => {
 		if(err){
 			console.log('Process job @{job.id} error: ${err} !!!')
 			done(err)
 		}else{
 			console.log('Process job ${job.id} success')
 			done()
 		}
 	})
 })

 const script = (data, callback) => {

 	//actual work
	var jsonReq = data.body
 	console.log('Working 2')
 	console.log(data.username)

	//console.log("wut: "+jsonReq)
	//if (!data.body) return data.sendStatus(400)
	//console.log("res: "+req.body)
	console.log(JSON.stringify(data));
	console.log(data);
	pyshell.send(JSON.stringify(data));

	pyshell.on('message', function (message) {
	    // received a message sent from the Python script (a simple "print" statement)
	    console.log('Receivced a message from Py');
	    console.log(message);
	});

	// end the input stream and allow the process to exit
	pyshell.end(function (err) {
	    
	    console.log('finished');
		//data.send("Success")

	});

 	callback(null)
 }