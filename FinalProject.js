//IMPORT SPACESHIP MODEL FOR CRAFT
//CLEAN UP CODE LMAO
//Add GUI - Adjustable volumne, colours, lighting, mesh distortion intensity ect.

var noise = new SimplexNoise();
var file = document.getElementById("thefile");
var audio = document.getElementById("audio");
var fileLabel = document.querySelector("label.file");

document.onload = function(){
	console.log(e);
	audio.play();
	play();
}

file.onchange = function(){
	fileLabel.classList.add('normal');
	audio.classList.add('active');
	var files = this.files;
	
	audio.src = URL.createObjectURL(files[0]);
	audio.load();
	audio.play();
	play();
}

{
// GAME VARIABLES
var game;
var deltaTime = 0;
var newTime = new Date().getTime();
var oldTime = new Date().getTime();
var ennemiesPool = [];
var particlesPool = [];
var particlesInUse = [];

function resetGame(){
  game = {speed:0,
          initSpeed:.00035,
          baseSpeed:.00035,
          targetBaseSpeed:.00035,
          incrementSpeedByTime:.0000025,
          incrementSpeedByLevel:.000005,
          distanceForSpeedUpdate:100,
          speedLastUpdate:0,

          distance:0,
          ratioSpeedDistance:50,
          energy:100,
          ratioSpeedEnergy:3,

          level:1,
          levelLastUpdate:0,
          distanceForLevelUpdate:1000,

          planeDefaultHeight:100,
          planeAmpHeight:80,
          planeAmpWidth:75,
          planeMoveSensivity:0.005,
          planeRotXSensivity:0.0008,
          planeRotZSensivity:0.0004,
          planeFallSpeed:.001,
          planeMinSpeed:1.2,
          planeMaxSpeed:1.6,
          planeSpeed:0,
          planeCollisionDisplacementX:0,
          planeCollisionSpeedX:0,

          planeCollisionDisplacementY:0,
          planeCollisionSpeedY:0,

          seaRadius:600,
          seaLength:800,
          //seaRotationSpeed:0.006,
          wavesMinAmp : 5,
          wavesMaxAmp : 20,
          wavesMinSpeed : 0.001,
          wavesMaxSpeed : 0.003,

          cameraFarPos:500,
          cameraNearPos:150,
          cameraSensivity:0.002,

          coinDistanceTolerance:15,
          coinValue:3,
          coinsSpeed:.5,
          coinLastSpawn:0,
          distanceForCoinsSpawn:100,

          ennemyDistanceTolerance:10,
          ennemyValue:10,
          ennemiesSpeed:.6,
          ennemyLastSpawn:0,
          distanceForEnnemiesSpawn:50,

          status : "playing",
         };
  fieldLevel.innerHTML = Math.floor(game.level);
}
}

//var shaderMaterial


//createScene() Variables
var scene, camera, fieldOfView, aspectRatio, nearPlane, farPlane, renderer, container, group, group1, group2, HEIGHT, WIDTH;
//InitializeAudioVariables()
var context, src, analyser, bufferLength, dataArray;
//UpdateAudioVariables()
var lowerHalfArray, upperHalfArray, overallAvg, lowerMax, lowerAvg, upperMax, upperAvg, lowerMaxFr, lowerAvgFr, upperMaxFr, upperAvgFr;
//Scene, Audio, Window & Input Management
{
	function createScene(){
		HEIGHT = window.innerHeight;
		WIDTH = window.innerWidth;
		scene = new THREE.Scene();

		aspectRatio = WIDTH / HEIGHT;
		fieldOfView = 60;
		nearPlane = 1;
		farPlane = 10000;
		camera = new THREE.PerspectiveCamera(
			fieldOfView,
			aspectRatio,
			nearPlane,
			farPlane
		);
		group = new THREE.Group();
		group1 = new THREE.Group();
		group2 = new THREE.Group();

		scene.fog = new THREE.Fog("rgb(100, 0, 0)", 100,950);
		camera.position.x = 0;
		camera.position.z = 150;
		camera.position.y = 100;

		renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
		renderer.setSize(WIDTH, HEIGHT);
		renderer.shadowMap.enabled = true;
		container = document.getElementById('out').appendChild(renderer.domElement);
		window.addEventListener('resize', onWindowResize, false);
	}

	function onWindowResize() {
		HEIGHT = window.innerHeight;
		WIDTH = window.innerWidth;
		renderer.setSize(WIDTH, HEIGHT);
		camera.aspect = WIDTH / HEIGHT;
		camera.updateProjectionMatrix();
	}

	function handleMouseMove(event) {
		var tx = -1 + (event.clientX / WIDTH)*2;
		var ty = 1 - (event.clientY / HEIGHT)*2;
		mousePos = {x:tx, y:ty};
	}
		
	function handleTouchMove(event) {
		event.preventDefault();
		var tx = -1 + (event.touches[0].pageX / WIDTH)*2;
		var ty = 1 - (event.touches[0].pageY / HEIGHT)*2;
		mousePos = {x:tx, y:ty};
	}
		
	function handleMouseUp(event){
		if (game.status == "waitingReplay"){
			resetGame();
			hideReplay();
		}
	}
		
	function handleTouchEnd(event){
		if (game.status == "waitingReplay"){
			resetGame();
			hideReplay();
		}
	}

	//Initializing Audio Management Variables
	function initializeAudioVariables(){
			//AudioContext() is a linked list of Audio nodes that contains audio data
			context = new AudioContext();
			//creates an AudioSource node that can be used to manipulate audio data
			src = context.createMediaElementSource(audio);
			//creates an Analyser node that allows us to read audio data
			analyser = context.createAnalyser();
			//allows rw access to the audio files
			src.connect(analyser);
			analyser.connect(context.destination);
			//sample size used when performing Fourier Transform to get frequency Data
			analyser.fftSize = 2048;
			//readonly integer, only half of analyser.fftSize. it is the amoount of data
			//values availble for any music visualizations
			bufferLength = analyser.frequencyBinCount;
			//standard 8-bit integers, holds the values of bufferLength for future use
			dataArray = new Uint8Array(bufferLength);
	}

	function updateAudioVariables(){
		analyser.getByteFrequencyData(dataArray);
		this.lowerHalfArray = dataArray.slice(0, (dataArray.length/2) - 1);
		this.upperHalfArray = dataArray.slice((dataArray.length/2) - 1, dataArray.length - 1);
		this.overallAvg = avg(dataArray);
		this.lowerMax = max(lowerHalfArray);
		this.lowerAvg = avg(lowerHalfArray);
		this.upperMax = max(upperHalfArray);
		this.upperAvg = avg(upperHalfArray);
		this.lowerMaxFr = lowerMax / lowerHalfArray.length;
		this.lowerAvgFr = lowerAvg / lowerHalfArray.length;
		this.upperMaxFr = upperMax / upperHalfArray.length;
		this.upperAvgFr = upperAvg / upperHalfArray.length;
	}
}

function AddCubes(){

	var cubeGeometry = new THREE.BoxGeometry(20,10,1000, 1, 1, 50);
	var cubeMaterial = new THREE.MeshBasicMaterial({
		color: new THREE.Color(1, 0, 0),
		wireframe: true
	});

	var cube = [];
	var n=30;
	for(i = 0; i<n; i++){
		var rot2 = new THREE.Matrix4();
		var rot = new THREE.Matrix4();
		var tra = new THREE.Matrix4();
		var combined = new THREE.Matrix4();

		tra.makeTranslation(0, 100, 0);
		rot.makeRotationZ(i*(2*Math.PI/n));

		combined.multiply(rot);
		combined.multiply(tra);

		cube[i] = new THREE.Mesh(cubeGeometry, cubeMaterial);
		cube[i].applyMatrix(combined);
		scene.add(cube[i]);
	};
}

// Create & Add Partices, Enemies & Objectives
{
	Ennemy = function(){
		var geom = new THREE.TetrahedronGeometry(8,2);
		var mat = new THREE.MeshPhongMaterial({
		  color:Colors.red,
		  shininess:0,
		  specular:0xffffff,
		  shading:THREE.FlatShading
		});
		this.mesh = new THREE.Mesh(geom,mat);
		this.mesh.castShadow = true;
		this.angle = 0;
		this.dist = 0;
	}
	
	EnnemiesHolder = function (){
		this.mesh = new THREE.Object3D();
		this.ennemiesInUse = [];
	}
	
	EnnemiesHolder.prototype.spawnEnnemies = function(){
		var nEnnemies = game.level;
	  
		for (var i=0; i<nEnnemies; i++){
		  var ennemy;
		  if (ennemiesPool.length) {
			ennemy = ennemiesPool.pop();
		  }else{
			ennemy = new Ennemy();
		  }
	  
		  ennemy.angle = - (i*0.1);
		  ennemy.distance = game.seaRadius + game.planeDefaultHeight + (-1 + Math.random() * 2) * (game.planeAmpHeight-20);
		  ennemy.mesh.position.y = -game.seaRadius + Math.sin(ennemy.angle)*ennemy.distance;
		  ennemy.mesh.position.x = Math.cos(ennemy.angle)*ennemy.distance;
	  
		  this.mesh.add(ennemy.mesh);
		  this.ennemiesInUse.push(ennemy);
		}
	}
	
	EnnemiesHolder.prototype.rotateEnnemies = function(){
		for (var i=0; i<this.ennemiesInUse.length; i++){
		  var ennemy = this.ennemiesInUse[i];
		  ennemy.angle += game.speed*deltaTime*game.ennemiesSpeed;
	  
		  if (ennemy.angle > Math.PI*2) ennemy.angle -= Math.PI*2;
	  
		  ennemy.mesh.position.y = -game.seaRadius + Math.sin(ennemy.angle)*ennemy.distance;
		  ennemy.mesh.position.x = Math.cos(ennemy.angle)*ennemy.distance;
		  ennemy.mesh.rotation.z += Math.random()*.1;
		  ennemy.mesh.rotation.y += Math.random()*.1;
	  
		  //var globalEnnemyPosition =  ennemy.mesh.localToWorld(new THREE.Vector3());
		  var diffPos = airplane.mesh.position.clone().sub(ennemy.mesh.position.clone());
		  var d = diffPos.length();
		  if (d<game.ennemyDistanceTolerance){
			particlesHolder.spawnParticles(ennemy.mesh.position.clone(), 15, Colors.red, 3);
	  
			ennemiesPool.unshift(this.ennemiesInUse.splice(i,1)[0]);
			this.mesh.remove(ennemy.mesh);
			game.planeCollisionSpeedX = 100 * diffPos.x / d;
			game.planeCollisionSpeedY = 100 * diffPos.y / d;
			ambientLight.intensity = 2;
	  
			removeEnergy();
			i--;
		  }else if (ennemy.angle > Math.PI){
			ennemiesPool.unshift(this.ennemiesInUse.splice(i,1)[0]);
			this.mesh.remove(ennemy.mesh);
			i--;
		  }
		}
	}
	
	Particle = function(){
		var geom = new THREE.TetrahedronGeometry(3,0);
		var mat = new THREE.MeshPhongMaterial({
		  color:0x009999,
		  shininess:0,
		  specular:0xffffff,
		  shading:THREE.FlatShading
		});
		this.mesh = new THREE.Mesh(geom,mat);
	}
	
	Particle.prototype.explode = function(pos, color, scale){
		var _this = this;
		var _p = this.mesh.parent;
		this.mesh.material.color = new THREE.Color( color);
		this.mesh.material.needsUpdate = true;
		this.mesh.scale.set(scale, scale, scale);
		var targetX = pos.x + (-1 + Math.random()*2)*50;
		var targetY = pos.y + (-1 + Math.random()*2)*50;
		var speed = .6+Math.random()*.2;
		TweenMax.to(this.mesh.rotation, speed, {x:Math.random()*12, y:Math.random()*12});
		TweenMax.to(this.mesh.scale, speed, {x:.1, y:.1, z:.1});
		TweenMax.to(this.mesh.position, speed, {x:targetX, y:targetY, delay:Math.random() *.1, ease:Power2.easeOut, onComplete:function(){
			if(_p) _p.remove(_this.mesh);
			_this.mesh.scale.set(1,1,1);
			particlesPool.unshift(_this);
		  }});
	}
	
	ParticlesHolder = function (){
		this.mesh = new THREE.Object3D();
		this.particlesInUse = [];
	}
	  
	ParticlesHolder.prototype.spawnParticles = function(pos, density, color, scale){
	  
		var nPArticles = density;
		for (var i=0; i<nPArticles; i++){
		  var particle;
		  if (particlesPool.length) {
			particle = particlesPool.pop();
		  }else{
			particle = new Particle();
		  }
		  this.mesh.add(particle.mesh);
		  particle.mesh.visible = true;
		  var _this = this;
		  particle.mesh.position.y = pos.y;
		  particle.mesh.position.x = pos.x;
		  particle.explode(pos,color, scale);
		}
	}
	  
	Coin = function(){
		var geom = new THREE.TetrahedronGeometry(5,0);
		var mat = new THREE.MeshPhongMaterial({
		  color:0x009999,
		  shininess:0,
		  specular:0xffffff,
	  
		  shading:THREE.FlatShading
		});
		this.mesh = new THREE.Mesh(geom,mat);
		this.mesh.castShadow = true;
		this.angle = 0;
		this.dist = 0;
	}
	  
	CoinsHolder = function (nCoins){
		this.mesh = new THREE.Object3D();
		this.coinsInUse = [];
		this.coinsPool = [];
		for (var i=0; i<nCoins; i++){
		  var coin = new Coin();
		  this.coinsPool.push(coin);
		}
	}
	  
	CoinsHolder.prototype.spawnCoins = function(){
	  
		var nCoins = 1 + Math.floor(Math.random()*10);
		var d = game.seaRadius + game.planeDefaultHeight + (-1 + Math.random() * 2) * (game.planeAmpHeight-20);
		var amplitude = 10 + Math.round(Math.random()*10);
		for (var i=0; i<nCoins; i++){
		  var coin;
		  if (this.coinsPool.length) {
			coin = this.coinsPool.pop();
		  }else{
			coin = new Coin();
		  }
		  this.mesh.add(coin.mesh);
		  this.coinsInUse.push(coin);
		  coin.angle = - (i*0.02);
		  coin.distance = d + Math.cos(i*.5)*amplitude;
		  coin.mesh.position.y = -game.seaRadius + Math.sin(coin.angle)*coin.distance;
		  coin.mesh.position.x = Math.cos(coin.angle)*coin.distance;
		}
	}
	  
	CoinsHolder.prototype.rotateCoins = function(){
		for (var i=0; i<this.coinsInUse.length; i++){
		  var coin = this.coinsInUse[i];
		  if (coin.exploding) continue;
		  coin.angle += game.speed*deltaTime*game.coinsSpeed;
		  if (coin.angle>Math.PI*2) coin.angle -= Math.PI*2;
		  coin.mesh.position.y = -game.seaRadius + Math.sin(coin.angle)*coin.distance;
		  coin.mesh.position.x = Math.cos(coin.angle)*coin.distance;
		  coin.mesh.rotation.z += Math.random()*.1;
		  coin.mesh.rotation.y += Math.random()*.1;
	  
		  //var globalCoinPosition =  coin.mesh.localToWorld(new THREE.Vector3());
		  var diffPos = airplane.mesh.position.clone().sub(coin.mesh.position.clone());
		  var d = diffPos.length();
		  if (d<game.coinDistanceTolerance){
			this.coinsPool.unshift(this.coinsInUse.splice(i,1)[0]);
			this.mesh.remove(coin.mesh);
			particlesHolder.spawnParticles(coin.mesh.position.clone(), 5, 0x009999, .8);
			addEnergy();
			i--;
		  }else if (coin.angle > Math.PI){
			this.coinsPool.unshift(this.coinsInUse.splice(i,1)[0]);
			this.mesh.remove(coin.mesh);
			i--;
		  }
		}
	}
	
	function createCoins(){
		coinsHolder = new CoinsHolder(20);
		scene.add(coinsHolder.mesh)
	}
	
	function createEnnemies(){
		for (var i=0; i<10; i++){
		  var ennemy = new Ennemy();
		  ennemiesPool.push(ennemy);
		}
		ennemiesHolder = new EnnemiesHolder();
		//ennemiesHolder.mesh.position.y = -game.seaRadius;
		scene.add(ennemiesHolder.mesh)
	}
	  
	function createParticles(){
		for (var i=0; i<10; i++){
		  var particle = new Particle();
		  particlesPool.push(particle);
		}
		particlesHolder = new ParticlesHolder();
		//ennemiesHolder.mesh.position.y = -game.seaRadius;
		scene.add(particlesHolder.mesh)
	}
}

function CreateSpheres(){

}
var ball1, ball2;
function AddSpheres(){
	var icosahedronGeometry = new THREE.IcosahedronGeometry(10, 3); //Adjustable Values//
	var ballMaterial = new THREE.MeshLambertMaterial({
		color: new THREE.Color("rgb(255, 0, 0)"),
		//new THREE.Color("rgb(0, 0, 100)"),
		//0xff00ee,
		wireframe: true
	});
	ball1 = new THREE.Mesh(icosahedronGeometry, ballMaterial);
	ball2 = new THREE.Mesh(icosahedronGeometry, ballMaterial);
	ball1.position.y = 105;
	ball1.position.x = 75;
	ball2.position.y = 105;
	ball2.position.x = -75;
	group1.add(ball1);
	group1.add(ball2);
	scene.add(group1);
}

var playerLoader, playerMesh, scaleFactIn;
function AddPlayerModel(){
	playerLoader = new THREE.PLYLoader();
	scaleFactIn = 5.0;
	playerLoader.load('models/small_fighter.ply', function(geometry){
		geometry.computeVertexNormals();
		geometry.computeBoundingBox
	});
}


var clock, stats, controlParameters, mesh, uniforms, composer, shaderMaterial;

function AddShaders(){
	clock = new THREE.Clock(true);
	stats = new Stats();
	stats.dom.style.cssText = "";
	//document.getElementById("sketch-stats").appendChild(stats.dom);

	uniforms = {
		u_time : {
			type : "f",
			value : 0.0
		},
		u_frame : {
			type : "f",
			value : 0.0
		},
		u_resolution : {
			type : "v2",
			value : new THREE.Vector2(window.innerWidth, window.innerHeight)
					.multiplyScalar(window.devicePixelRatio)
		},
		u_mouse : {
			type : "v2",
			value : new THREE.Vector2(0.5 * window.innerWidth, window.innerHeight)
					.multiplyScalar(window.devicePixelRatio)
		},
		u_texture : {
			type : "t",
			value : null
		}
	};

	// Create the shader material
	shaderMaterial = new THREE.ShaderMaterial({
		uniforms : uniforms,
		vertexShader : document.getElementById("vertexShader").textContent,
		fragmentShader : document.getElementById("fragmentShader").textContent
	});

	// Initialize the effect composer
	composer = new THREE.EffectComposer(renderer);
	composer.addPass(new THREE.RenderPass(scene, camera));

	// Add the post-processing effect
	var effect = new THREE.ShaderPass(material, "u_texture");
	effect.renderToScreen = true;
	composer.addPass(effect);
}





	function play(event) {

		fieldDistance = document.getElementById("distValue");
		energyBar = document.getElementById("energyBar");
		replayMessage = document.getElementById("replayMessage");
		fieldLevel = document.getElementById("levelValue");
		levelCircle = document.getElementById("levelCircleStroke");
		document.addEventListener('mousemove', handleMouseMove, false);

		//AddShaders();

		initializeAudioVariables();

		createScene();
		
		//Add Plane Geometry (Outside border Planes use same concept as lab week3 mobius strip)
		{
			var planeGeometry = new THREE.PlaneGeometry(315, 1500, 20, 50);
			var planeMaterial = new THREE.MeshLambertMaterial({
				color: 0x68228b, //Adjustable Values
				//new THREE.Color("rgb(100, 0, 0)"),
				//0x68228b
				side: THREE.DoubleSide,
				wireframe: true
			});
			//Established Plane Array, fundamentally similar to Workshop Lectures
			var n=40;
			var planeArr = [n];
			
			function getPlanes(num){
				for(i = 0; i<n; i++){
					var rot = new THREE.Matrix4();
					var rot2 = new THREE.Matrix4();
					var tra = new THREE.Matrix4();
					var combined = new THREE.Matrix4();

					rot2.makeRotationX(-0.5 * Math.PI);
					rot.makeRotationZ(i*(2*Math.PI/n));
					tra.makeTranslation(0,2000,0);

					combined.multiply(rot);
					combined.multiply(tra);
					combined.multiply(rot2);

					planeArr[i] = new THREE.Mesh(planeGeometry, planeMaterial);
					
					planeArr[i].applyMatrix(combined);
				}
				return planeArr[num];
			};

			var bgplaneGeometry = new THREE.PlaneGeometry(1500, 1500, 50, 50);
			var bgplaneMat =  new THREE.MeshLambertMaterial({
				color: "rgb(100, 0, 0)", //Adjustable Values
				//new THREE.Color("rgb(100, 0, 0)"),
				//0x68228b
				side: THREE.DoubleSide,
				wireframe: false
			});

			var backgroundPlane = new THREE.Mesh(bgplaneGeometry, bgplaneMat);
			backgroundPlane.position.y = 105;
			backgroundPlane.position.z = -1000

			//scene.add(backgroundPlane);

			group.add(getPlanes(0));
			for(i = 1; i<n; i++){
				group.add(planeArr[i]);
			}

			group2.add(getPlanes(0));
			for(i = 1; i<n; i++){
				group2.add(planeArr[i]);
			}
			group.position.y = -2000;
			group2.position.y = 2250;
			group2.position.z = -400;
			group.position.z = -400;
			scene.add(group);
			scene.add(group2);
		
		}

		AddSpheres();


		//Add Temp Player Geometry
		{
			var cubeGeometry = new THREE.BoxGeometry(20,20,20,1,1,1);
			var cubeMat = new THREE.MeshLambertMaterial({
				color: 0xff00ee,
				//new THREE.Color("rgb(0, 0, 100)"),
				//0xff00ee,
				wireframe: true
			});
			var cube = new THREE.Mesh(cubeGeometry, cubeMat);
			cube.position.y = 100;
			scene.add(cube);
		}

		//Add Player Model
		{
//			var loader = new THREE.PLYLoader();
//			var playerMesh = null;
//			var ScaleFactIn = 5.0;
//			loader.load('models/small_fighter.ply', function(geometry)
//			{
//				geometry.computeVertexNormals();
//				geometry.computeBoundingBox();
//
//				var center = new THREE.Vector3();
//				var size = new THREE.Vector3();
//				geometry.boundingBox.getCenter(center);
//				geometry.boundingBox.getSize(size);
//				var min = geometry.boundingBox.min;
//
//				var sca = new THREE.Matrix4();
//				var tra = new THREE.Matrix4();
//
//				var ScaleFact = ScaleFactIn/size.length();
//				sca.makeScale(ScaleFact, ScaleFact, ScaleFact);
//				tra.makeTranslation(-center.x, -center.y, -min.z);
//
//				var shipMaterial = new THREE.MeshLambertMaterial({
//					color: new THREE.Color("rgb(255, 0, 0)"),
//					wireframe: true
//				});
//
//				playerMesh = new THREE.Mesh(geometry, shipMaterial);
//				playerMesh.applyMatrix(tra);
//				playerMesh.applyMatrix(sca);
//
//				playerMesh.name = "player_mesh";
//
//				scene.add(playerMesh);
//			} );
		}

		//Add Lights
		{
			var ambientLight = new THREE.AmbientLight(0xaaaaaa);
			var spotLight = new THREE.SpotLight(0xffffff);
			spotLight.intensity = 0.9; //Adjustable Values
			spotLight.position.set(-10, 40, 20);
			spotLight.lookAt(ball1);
			spotLight.castShadow = true;
			scene.add(ambientLight);
			scene.add(spotLight);
		}

		//createCoins();
		//createEnnemies();
		//createParticles();
		
		function updatePlayer(mesh, amount){
			var targetY = normalize(amount,-.75,.75,25, 150);
			var targetX = normalize(amount,-.75,.75,-100, 100);
			mesh.position.y += (targetY-mesh.position.y)*0.1;
			mesh.rotation.z = (targetY-mesh.position.y)*0.0128;
			mesh.rotation.x = (mesh.position.y-targetY)*0.0064;
			//mousePos.y
			//mousePos.x
		}

		function updateShaders(){

		}

//		function updatePlayer(mesh){
//
//			game.planeSpeed = normalize(mousePos.x,-.5,.5,game.planeMinSpeed, game.planeMaxSpeed);
//			var targetY = normalize(mousePos.y,-.75,.75,game.planeDefaultHeight-game.planeAmpHeight, game.planeDefaultHeight+game.planeAmpHeight);
//			var targetX = normalize(mousePos.x,-1,1,-game.planeAmpWidth*.7, -game.planeAmpWidth);
//		  
//			game.planeCollisionDisplacementX += game.planeCollisionSpeedX;
//			targetX += game.planeCollisionDisplacementX;
//		  
//		  
//			game.planeCollisionDisplacementY += game.planeCollisionSpeedY;
//			targetY += game.planeCollisionDisplacementY;
//		  
//			mesh.position.y += (targetY-mesh.position.y)*deltaTime*game.planeMoveSensivity;
//			mesh.position.x += (targetX-mesh.position.x)*deltaTime*game.planeMoveSensivity;
//		  
//			mesh.rotation.z = (targetY-mesh.position.y)*deltaTime*game.planeRotXSensivity;
//			mesh.rotation.x = (mesh.position.y-targetY)*deltaTime*game.planeRotZSensivity;
//			var targetCameraZ = normalize(game.planeSpeed, game.planeMinSpeed, game.planeMaxSpeed, game.cameraNearPos, game.cameraFarPos);
//			camera.fov = normalize(mousePos.x,-1,1,40, 80);
//			camera.updateProjectionMatrix ()
//			camera.position.y += (mesh.position.y - camera.position.y)*deltaTime*game.cameraSensivity;
//		  
//			game.planeCollisionSpeedX += (0-game.planeCollisionSpeedX)*deltaTime * 0.03;
//			game.planeCollisionDisplacementX += (0-game.planeCollisionDisplacementX)*deltaTime *0.01;
//			game.planeCollisionSpeedY += (0-game.planeCollisionSpeedY)*deltaTime * 0.03;
//			game.planeCollisionDisplacementY += (0-game.planeCollisionDisplacementY)*deltaTime *0.01;
//		  
//		}

		function updateCameraFov(amount){
			camera.fov = normalize(amount,-1,1,50, 70);
			camera.updateProjectionMatrix();
		}
		//mousePos.x
			
		function normalize(v,vmin,vmax,tmin, tmax){
			var nv = Math.max(Math.min(v,vmax), vmin);
			var dv = vmax-vmin;
			var pc = (nv-vmin)/dv;
			var dt = tmax-tmin;
			var tv = tmin + (pc*dt);
			return tv;
		}

		//document.getElementById('out').appendChild(renderer.domElement);
		window.addEventListener('resize', onWindowResize, false);
		document.getElementById('out').appendChild(renderer.domElement);

		document.addEventListener('mousemove', handleMouseMove, false);
		document.addEventListener('touchmove', handleTouchMove, false);
		document.addEventListener('mouseup', handleMouseUp, false);
		document.addEventListener('touchend', handleTouchEnd, false);

	function render() {
		updateAudioVariables();
	
		updateShaders();
		updatePlayer(cube, overallAvg/150);
		updateCameraFov(overallAvg/150);
	
		//Adds Mesh Distortion
		{
			distortPlane(getPlanes(0), modulate(upperAvgFr, 0, 1, 0.5, 4));
			distortBall(ball1, modulate(Math.pow(lowerMaxFr, 0.8), 0, 1, 0, 8), modulate(upperAvgFr, 0, 1, 0, 4));
			distortBall(ball2, modulate(Math.pow(lowerMaxFr, 0.8), 0, 1, 0, 8), modulate(upperAvgFr, 0, 1, 0, 4));
		}
	
		//Adds Rotation Values
		{
			var ballRotSpd = (overallAvg/10500) //Adjustable Value//
			//var ballRotSpd = 0.005;
			ball1.rotation.x += ballRotSpd;
			ball1.rotation.y += ballRotSpd;
			ball1.rotation.z += ballRotSpd;
			ball2.rotation.x += ballRotSpd;
			ball2.rotation.y += ballRotSpd;
			ball2.rotation.z += ballRotSpd;

			//group1
			//group1.rotation.z += ballRotSpd/2;
			
			group.rotation.z += ballRotSpd/2;
			group2.rotation.z += -ballRotSpd/2;
		}
		renderer.render(scene, camera);
		requestAnimationFrame(render);
	}
		render();
		audio.play();
	}

	// HANDLE MOUSE EVENTS
	var mousePos = { x: 0, y: 0 };
	function handleMouseMove(event) {
	  var tx = -1 + (event.clientX / WIDTH)*2;
	  var ty = 1 - (event.clientY / HEIGHT)*2;
	  mousePos = {x:tx, y:ty};
	}

	//document.body.addEventListener('touchend', function(ev) { context.resume(); });

	//Mesh Distortion Functions
	{
		//distorts the ball mesh with bass and treble data from audio file
		function distortBall(mesh, bassFr, treFr) {
			//calculates new locations for every verticie in the mesh
			mesh.geometry.vertices.forEach(function (vertex, i) {
				var offset = mesh.geometry.parameters.radius;
				//Base Amplifier value
				var amp = 10; //Adjustable value//
				//returns the number of milliseconds since 1st jan 1970, for extra random noise
				var time = Date.now();
				vertex.normalize();
				var rf = 0.00001;
				//calculating new vert distance from base mesh
				var distance = (offset + bassFr ) + noise.noise3D(vertex.x + time *rf*7, vertex.y +  time*rf*8, vertex.z + time*rf*9) * amp * treFr;
				vertex.multiplyScalar(distance);
			});
			//just updates the object's verticies and faces
			mesh.geometry.verticesNeedUpdate = true;
			mesh.geometry.normalsNeedUpdate = true;
			mesh.geometry.computeVertexNormals();
			mesh.geometry.computeFaceNormals();
		}

		//same as distortBall, except it uses 2D noise instead of 3D, moves in Z direction instead of multiplyScalar
		function distortPlane(mesh, distortionFr) {
			mesh.geometry.vertices.forEach(function (vertex, i) {
				var amp = 20;
				var time = Date.now();
				var distance = (noise.noise2D(vertex.x + time * 0.0003, vertex.y + time * 0.0001) + 0) * distortionFr * amp;
				vertex.z = distance;
			});
			mesh.geometry.verticesNeedUpdate = true;
			mesh.geometry.normalsNeedUpdate = true;
			mesh.geometry.computeVertexNormals();
			mesh.geometry.computeFaceNormals();
		}
	}

	//Misc Calculation Functions
	{
		//like, does fractions, man
		function fractionate(val, minVal, maxVal) {
			return (val - minVal)/(maxVal - minVal);
		}
		//returns changes in volume and Frequency
		function modulate(val, minVal, maxVal, outMin, outMax) {
			var fr = fractionate(val, minVal, maxVal);
			var delta = outMax - outMin;
			return outMin + (fr * delta);
		}
		//Returns Average of audio frequencies
		function avg(arr){
			var total = arr.reduce(function(sum, b) { return sum + b; });
			return (total / arr.length);
		}
		//Returns maximum of each frequency
		function max(arr){
			return arr.reduce(function(a, b){ return Math.max(a, b); })
		}
	}

	window.addEventListener('load', play, false);