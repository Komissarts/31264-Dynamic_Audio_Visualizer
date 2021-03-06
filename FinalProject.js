//Made By Andres Roco 14250791
//31264 Introduction to Computer Graphics
//Dynamic Audio Visualizer
//Github: https://github.com/Komissarts/31264-Dynamic_Audio_Visualizer
//Discord: Hobo Joe Snr#1780

//To-Do
//	- Post Processing Shaders
//	- Dynamic Colour

//Document Onload & File Switch
{
	var file = document.getElementById("thefile");
	var audio = document.getElementById("audio");
	var fileLabel = document.querySelector("label.file");

	//Starts Scene when loaded
	document.onload = function(){
		console.log(e);
		audio.play();
		init();
	}
	//Resets scene whenever a new file is inputed
	file.onchange = function(){
		fileLabel.classList.add('normal');
		audio.classList.add('active');
		var files = this.files;
		
		audio.src = URL.createObjectURL(files[0]);
		audio.load();
		audio.play();
		init();
	}
}

//Old Input Game Variables
{
	// GAME VARIABLES
	var game;
	var deltaTime = 0;
	var newTime = new Date().getTime();
	var oldTime = new Date().getTime();
	var ennemiesPool = [];
	var particlesPool = [];
	var particlesInUse = [];

	//function handleMouseUp(event){
	//	if (game.status == "waitingReplay"){
	//		resetGame();
	//		hideReplay();
	//	}
	//}
	//	
	//function handleTouchEnd(event){
	//	if (game.status == "waitingReplay"){
	//		resetGame();
	//		hideReplay();
	//	}
	//}


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

//Scene, Light, Shader, GUI & Audio Initialization
{
	//createScene() Variables
	var scene, camera, fieldOfView, aspectRatio, nearPlane, farPlane, renderer, container, group, group1, group2, HEIGHT, WIDTH, clock;
	function createScene(){
		HEIGHT = window.innerHeight;
		WIDTH = window.innerWidth;
		scene = new THREE.Scene();
		clock = new THREE.Clock(true);
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
		//ThreeJS Groups for scene management
		group = new THREE.Group();
		group1 = new THREE.Group();
		group2 = new THREE.Group();

		//Fog for Lighting Effects
		scene.fog = new THREE.Fog("rgb(100, 0, 0)", 100,950);
		camera.position.x = 0;
		camera.position.z = 150;
		camera.position.y = 100;

		renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
		renderer.setSize(WIDTH, HEIGHT);
		renderer.shadowMap.enabled = true;
		

		container = document.getElementById('out').appendChild(renderer.domElement);
	}

	//Shader Variables
	var uniforms, shamat_tvStatic, SP_tvStatic_effect, SP_RGBShift_effect, 
	shamat_RGBShift, composer, shamat_pencilshader, shamat_stripeshader;
	function addShaders(){
		//Uniforms
		uniforms = {
			u_alpha : {

			},
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

		// Create the shader materials
		this.shamat_tvStatic = new THREE.ShaderMaterial({
			uniforms : uniforms,
			vertexShader : document.getElementById("tvstatic_vertexShader"),
			fragmentShader : document.getElementById("tvstatic_fragmentShader")
		});

		this.shamat_RGBShift = new THREE.ShaderMaterial({
			uniforms : uniforms,
			vertexShader : document.getElementById("rgbshift__vertexShader"),
			fragmentShader : document.getElementById("rgbshift__fragmentShader")
		});

		this.shamat_pencilshader = new THREE.ShaderMaterial({
			uniforms : uniforms,
			vertexShader : document.getElementById("pencilshader_vertexShader").textContent,
			fragmentShader : document.getElementById("pencilshader_fragmentShader").textContent,
			side : THREE.DoubleSide,
			transparent : true,
			extensions : {
				derivatives : true
			}
		});

		this.shamat_stripeshader = new THREE.ShaderMaterial({
			uniforms : uniforms,
			vertexShader : document.getElementById("stripeshader_vertexShader").textContent,
			fragmentShader : document.getElementById("stripeshader_fragmentShader").textContent,
			side : THREE.DoubleSide,
			transparent : true,
			extensions : {
				derivatives : true
			}
		});

		////UNCAUGHT REFERENCE ERROR: EFFECTCOMPOSER IS NOT DEFINED??????
		//this.composer = new EffectComposer(this.renderer);
		//this.composer.addPass(new RenderPass(this.scene, this.camera));
		//// Add the post-processing effect
		//SP_tvStatic_effect = new ShaderPass(shamat_tvStatic, "u_texture");
		//SP_tvStatic_effect.renderToScreen = true;
		//composer.addPass(SP_tvStatic_effect);
	}

	//Adds Lights
	var ambientLight, spotLight;
	function addLights(){
		ambientLight = new THREE.AmbientLight(0xaaaaaa);
		spotLight = new THREE.SpotLight(0xffffff);
		spotLight.intensity = 0.9; //Adjustable Values
		spotLight.position.set(-10, 40, 20);
		spotLight.lookAt(ball1);
		spotLight.castShadow = true;
		scene.add(ambientLight);
		scene.add(spotLight);
	}

	var gui, params;
	function addGUI(){
		gui = new dat.GUI();
		gui.add(params, 'Geometry', ["Torus knot", "Sphere", "Icosahedron", "Cube", "Tetrahedron"]).onFinishChange(AddMainMeshes);

		gui.add(params, 'Sphere_amplitude', 5, 40).onChange( function(val){
			sphere_amp = val;
		});
		gui.add(params, 'Cylindrical_amplitude', 5, 50).onChange( function(val){
			floor_amp = val;
		});
		gui.add(params, 'StripeShaderModifier', 0.0005, 0.005).onChange( function(val){
			StripeShaderupdatemodifier = val;
		});
		gui.open();
	}
	
	var context, src, analyser, bufferLength, dataArray;
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
}

//Frame Update Functions
{
	//Updates Input Audio Data & seperates Frequency Data into usable frequency bands
	var lowerHalfArray, upperHalfArray, overallAvg, lowerMax, lowerAvg, 
	upperMax, upperAvg, lowerMaxFr, lowerAvgFr, upperMaxFr, upperAvgFr;
	function updateAudioVariables(){
		//Gets Byte Frequency from audio data array
		analyser.getByteFrequencyData(dataArray);
		//Seperates into Lower & Upper halves of the audio frequencies into seperate arrays
		this.lowerHalfArray = dataArray.slice(0, (dataArray.length/2) - 1);
		this.upperHalfArray = dataArray.slice((dataArray.length/2) - 1, dataArray.length - 1);
		//Overall Average of Audio Frequency
		this.overallAvg = avg(dataArray);
		//Max and Average of the lower half of Array
		this.lowerMax = max(lowerHalfArray);
		this.lowerAvg = avg(lowerHalfArray);
		//Max and Average of the upper half of Array
		this.upperMax = max(upperHalfArray);
		this.upperAvg = avg(upperHalfArray);
		//Parses Array input into usable frequency data
		this.lowerMaxFr = lowerMax / lowerHalfArray.length;
		this.lowerAvgFr = lowerAvg / lowerHalfArray.length;
		this.upperMaxFr = upperMax / upperHalfArray.length;
		this.upperAvgFr = upperAvg / upperHalfArray.length;
	}

	//Moves Input Mesh Up & Down using input frequencies, adds 
	//dynamic rotation for extra visual interest
	function updateMesh(mesh, distortionFr){
		var targetY = normalize(distortionFr,-.75,.75,25, 150);
		var targetX = normalize(distortionFr,-.75,.75,-100, 100);
		mesh.position.y += (targetY-mesh.position.y)*0.1;
		mesh.rotation.z = (targetY-mesh.position.y)*0.0128;
		mesh.rotation.x = (mesh.position.y-targetY)*0.0064;
	}

	//Adjusts CameraFOV using input frequencies
	function updateCameraFov(distortionFr){
		camera.fov = normalize(distortionFr,-1,1,50, 70);
		camera.updateProjectionMatrix();
	}

	//Simplex Noise importing
	var noise = new SimplexNoise();
	var sphere_amp = 10;
	//distorts the ball mesh with bass and treble data from audio file
	function distortBall(mesh, bassFr, treFr) {
				//calculates new locations for every verticie in the mesh
				mesh.geometry.vertices.forEach(function (vertex, i) {
					vertex.normalize();
					var offset = mesh.geometry.parameters.radius;
					//returns the number of milliseconds since 1st jan 1970, for extra random noise
					var time = Date.now();
					var rf = 0.00001;
					//calculating new vert distance from base mesh using Simplex Noise, randomized Time values and input Music Frequencies
					var distance = (offset + bassFr ) + noise.noise3D(vertex.x + time *rf*7, vertex.y +  time*rf*8, vertex.z + time*rf*9) * sphere_amp * treFr;
					vertex.multiplyScalar(distance);
				});
				//just updates the object's verticies and faces
				mesh.geometry.verticesNeedUpdate = true;
				mesh.geometry.normalsNeedUpdate = true;
				mesh.geometry.computeVertexNormals();
				mesh.geometry.computeFaceNormals();
	}

	//Base amplitude variable - adjustable
	var floor_amp = 20;
	//Distorts the mesh using input frequency
	function distortMesh(mesh, distortionFr) {
				//ForEach function to iterate through every vertext in the mesh
				mesh.geometry.vertices.forEach(function (vertex, i) {
					//returns the number of milliseconds since 1st jan 1970, for extra random noise - adds movement without needing music
					var time = Date.now();
					//calculating new vert distance from base mesh using Simplex Noise, randomized Time values and input Music Frequencies
					var distance = (noise.noise2D(vertex.x + time * 0.0003, vertex.y + time * 0.0001) + 0) * distortionFr * floor_amp;
					vertex.z = distance;
				});
				//just updates the object's verticies and faces
				mesh.geometry.verticesNeedUpdate = true;
				mesh.geometry.normalsNeedUpdate = true;
				mesh.geometry.computeVertexNormals();
				mesh.geometry.computeFaceNormals();
	}

	//Animate Calls Render ever Frame
	function animate(){
		requestAnimationFrame(animate);
		//composer.render();
		render();
	}
	
	//Render Updates Animatons Every Frame
	var StripeShaderupdatemodifier = 0.002;
	function render() {
		
		updateAudioVariables();
	
		//Updates Mesh Distortion
		{
			distortMesh(planeArr[0], modulate(upperAvgFr, 0, 1, 0.5, 4));
			distortBall(ball1, modulate(Math.pow(lowerMaxFr, 0.8), 0, 1, 0, 8), modulate(upperAvgFr, 0, 1, 0, 4));
			distortBall(ball2, modulate(Math.pow(lowerMaxFr, 0.8), 0, 1, 0, 8), modulate(upperAvgFr, 0, 1, 0, 4));
		}
	
		//Updates Rotation Values
		{
			var ballRotSpd = (overallAvg/10500) //Adjustable Value//
			//var ballRotSpd = 0.005;
			ball1.rotation.x += ballRotSpd;
			ball1.rotation.y += ballRotSpd;
			ball1.rotation.z += ballRotSpd;
			ball2.rotation.x += ballRotSpd;
			ball2.rotation.y += ballRotSpd;
			ball2.rotation.z += ballRotSpd;

			cube1.rotation.y += lowerMaxFr/5;
			cube2.rotation.y += lowerAvgFr/5;
			cube3.rotation.y += overallAvg/500;
			cube4.rotation.y += upperMaxFr/5;
			cube5.rotation.y += upperAvgFr;
	
			//group1
			//group1.rotation.z += ballRotSpd/2;
			
			group.rotation.z += ballRotSpd/2;
			group2.rotation.z += -ballRotSpd/2;
		}

		//Updates Positional Values
		{
			updateMesh(cube1, lowerMaxFr);
			updateMesh(cube2, lowerAvgFr);
			updateMesh(cube3, overallAvg/150);
			updateMesh(cube4, upperMaxFr);
			updateMesh(cube5, upperAvgFr);
		}

		updateCameraFov(overallAvg/150);

		uniforms.u_time.value += overallAvg*StripeShaderupdatemodifier;
		uniforms.u_frame.value += 1.0;

		renderer.render(scene, camera);
		
	}
}

//Input Checks
{
	function onWindowResize() {
		HEIGHT = window.innerHeight;
		WIDTH = window.innerWidth;
		renderer.setSize(WIDTH, HEIGHT);
		camera.aspect = WIDTH / HEIGHT;
		camera.updateProjectionMatrix();

		composer.setSize(window.innerWidth, window.innerHeight);
		uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight).multiplyScalar(window.devicePixelRatio);
	}

	function handleMouseMove(event) {
		var tx = -1 + (event.clientX / WIDTH)*2;
		var ty = 1 - (event.clientY / HEIGHT)*2;
		mousePos = {x:tx, y:ty};

		//Updates Shader Uniforms on mousemoving
		uniforms.u_mouse.value.set(event.pageX, window.innerHeight - event.pageY).multiplyScalar(
			window.devicePixelRatio);
	}
		
	function handleTouchMove(event) {
		event.preventDefault();
		var tx = -1 + (event.touches[0].pageX / WIDTH)*2;
		var ty = 1 - (event.touches[0].pageY / HEIGHT)*2;
		mousePos = {x:tx, y:ty};

		//Updates Shader Uniforms on mousemoving
		uniforms.u_mouse.value.set(event.touches[0].pageX, window.innerHeight - event.touches[0].pageY).multiplyScalar(
			window.devicePixelRatio);
	}
}

//Misc Calculation Functions
{
	//Returns fraction of (val/minval) / (minVal/MaxVal) 
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
	//Normalize Inputs to work at different ranges
	function normalize(v,vmin,vmax,tmin, tmax){
		var nv = Math.max(Math.min(v,vmax), vmin);
		var dv = vmax-vmin;
		var pc = (nv-vmin)/dv;
		var dt = tmax-tmin;
		var tv = tmin + (pc*dt);
		return tv;
	}
}

//Add Objects To Scene
{
	//EarlyTestFunction
	function AddCubeArrayOld(){

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

	//Adds Two DistortionBalls
	var ball1, ball2;
	function AddSpheres(){
		var icosahedronGeometry = new THREE.IcosahedronGeometry(10, 3); //Adjustable Values//
		ball1 = new THREE.Mesh(icosahedronGeometry, shamat_pencilshader);
		ball2 = new THREE.Mesh(icosahedronGeometry, shamat_pencilshader);
		ball1.position.y = 105;
		ball1.position.x = 100;

		ball2.position.y = 105;
		ball2.position.x = -100;
		group1.add(ball1);
		group1.add(ball2);
		scene.add(group1);
	}

	//Adds the 5 Optional Meshes
	var cube1 = {}, cube2, cube3, cube4, cube5, meshGeometry;
	function AddMainMeshes(){
		scene.remove(cube1);
		scene.remove(cube2);
		scene.remove(cube3);
		scene.remove(cube4);
		scene.remove(cube5);

		if(params.Geometry == "Torus knot"){
			meshGeometry = new THREE.TorusKnotGeometry( 10, 3, 16, 4 );
		} else if(params.Geometry == "Sphere"){
			meshGeometry = new THREE.SphereGeometry(15);
		} else if(params.Geometry == "Icosahedron"){
			meshGeometry = new THREE.IcosahedronGeometry(15, 0);
		} else if(params.Geometry == "Cube"){
			meshGeometry = new THREE.BoxGeometry(20,20,20,1,1,1);
		} else if(params.Geometry == "Tetrahedron"){
			meshGeometry = new THREE.TetrahedronGeometry(20,0);
		}

		cube1 = new THREE.Mesh(meshGeometry, shamat_stripeshader);
		cube2 = new THREE.Mesh(meshGeometry, shamat_stripeshader);
		cube3 = new THREE.Mesh(meshGeometry, shamat_stripeshader);
		cube4 = new THREE.Mesh(meshGeometry, shamat_stripeshader);
		cube5 = new THREE.Mesh(meshGeometry, shamat_stripeshader);
		cube1.position.y = 100;
		cube2.position.y = 100;
		cube3.position.y = 100;
		cube4.position.y = 100;
		cube5.position.y = 100;

		cube1.position.x = -70;
		cube2.position.x = -35;
		cube3.position.x = 0;
		cube4.position.x = 35;
		cube5.position.x = 70;
		
		scene.add(cube1);
		scene.add(cube2);
		scene.add(cube3);
		scene.add(cube4);
		scene.add(cube5);
	}
	params = {
		"Geometry" : "Torus knot",
		"Sphere_amplitude" : sphere_amp,
		'Cylindrical_amplitude' : floor_amp,
		'StripeShaderModifier' : StripeShaderupdatemodifier
	}

	var planeArr;
	function addPlanes(){
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
		planeArr = [n];
		
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

	//Early attempt at adding a player model for game
	var playerLoader, playerMesh, scaleFactIn;
	function AddPlayerModel(){
		playerLoader = new THREE.PLYLoader();
		scaleFactIn = 5.0;
		playerLoader.load('models/small_fighter.ply', function(geometry){
			geometry.computeVertexNormals();
			geometry.computeBoundingBox
		});
	}
}

function init(event) {
	initializeAudioVariables();
	createScene();
	addShaders();
	addPlanes();
	AddSpheres();
	AddMainMeshes();
	addLights();
	addGUI();
	animate();
	audio.play();
}

//Window Event Listeners
{
	window.addEventListener('load', init, false);
	window.addEventListener('resize', onWindowResize, false);
	document.addEventListener('mousemove', handleMouseMove, false);
	//document.addEventListener('mouseup', handleMouseUp, false);
}