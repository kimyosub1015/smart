/**
 * smart-mirror remote by Evan Cohen
 */
const stream = require('stream')
let remote = new stream.Writable()
remote.start = function () {
	var express = require('express')
	const app = express()
	const fs = require('fs')
	const getConfigSchema = require('./remote/config.schema.js')
	const multer = require('multer');
	console.log("start web server");

	//var imgapp = express();

	let config = ""
	let configDefault = ""
	let configJSON = ""
	let configPath = __dirname + "/config.json"
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
	app.use('/public', static(path.join(__dirname, 'public')));
	app.use('/uploads', static(path.join(__dirname, 'uploads')));
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
	var router = express.Router();
	app.route('/process/photo').post(upload.array('photo', 1), function(req, res) {
		console.log('/process/photo');
		
		try {
			var files = req.files;
		
			console.dir('#===== upload information =====#')
			console.dir(req.files[0]);
			console.dir('#=====#')
			
			// 현재의 파일 정보를 저장할 변수 선언
			var originalname = '',
				filename = '',
				mimetype = '',
				size = 0;
			
			if (Array.isArray(files)) {   // 배열에 들어가 있는 경우 (설정에서 1개의 파일도 배열에 넣게 했음)
				console.log("file account from array : %d", files.length);
				
				for (var index = 0; index < files.length; index++) {
					originalname = files[index].originalname;
					filename = files[index].filename;
					mimetype = files[index].mimetype;
					size = files[index].size;
				}
				
			} else {   // 배열에 들어가 있지 않은 경우 (현재 설정에서는 해당 없음)
				console.log("file number : 1 ");
				
				originalname = files[index].originalname;
				filename = files[index].name;
				mimetype = files[index].mimetype;
				size = files[index].size;
			}
			
			console.log('filename : ' + originalname + ', ' + filename + ', '
					+ mimetype + ', ' + size);
			
			// 클라이언트에 응답 전송
			res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
			res.write('<h3>파일 업로드 성공</h3>');
			res.write('<hr/>');
			res.write('<p>원본 파일명 : ' + originalname + ' -> 저장 파일명 : ' + filename + '</p>');
			res.write('<p>MIME TYPE : ' + mimetype + '</p>');
			res.write('<p>파일 크기 : ' + size + '</p>');
			res.end();
			
		} catch(err) {
			console.dir(err.stack);
		}	
			
	});
	app.use('/', router);

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
