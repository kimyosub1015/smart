/**
 * smart-mirror remote by Evan Cohen
 */
const stream = require('stream')
let remote = new stream.Writable()
remote.start = function () {
	var express = require('express')
	const app = express()
	var fs = require('fs')
	const getConfigSchema = require('./remote/config.schema.js')
	var multer = require('multer');
	var connect = require('connect');
	var crypto = require('crypto');
	var x = 1;
	//var lth;
	console.log("start web server");

	//var imgapp = express();
	let config = ""
	let configDefault = ""
	let configJSON = ""
	let configPath = __dirname + "/config.json"
	var imgFolder = '../app/img/';
	//config.json 파일을 불러온다!
	let configDefaultPath = __dirname + "/remote/.config.default.json"

	function getFiles() {
		configDefault = JSON.parse(fs.readFileSync(configDefaultPath, "utf8"))

		if (fs.existsSync(configPath)) {
			try {
				config = JSON.parse(fs.readFileSync(configPath, "utf8")) //json'd config file
			} catch (e) {
				config = configDefault
			}
		} else {
			config = configDefault
		}
		configDefault = JSON.parse(fs.readFileSync(configDefaultPath, "utf8"))
		//TODO this is async, all of the remote should be async too

	}
	getFiles();
	const static = require('serve-static');
	const path = require('path');
	/*
	var storage = multer.diskStorage({
		destination: function (req, file, callback) {
			callback(null, './app/img')
		},
		filename: function (req, file, callback) {
			callback(null, file.originalname)
		}
	});
	
	var upload = multer({ 
		storage: storage,
		limits: {
			files: 10,
			fileSize: 1024 * 1024 * 1024
		}
	});
	*/
	//파일 용량 리미트, 이건 적용한다.

	var storage = multer.diskStorage({
		destination: './app/img',
		filename: function(req, file, cb) {
			if(x<11){
				cb(null, "picture"+x+".jpg");
				x++;
			}			
			else if(x == 11){
				x = 1;
				cb(null, "picture"+x+".jpg");
			}
			
		}
	});
	
	// Post files
	app.post("/upload", multer({
		storage: storage
	}).single('upload'), function(req, res) {
		console.log(req.file);
		console.log(req.body);
		res.redirect("/uploads/" + req.file.filename);
		console.log(req.file.filename);
		return res.status(200).end();
	});
	
	app.get('/uploads/:upload', function (req, res){
		var file = req.params.upload;
		console.log(req.params.upload);
		var img = fs.readFileSync(__dirname + "/app/img/" + file);
		res.writeHead(200, {'Content-Type': 'image/jpg' });
		res.end(img, 'binary');
	
	});

	const server = require('http').createServer(app)

	// Start the server
	server.listen(config.remote.port)
	// Use the remote directory and initilize socket connection
	app.use(express.static(__dirname + '/remote'))
	remote.io = require('socket.io')(server)

  /**
   * When the connection begins
   */
	remote.io.on('connection', function (socket) {
		socket.emit('connected')

		// When the mirror recieves a remote command
		socket.on('command', function (command) {
			remote.emit('command', command)
		})

		socket.on('devtools', function (open) {
			remote.emit('devtools', open)
		})

		socket.on('kiosk', function () {
			remote.emit('kiosk')
		})

		socket.on('reload', function () {
			remote.emit('reload')
		})

		socket.on('clickWakeUp', function () {
			remote.emit('wakeUp')
		})
		socket.on('clickSleep', function () {
			remote.emit('sleep')
		})

		socket.on('getAnnyAng', function () {
			socket.emit('loadAnnyAng', (typeof config.general.language != 'undefined') ? config.general.language : 'en-US')
		})

		socket.on('saveConfig', function (data) { // used to save the form JSON
			fs.writeFile(configPath, JSON.stringify(data, null, 2), "utf8", function (err) {
				if (err) {
					console.error(err)
				} else {
					remote.emit('relaunch')
				}
			})
		})

		socket.on('getForm', function () {
			getConfigSchema(function (configSchema) {
				configSchema.form.sort(function (a, b) { return a.order - b.order })
				configJSON = configSchema
				socket.emit("json", { "configJSON": configJSON, "configDefault": configDefault, "config": config })
			})
		})

	}) // end - connection

  /**
   * When a remote disconnects
   */
	remote.io.on('disconnect', function () {
		remote.emit('disconnected')
	})// end - disconnect
} // end - start

module.exports = remote
