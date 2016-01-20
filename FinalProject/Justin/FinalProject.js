function main(){
	var camera, scene, renderer;
	var walls;
	var container;

	var lastX = 0;
	var lastY = 0;

	var cameraSpeed = 0.1;

	var input = new InputHandler();

	init();
	update();

	function init() {

    var material;
    var geometry;
    var texture1;

		lastX = window.innerWidth/2;
		lastY = window.innerHeight/2;

		container = document.createElement( 'div' );
		document.body.appendChild( container );

		var ratio = window.innerWidth / window.innerHeight;
		camera = new THREE.PerspectiveCamera( 70, ratio, 0.1, 1000 );
		camera.position.z = 3;

		scene = new THREE.Scene();


		var lights = [];
    lights[0] = new THREE.PointLight(0xffffff, 1, 0);
    lights[1] = new THREE.PointLight(0xffffff, 1, 0);
    lights[2] = new THREE.PointLight(0xffffff, 1, 0);

    lights[0].position.set(0, 200, 0);
    lights[1].position.set(100, 200, 100);
    lights[2].position.set(-100, -200, -100);

    scene.add(lights[0]);
    scene.add(lights[1]);
    scene.add(lights[2]);



		// load a resource
		var loader = new THREE.TextureLoader();
		var texture = loader.load('textures/awesomeface.png', function ( texture ) { texture1 = texture;});
		//texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
		//texture.anisotropy = 16;

		material = new THREE.MeshPhongMaterial( { map: texture, transparent: true} );
		//material1 = new THREE.MeshPhongMaterial( { map: texture, transparent: true} );


    geometry = new THREE.CubeGeometry( 1, 1, 1 );


		walls = [];
		walls[0] = new THREE.Mesh( geometry, material );
		walls[0].rotation.x = 0;
		walls[0].rotation.y = 0;
		walls[0].rotation.z = 0;
		//walls[1] = new THREE.Mesh( geometry, material1 );



		//mesh2 = new THREE.Mesh( geometry, material );
    scene.add( walls[0] );
		//scene.add( walls[1] );




		renderer = new THREE.WebGLRenderer({});
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( window.innerWidth, window.innerHeight );
		container.appendChild( renderer.domElement );

    stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.top = '0px';
		container.appendChild( stats.domElement );

		window.addEventListener( 'resize', onWindowResize, false );

	}

	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
	}

	function update() {
		requestAnimationFrame( update );

		console.log(input.isKeyPressed('a'));

		if (input.isKeyPressed('a') || input.isKeyPressed('A')) {
			console.log('dfadsfa');
	    camera.translateX(-cameraSpeed);
	  }
/*
		if (keyState['d'] || keyState['D']) {
	    camera.translateX(cameraSpeed);
	  }
	  if (keyState['w'] || keyState['W']) {
	    camera.translateZ(-cameraSpeed);
	  }
	  if (keyState['s'] || keyState['S']) {
	    camera.translateZ(cameraSpeed);
	  }

	  if (mouseX != lastX){
	    //camera.rotateOnAxis(x, (lastX - mouseX)/200);
	    lastX = mouseX;
	  }
	  if (mouseY != lastY){
	    //camera.rotateOnAxis(y, (lastY - mouseY)/200);
	    lastY = mouseY;
	  }
*/
		// rename to final project......make asteroids game

		stats.update();
		renderer.render( scene, camera );
	}

}
