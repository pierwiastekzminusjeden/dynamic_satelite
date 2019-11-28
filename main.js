const Colors = {
	red:0xf25346,
	white:0xd8d0d1,
	pink:0xF5986E,
	silver:0xc0c0c0
};


const HEIGHT = window.innerHeight;
const WIDTH = window.innerWidth;
var scene, camera,renderer;

const init = (width, height) => {

	const initRenderer = () => {
		renderer = new THREE.WebGLRenderer({alpha: true, antialias: true}); //alpha - gradient background
		renderer.setSize(width, height);
		renderer.shadowMap.enabled = true;
		container = document.getElementById('world').appendChild(renderer.domElement);
	};
	
	const initCamera = () => {
		const aspectRatio = width / height;
		const fieldOfView = 100;
		const nearPlane = 1; 
		const farPlane = 10000000;
		camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);
		camera.position.x = 200;
		camera.position.z = 600;
		camera.position.y = 150;
		camera.rotation.y = .5;
		camera.rotation.x = .01;

		
		const handleWindowResize = () => {
			// update height and width of the renderer and the camera
			renderer.setSize(width, height);
			camera.aspect = width / height;
			camera.updateProjectionMatrix();
		};
	
		window.addEventListener('resize', handleWindowResize, false);
	
	};
	
	const initScene = () => {
		scene = new THREE.Scene();
		scene.fog = new THREE.Fog(0xd3d3d3, 100, 4000);		
	};


	return () => {
		initRenderer();
		initCamera();
		initScene();
	};
};


var pivotPoint = new THREE.Object3D();
var planet;
var ring;
var satelite;

const createWorld = () => {

	SkySphere = function(radius, segments) {
		this.mesh = new THREE.Object3D();

		const geo = new THREE.SphereGeometry(radius, segments, segments);
		const loader  = new THREE.TextureLoader();
		const texture = loader.load( "https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/galaxy_starfield.png" );
		const material = new THREE.MeshPhongMaterial({ 
			map: texture
		});

		this.mesh = new THREE.Mesh(geo, material);
		this.mesh.material.side = THREE.BackSide;
	}

	Planet = function() {
		var geom = new THREE.SphereGeometry(200,1000,40);
		
		// rotate the geometry on the x axis
		geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
		const loader  = new THREE.TextureLoader();
		const texture = loader.load( "http://1.bp.blogspot.com/_9DvzmslTIME/TMoOp-gpD6I/AAAAAAAAAdY/xW2XCiOgS9Q/s1600/Planet_2_d.png" );
		var mat = new THREE.MeshPhongMaterial({
			map: texture,
			shading:THREE.FlatShading,
		});
		

		this.mesh = new THREE.Mesh(geom, mat);
		const cloudsMesh =
		this.mesh.add(pivotPoint);
		this.mesh.receiveShadow = true; 
	}
	
	Rock = function() {
		this.mesh = new THREE.Object3D();
		
		const geo = new THREE.BoxGeometry(20,20,20);
		const loader  = new THREE.TextureLoader();
		const texture = loader.load( "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/e664f5d7-3cd8-41a8-a1bb-1767cf4c1a59/d3y3lvg-ea98103a-db5e-454b-9b3e-c71f238ce97a.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwic3ViIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsImF1ZCI6WyJ1cm46c2VydmljZTpmaWxlLmRvd25sb2FkIl0sIm9iaiI6W1t7InBhdGgiOiIvZi9lNjY0ZjVkNy0zY2Q4LTQxYTgtYTFiYi0xNzY3Y2Y0YzFhNTkvZDN5M2x2Zy1lYTk4MTAzYS1kYjVlLTQ1NGItOWIzZS1jNzFmMjM4Y2U5N2EuanBnIn1dXX0.6C0aT0vFIn8GGtxaG9bFRbXAD9KIItjvmoYiD2qZeiM" );
		
		const mat = new THREE.MeshPhongMaterial({
			map:texture,  
		});
		
		const n = 3+Math.floor(Math.random()*3);

		for (let i=0; i<n; i++ ){
			
			const tmpMesh = new THREE.Mesh(geo, mat); 
			
			tmpMesh.position.x = i*15;
			tmpMesh.position.y = Math.random()*10;
			tmpMesh.position.z = Math.random()*10;
			tmpMesh.rotation.z = Math.random()*Math.PI*2;
			tmpMesh.rotation.y = Math.random()*Math.PI*2;
			tmpMesh.rotation.x = Math.random()*Math.PI*2;

			let s = .1 + Math.random()*.7;
			tmpMesh.scale.set(s,s,s);
			
			tmpMesh.castShadow = true;
			tmpMesh.receiveShadow = true;
			
			this.mesh.add(tmpMesh);
		} 
	}
		
	Ring = function() {
		this.mesh = new THREE.Object3D();
		
		const n = 20;
		
		const stepAngle = Math.PI*2 / n; //rozkład skał równomiernie na okręgu
		
		for(let i=0; i<n; i++){
			const rock = new Rock();
		
			const phi = stepAngle*i; // kąt skały
			const r = 300; //+ Math.random()*50; //odległość od osi

			rock.mesh.position.y = Math.sin(phi)*r;
			rock.mesh.position.x = Math.cos(phi)*r;
			rock.mesh.position.z = Math.cos(phi)*Math.cos(phi)*r;
			//co?
			rock.mesh.position.z = -200-Math.random()*200;
			rock.mesh.rotation.z = phi + Math.PI/2; //random rotacja skały
			
			const scale = 1+Math.random()*1.5;
			rock.mesh.scale.set(scale,scale,scale);

			this.mesh.add(rock.mesh);  
		}  
	}

	Satelite = function() {
	
		this.mesh = new THREE.Object3D();
		
		const geoMiddle = new THREE.BoxGeometry(60,50,50,1,1,1);
		const matMiddle = new THREE.MeshPhongMaterial({color:Colors.pink, shading:THREE.FlatShading});
		const middle = new THREE.Mesh(geoMiddle, matMiddle);
		middle.castShadow = true;
		middle.receiveShadow = true;
		this.mesh.add(middle);
		
		const geoWings = new THREE.BoxGeometry(40,8,150,1,1,1);
		const matWings = new THREE.MeshPhongMaterial(
			{
				color:Colors.silver, 
				shading:THREE.FlatShading,
				shininess: 25
			});
		const wings = new THREE.Mesh(geoWings, matWings);
		wings.castShadow = true;
		wings.receiveShadow = true;
		wings.rotation.z = 20;
		this.mesh.add(wings);
		
		const geoRadar = new THREE.BoxGeometry(20,20,10,1,1,1);
		const matRadar = new THREE.MeshPhongMaterial({
			color:Colors.silver, 
			shading:THREE.FlatShading
		});
		this.radar = new THREE.Mesh(geoRadar, matRadar);
		this.radar.castShadow = true;
		this.radar.receiveShadow = true;
		
		const geomBlade = new THREE.BoxGeometry(1,40,40,1,1,1);
		const matBlade = new THREE.MeshPhongMaterial({
			color:Colors.silver, 
			shading:THREE.FlatShading, 
			shininess: 25
		});
		const blade = new THREE.Mesh(geomBlade, matBlade);
		blade.position.set(8,0,0);
		blade.castShadow = true;
		blade.receiveShadow = true;
		blade.rotation.z =10;
		this.radar.add(blade);
		this.radar.position.set(50,0,0);
		this.mesh.add(this.radar);
		
	};
	
	const createLights = () => {
		const shadowLight = new THREE.DirectionalLight(0xffffff, .9);
		shadowLight.position.set(150, 350, 350);
		shadowLight.castShadow = true;

		shadowLight.shadow.camera.left = -400;
		shadowLight.shadow.camera.right = 400;
		shadowLight.shadow.camera.top = 400;
		shadowLight.shadow.camera.bottom = -400;
		shadowLight.shadow.camera.near = 1;
		shadowLight.shadow.camera.far = 1000;

		shadowLight.shadow.mapSize.width = 1024;
		shadowLight.shadow.mapSize.height = 1024;
		
		scene.add(shadowLight);
	}

	planet = new Planet()
	planet.mesh.position.y = -100;
	scene.add(planet.mesh);
	ring = new Ring();
	// ring.mesh.position.x = -100;
	ring.mesh.position.y = -100;
	ring.mesh.position.z = 300;
	scene.add(ring.mesh);

	satelite = new Satelite();
	satelite.mesh.scale.set(.5,.5,.5);
	satelite.mesh.rotation.z = 30;
	satelite.mesh.position.y = 400;
	pivotPoint.add(satelite.mesh);
	scene.add((new SkySphere(1000,60)).mesh);
	createLights();
}

const updateWorld = () => {
	planet.mesh.rotation.z += .0002;
	planet.mesh.rotation.x += .0005;
	ring.mesh.rotation.z -= .005;
};


const loop = () =>{
	updateWorld();
	updateSatelite();
	renderer.render(scene, camera);
	requestAnimationFrame(loop);
}

const mousePos = {
	x:0,
	y:0,
};

function updateSatelite(){
	
	if (mousePos.x < 0){
		pivotPoint.rotation.z += 0.01
	} 
	if (mousePos.x > 0){
		pivotPoint.rotation.z  -= 0.01	
	}
	if (mousePos.y > 0){
		pivotPoint.rotation.x += 0.01
	} 
	if (mousePos.y < 0){
		pivotPoint.rotation.x  -= 0.01	
	}

	satelite.mesh.rotation.y += .01;
	satelite.radar.rotation.x += 0.3;
}

function handleMouseMove(event) {
	const tx = -1 + (event.clientX / WIDTH)*2;
	const ty = 1 - (event.clientY / HEIGHT)*10;

	mousePos.x = tx
	mousePos.y = ty;
}

const handleKeyboardInput = (event) => {
	if( typeof handleKeyboardInput.rotSpeed == 'undefined' ) {
        handleKeyboardInput.rotSpeed = .035;
    }
	let x = camera.position.x,
	  y = camera.position.y,
	  z = camera.position.z;

	if (event.which === 68){
		camera.position.x = x * Math.cos(handleKeyboardInput.rotSpeed) + z * Math.sin(handleKeyboardInput.rotSpeed);
		 camera.position.z = z * Math.cos(handleKeyboardInput.rotSpeed) - x * Math.sin(handleKeyboardInput.rotSpeed);
	}  
	if (event.which === 65){
		camera.position.x = x * Math.cos(handleKeyboardInput.rotSpeed) - z * Math.sin(handleKeyboardInput.rotSpeed);
		camera.position.z = z * Math.cos(handleKeyboardInput.rotSpeed) + x * Math.sin(handleKeyboardInput.rotSpeed);
	}

	if (event.which === 87){
		camera.position.y = y * Math.cos(handleKeyboardInput.rotSpeed) + z * Math.sin(handleKeyboardInput.rotSpeed);
		camera.position.z = z * Math.cos(handleKeyboardInput.rotSpeed) - y * Math.sin(handleKeyboardInput.rotSpeed);
	}
	if (event.which === 83){
		camera.position.y = y * Math.cos(handleKeyboardInput.rotSpeed) - z * Math.sin(handleKeyboardInput.rotSpeed);
		camera.position.z = z * Math.cos(handleKeyboardInput.rotSpeed) + y * Math.sin(handleKeyboardInput.rotSpeed);
	}
	camera.lookAt(scene.position);
  
  }

const onMouseWheel = (event) => {
	if(Math.abs(camera.position.z + event.deltaY * 0.05) < 700 )
		camera.position.z += event.deltaY * 0.05;
	camera.position.z -= event.deltaX * 0.05;
	camera.lookAt(scene.position);
}

const run = (event) => {
	init(WIDTH, HEIGHT)();
	createWorld();

	document.addEventListener('mousemove', handleMouseMove, false);
	document.addEventListener('keydown', handleKeyboardInput, false);
	document.addEventListener('wheel', onMouseWheel, false );

	loop();
}

window.addEventListener('load', run, false);