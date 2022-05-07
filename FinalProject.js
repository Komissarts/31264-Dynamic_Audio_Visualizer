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
			var group = new THREE.Group();
		}


		//Create & Add All Scene Items
		{
			//Add Camera, Scene & Renderer
			{
				var HEIGHT, WIDTH;
				HEIGHT = window.innerHeight;
				WIDTH = window.innerWidth;

				var scene = new THREE.Scene();
				aspectRatio = WIDTH / HEIGHT;
				var fieldOfView = 60;
				var nearPlane = 1;
				var farPlane = 10000;

				var   camera = new THREE.PerspectiveCamera(
					fieldOfView,
					aspectRatio,
					nearPlane,
					farPlane
				);
				scene.fog = new THREE.Fog("rgb(255, 0, 0)", 100,950);
				camera.position.set(0,200,100);
				camera.lookAt(scene.position);
				scene.add(camera);

				var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
				renderer.setSize(WIDTH, HEIGHT);

				window.addEventListener('resize', onWindowResize, false);

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
				var planeGeometry = new THREE.PlaneGeometry(145, 600, 6, 50);
				var planeMaterial = new THREE.MeshLambertMaterial({
					color: 0x68228b, //Adjustable Values
					//new THREE.Color("rgb(100, 0, 0)"),
					//0x68228b
					side: THREE.DoubleSide,
					wireframe: true
				});
				//Established Plane Array, fundamentally similar to Workshop Lectures
				var planeArr = [5];
				var n=5
				function getPlanes(num){
					for(i = 0; i<n; i++){
						var rot = new THREE.Matrix4();
						var rot2 = new THREE.Matrix4();
						var tra = new THREE.Matrix4();
						var combined = new THREE.Matrix4();

						rot2.makeRotationX(-0.5 * Math.PI);
						rot.makeRotationZ(i*(2*Math.PI/n));
						tra.makeTranslation(0,100,0);

						combined.multiply(rot);
						combined.multiply(tra);
						combined.multiply(rot2);

						planeArr[i] = new THREE.Mesh(planeGeometry, planeMaterial);
						
						planeArr[i].applyMatrix(combined);
					}
					return planeArr[num];
				};
				group.add(getPlanes(0));
				group.add(planeArr[1]);
				group.add(planeArr[2]);
				group.add(planeArr[3]);
				group.add(planeArr[4]);
				scene.add(group);
			}

			//Add Cylinder Geometry
			{
				//AddCylinder();
				function AddCylinder(){
				var cylinderGeom = new THREE.CylinderGeometry(600,600,800,40,10);
					cylinderGeom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
					geom.mergeVertices();
				var cylinderMat = new THREE.MeshPhongMaterial({
					color:Colors.blue,
					transparent:true,
					opacity:.8,
					shading:THREE.FlatShading,
					});
				
				var cylinder = new THREE.Mesh(cylinderGeom, cylinderMat);
					cylinder.receiveShadow = true;

				cylinder.position.y = -600;
				scene.add(cylinder);
				}
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
				ball.position.set(0, 0, 0);
				scene.add(ball);
			}

			//Add models
			{
				
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
		}
		
		document.getElementById('out').appendChild(renderer.domElement);
		window.addEventListener('resize', onWindowResize, false);

		document.getElementById('out').appendChild(renderer.domElement);

		

		render();

	function render() {

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
			var ballRotSpd = (overallAvg/10500)+0.005 //Adjustable Value//
			//var ballRotSpd = 0.005;
			ball.rotation.x += ballRotSpd;
			ball.rotation.y += ballRotSpd;
			ball.rotation.z += ballRotSpd;
			group.rotation.z += ballRotSpd;
		}
		renderer.render(scene, camera);
		requestAnimationFrame(render);
	}
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
				var amp = 10;
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

