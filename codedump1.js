//IMPORT SPACESHIP MODEL FOR CRAFT
//CLEAN UP CODE LMAO

var noise = new SimplexNoise();

	

	var file = document.getElementById("thefile");
	var audio = document.getElementById("audio");
	var fileLabel = document.querySelector("label.file");
  
	document.onload = function(e){
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
	
  
	function play() {
		document.addEventListener('mousemove', handleMouseMove, false);
		//Initializing Variables
		{
			//AudioContext() is a linked list of Audio nodes that contains audio data
			var context = new AudioContext();
			//creates an AudioSource node that can be used to manipulate audio data
			var src = context.createMediaElementSource(audio);
			//creates an Analyser node that allows us to read audio data
			var analyser = context.createAnalyser();
			//allows rw access to the audio files
			src.connect(analyser);
			analyser.connect(context.destination);
			//sample size used when performing Fourier Transform to get frequency Data
			analyser.fftSize = 2048;
			//readonly integer, only half of analyser.fftSize. it is the amoount of data
			//values availble for any music visualizations
			var bufferLength = analyser.frequencyBinCount;
			//standard 8-bit integers, holds the values of bufferLength for future use
			var dataArray = new Uint8Array(bufferLength);
			//group to be able to edit/interact with all the side panels simultaneuosly
			//var group = new THREE.Group();
		}


		//Create & Add All Scene Items
		{
			//Add Camera, Scene & Renderer
			{
				var scene, camera, fieldOfView, aspectRatio, nearPlane, farPlane, renderer, container, group, group2, HEIGHT, WIDTH;
				createScene();

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
			}

			//Add Plane Geometry (Outside border Planes use same concept as lab week3 mobius strip)
			{
				var planeGeometry = new THREE.PlaneGeometry(210, 1200, 20, 50);
				var planeMaterial = new THREE.MeshLambertMaterial({
					color: 0x68228b, //Adjustable Values
					//new THREE.Color("rgb(100, 0, 0)"),
					//0x68228b
					side: THREE.DoubleSide,
					wireframe: true
				});
				//Established Plane Array, fundamentally similar to Workshop Lectures
				var planeArr = [20];
				var n=20
				function getPlanes(num){
					for(i = 0; i<n; i++){
						var rot = new THREE.Matrix4();
						var rot2 = new THREE.Matrix4();
						var tra = new THREE.Matrix4();
						var combined = new THREE.Matrix4();

						rot2.makeRotationX(-0.5 * Math.PI);
						rot.makeRotationZ(i*(2*Math.PI/n));
						tra.makeTranslation(0,650,0);

						combined.multiply(rot);
						combined.multiply(tra);
						combined.multiply(rot2);

						planeArr[i] = new THREE.Mesh(planeGeometry, planeMaterial);
						
						planeArr[i].applyMatrix(combined);
					}
					return planeArr[num];
				};
				group.add(getPlanes(0));
				for(i = 1; i<n; i++){
					group.add(planeArr[i]);
				}

				group.position.y = -600;
				scene.add(group);
			}

			//Add Sphere Geometry (icosahedron with adjustable detail, wireframe on)
			{
				var icosahedronGeometry = new THREE.IcosahedronGeometry(10, 3); //Adjustable Values//
				var ballMaterial = new THREE.MeshLambertMaterial({
					color: new THREE.Color("rgb(255, 0, 0)"),
					//new THREE.Color("rgb(0, 0, 100)"),
					//0xff00ee,
					wireframe: true
				});
				var ball = new THREE.Mesh(icosahedronGeometry, ballMaterial);
				//ball.position.set(0, 0, 0);
				ball.position.y = 100;
				scene.add(ball);
			}

			//Add models
			{
				//var player;
				//var PlayerMesh = function(){
//					var player_loader = new THREE.PLYLoader();
//					var player_mesh = null;
//					var ScaleFactIn = 5.0;
//					player_loader.load('models/small_fighter.ply', function(geometry){
//						geometry.computeVertexNormals();
//						geometry.computeBoundingBox();
//
//						var material = new THREE.MeshLambertMaterial({
//							color: new THREE.Color("rgb(255, 0, 0)"),
//							//new THREE.Color("rgb(0, 0, 100)"),
//							//0xff00ee,
//							//wireframe: true
//						});
//
//						var center = new THREE.Vector3();
//						var size = new THREE.Vector3();
//						geometry.boundingBox.getCenter(center);
//						geometry.boundingBox.getSize(size);
//						var min = geometry.boundingBox.min;
//			 
//						var sca = new THREE.Matrix4();
//						var tra = new THREE.Matrix4();
//			 
//						var ScaleFact=ScaleFactIn/size.length();
//						sca.makeScale(ScaleFact,ScaleFact,ScaleFact);
//						tra.makeTranslation (-center.x,-center.y,-min.z);
//
//						player_mesh = new THREE.Mesh(geometry, material);
//						player_mesh.applyMatrix(tra);
//						player_mesh.applyMatrix(sca);
//						//mesh.name = "player";
//						scene.add(player_mesh);
//					});
				//}
				//PlayerMesh();




				/*
				//MESH LOADING
				var loader = new THREE.PLYLoader();
				var player = null;
				loader.load('models/small_fighter.ply', function ( geometry )
				{
					geometry.computeVertexNormals();
					geometry.computeBoundingBox();
					
					var center = new THREE.Vector3();
					var size = new THREE.Vector3();
					geometry.boundingBox.getCenter(center);
					geometry.boundingBox.getSize(size);
					var min = geometry.boundingBox.min;
		
					var sca = new THREE.Matrix4();
					var tra = new THREE.Matrix4();
		
					var ScaleFact=5/size.length();
					sca.makeScale(ScaleFact,ScaleFact,ScaleFact);
					tra.makeTranslation (-center.x,-center.y,-min.z);
		
					var material = new THREE.MeshPhongMaterial();
					material.color= new THREE.Color(0.9,0.9,0.9);
					material.shininess=100;
					player = new THREE.Mesh( geometry, material );
		
					player.applyMatrix(tra);
					player.applyMatrix(sca);
		
					player.name = "loaded_mesh";
		
					scene.add( player );
					} );
				*/
			}
			

			//Add Cube Geomtery (not included)
			//AddCubes();
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
			
			//Add Lights
			{
				var ambientLight = new THREE.AmbientLight(0xaaaaaa);
				var spotLight = new THREE.SpotLight(0xffffff);
				spotLight.intensity = 0.9; //Adjustable Values
				spotLight.position.set(-10, 40, 20);
				spotLight.lookAt(ball);
				spotLight.castShadow = true;
				scene.add(ambientLight);
				scene.add(spotLight);
			}

		function updatePlayer(mesh){
			var targetY = normalize(mousePos.y,-.75,.75,25, 175);
			var targetX = normalize(mousePos.x,-.75,.75,-100, 100);
			mesh.position.y += (targetY-mesh.position.y)*0.1;
			mesh.rotation.z = (targetY-mesh.position.y)*0.0128;
			mesh.rotation.x = (mesh.position.y-targetY)*0.0064;
		}

		}
		function updateCameraFov(){
			camera.fov = normalize(mousePos.x,-1,1,40, 60);
			camera.updateProjectionMatrix();
		}
			
		function normalize(v,vmin,vmax,tmin, tmax){
			var nv = Math.max(Math.min(v,vmax), vmin);
			var dv = vmax-vmin;
			var pc = (nv-vmin)/dv;
			var dt = tmax-tmin;
			var tv = tmin + (pc*dt);
			return tv;
		}
		
		// HANDLE MOUSE EVENTS

		var mousePos = { x: 0, y: 0 };
		
		function handleMouseMove(event) {
		  var tx = -1 + (event.clientX / WIDTH)*2;
		  var ty = 1 - (event.clientY / HEIGHT)*2;
		  mousePos = {x:tx, y:ty};
		}

		document.getElementById('out').appendChild(renderer.domElement);
		window.addEventListener('resize', onWindowResize, false);

		document.getElementById('out').appendChild(renderer.domElement);

		render();

	function render() {
		updatePlayer(ball);
		updateCameraFov();
		//Seperates Frequency Data into lowest - highest + averages
		{
			analyser.getByteFrequencyData(dataArray);
			var lowerHalfArray = dataArray.slice(0, (dataArray.length/2) - 1);
			var upperHalfArray = dataArray.slice((dataArray.length/2) - 1, dataArray.length - 1);
			var overallAvg = avg(dataArray);
			var lowerMax = max(lowerHalfArray);
			var lowerAvg = avg(lowerHalfArray);
			var upperMax = max(upperHalfArray);
			var upperAvg = avg(upperHalfArray);
			var lowerMaxFr = lowerMax / lowerHalfArray.length;
			var lowerAvgFr = lowerAvg / lowerHalfArray.length;
			var upperMaxFr = upperMax / upperHalfArray.length;
			var upperAvgFr = upperAvg / upperHalfArray.length;
		}
	
		//Adds Mesh Distortion
		{
			distortPlane(getPlanes(0), modulate(upperAvgFr, 0, 1, 0.5, 4));
			distortBall(ball, modulate(Math.pow(lowerMaxFr, 0.8), 0, 1, 0, 8), modulate(upperAvgFr, 0, 1, 0, 4));
		}
	
		//Adds Rotation Values
		{
			var ballRotSpd = (overallAvg/10500) //Adjustable Value//
			//var ballRotSpd = 0.005;
			ball.rotation.x += ballRotSpd;
			ball.rotation.y += ballRotSpd;
			ball.rotation.z += ballRotSpd;
			group.rotation.z += ballRotSpd;
		}
		renderer.render(scene, camera);
		requestAnimationFrame(render);
	}
//	createPlayer();
//	function createPlayer(){
//		player = new PlayerMesh();
//		player.mesh.position.y = 100;
//		scene.add(player);
//	}
		audio.play();
	};



	
	document.body.addEventListener('touchend', function(ev) { context.resume(); });





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

