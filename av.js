var noise = new SimplexNoise();
var vizInit = function (){
  
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

		var context = new AudioContext();
		var src = context.createMediaElementSource(audio);
		var analyser = context.createAnalyser();
		src.connect(analyser);
		analyser.connect(context.destination);
		analyser.fftSize = 512;
		var bufferLength = analyser.frequencyBinCount;
		var dataArray = new Uint8Array(bufferLength);

		var scene, camera, fieldOfView, aspectRatio, nearPlane, farPlane, renderer, container, group, HEIGHT, WIDTH;
		
		createScene();


		//Cylinder = function(){
		//	
		//}
		var cylinderGeometry = new THREE.CylinderGeometry(600,600,800,40,10);
		cylinderGeometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
		cylinderGeometry.mergeVertices();

		var cylinderMaterial = new THREE.MeshLambertMaterial({
			color: 0xff00ee,
			wireframe: true
		});
		var cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
		cylinder.position.set(0,0,0);
		group.add(cylinder);


		//Add Objects
		{
			var planeGeometry = new THREE.PlaneGeometry(800, 800, 20, 20);
			var planeMaterial = new THREE.MeshLambertMaterial({
				color: 0x6904ce,
				side: THREE.DoubleSide,
				wireframe: true
			});

			var plane = new THREE.Mesh(planeGeometry, planeMaterial);
			plane.rotation.x = -0.5 * Math.PI;
			plane.position.set(0, 30, 0);
			group.add(plane);

			var plane2 = new THREE.Mesh(planeGeometry, planeMaterial);
			plane2.rotation.x = -0.5 * Math.PI;
			plane2.position.set(0, -30, 0);
			group.add(plane2);
		
			var icosahedronGeometry = new THREE.IcosahedronGeometry(10, 4);
			var lambertMaterial = new THREE.MeshLambertMaterial({
				color: 0xff00ee,
				wireframe: true
			});

			var ball = new THREE.Mesh(icosahedronGeometry, lambertMaterial);
			ball.position.set(0, 0, 0);
			group.add(ball);





			scene.add(group);
		}

		




		var ambientLight, hemishphereLight, shadowLight, spotLight;
		createLights();
		
		loop();


		function loop() {
			//Parse Audio Input into usable Data
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


			makeRoughGround(plane, modulate(upperAvgFr, 0, 1, 0.5, 4));
			makeRoughGround(plane2, modulate(lowerMaxFr, 0, 1, 0.5, 4));
			makeRoughCylinder(cylinder, modulate(lowerMaxFr, 0, 1, 0.5, 4));
			
			makeRoughBall(ball, modulate(Math.pow(lowerMaxFr, 0.8), 0, 1, 0, 8), modulate(upperAvgFr, 0, 1, 0, 4));

			//cylinder.rotation.y += 0.005;
			group.rotation.y += 0.005;
			
			renderer.render(scene, camera);
			requestAnimationFrame(loop);
		}

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

			scene.fog = new THREE.Fog("rgb(100, 0, 0)", 100,950);
			camera.position.x = 0;
			camera.position.z = 200;
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

		function createLights(){
			hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9);

			ambientLight = new THREE.AmbientLight(0xdc8874, .5);
		  
			shadowLight = new THREE.DirectionalLight(0xffffff, .9);
			shadowLight.position.set(150, 350, 350);
			shadowLight.castShadow = true;
			shadowLight.shadow.camera.left = -400;
			shadowLight.shadow.camera.right = 400;
			shadowLight.shadow.camera.top = 400;
			shadowLight.shadow.camera.bottom = -400;
			shadowLight.shadow.camera.near = 1;
			shadowLight.shadow.camera.far = 1000;
			shadowLight.shadow.mapSize.width = 2048;
			shadowLight.shadow.mapSize.height = 2048;
		  
			scene.add(hemisphereLight);
			scene.add(shadowLight);
			scene.add(ambientLight);
	
			spotLight = new THREE.SpotLight(0xffffff);
			spotLight.intensity = 0.9;
			spotLight.position.set(-10, 40, 20);
			spotLight.lookAt(ball);
			spotLight.castShadow = true;
			scene.add(spotLight);
		}

		function makeRoughBall(mesh, bassFr, treFr) {
			mesh.geometry.vertices.forEach(function (vertex, i) {
				var offset = mesh.geometry.parameters.radius;
				var amp = 7;
				var time = window.performance.now();
				vertex.normalize();
				var rf = 0.00001;
				var distance = (offset + bassFr ) + noise.noise3D(vertex.x + time *rf*7, vertex.y +  time*rf*8, vertex.z + time*rf*9) * amp * treFr;
				vertex.multiplyScalar(distance);
			});
			mesh.geometry.verticesNeedUpdate = true;
			mesh.geometry.normalsNeedUpdate = true;
			mesh.geometry.computeVertexNormals();
			mesh.geometry.computeFaceNormals();
		}

		function makeRoughGround(mesh, distortionFr) {
			mesh.geometry.vertices.forEach(function (vertex, i) {
				var amp = 2;
				var time = Date.now();
				var distance = (noise.noise2D(vertex.x + time * 0.0003, vertex.y + time * 0.0001) + 0) * distortionFr * amp;
				vertex.z = distance;
			});
			mesh.geometry.verticesNeedUpdate = true;
			mesh.geometry.normalsNeedUpdate = true;
			mesh.geometry.computeVertexNormals();
			mesh.geometry.computeFaceNormals();
		}

		function makeRoughCylinder(mesh, distortionFr) {
			mesh.geometry.vertices.forEach(function (vertex, i) {
				var amp = 2;
				var time = Date.now();
				var distance = (noise.noise2D(vertex.x + time * 0.0003, vertex.y + time * 0.0001) + 0) * distortionFr * amp;
				vertex.z = distance;
			});
			mesh.geometry.verticesNeedUpdate = true;
			mesh.geometry.normalsNeedUpdate = true;
			mesh.geometry.computeVertexNormals();
			mesh.geometry.computeFaceNormals();
		}

		audio.play();
	};
}

window.onload = vizInit();

document.body.addEventListener('touchend', function(ev) { context.resume(); });


function fractionate(val, minVal, maxVal) {
    return (val - minVal)/(maxVal - minVal);
}

function modulate(val, minVal, maxVal, outMin, outMax) {
    var fr = fractionate(val, minVal, maxVal);
    var delta = outMax - outMin;
    return outMin + (fr * delta);
}

function avg(arr){
    var total = arr.reduce(function(sum, b) { return sum + b; });
    return (total / arr.length);
}

function max(arr){
    return arr.reduce(function(a, b){ return Math.max(a, b); })
}