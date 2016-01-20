function main(){

  var camera, scene, renderer;
  var walls;
  var container;

  var asteroids = [];
  var asteroidSpeedX = [];
  var asteroidSpeedY = [];
  var asteroidRot = [];
  var asteroidScale = [];

  init();
  update();

  function init(){

    container = document.createElement( 'div' );
    document.body.appendChild( container );

    renderer = new THREE.WebGLRenderer();
		renderer.setPixelRatio( 600/450 );
		renderer.setSize( 600, 450 );
		container.appendChild( renderer.domElement );

    //camera = new THREE.PerspectiveCamera( 60, ratio, 0.1, 1000 );
    camera = new THREE.OrthographicCamera(-300, 300, 225, -225, 0.1, 1000);
    //camera = new THREE.OrthographicCamera(-85, 85, 65, -65, 0.1, 1000);
    camera.position.z = 100;

    scene = new THREE.Scene();

    var asteroidGeo = new THREE.Geometry();
    asteroidGeo.vertices.push(
      new THREE.Vector3(0, -4, 0),
      new THREE.Vector3(-2, -2, 0),
      new THREE.Vector3(-6, -2, 0),
      new THREE.Vector3(-6, 2, 0),
      new THREE.Vector3(-2, 4, 0),
      new THREE.Vector3(-2, 6, 0),
      new THREE.Vector3(4, 6, 0),
      new THREE.Vector3(4, 2, 0),
      new THREE.Vector3(6, 0, 0),
      new THREE.Vector3(4, -4, 0),
      new THREE.Vector3(0, -4, 0)
    );

    var asteroidMat = new THREE.LineBasicMaterial({color: 0xFFFFFF});

    for (i = 0; i < 20; i++){

      asteroids[i] = new THREE.Line(asteroidGeo, asteroidMat);

      asteroids[i].position.x = Math.random() * (300 - -300) + -300;
      asteroids[i].position.y = Math.random() * (225 - -225) + -225;

      asteroids[i].rotation.z = Math.random() * 2 * 3.14;

      asteroidScale[i] = Math.random() * (5 - 1) + 1;
      asteroids[i].scale.x = asteroidScale[i];
      asteroids[i].scale.y = asteroidScale[i];

      asteroidRot[i] = Math.random() * (0.01 - -0.01) + -0.01;

      asteroidSpeedX[i] = Math.random() * (0.5 - -0.5) + -0.5;
      asteroidSpeedY[i] = Math.random() * (0.5 - -0.5) + -0.5;

      scene.add(asteroids[i]);

    }

console.log(scene);


    scene.add(asteroids[0]);
  }

  function update(){
    requestAnimationFrame(update);

    for (var i = 0; i < 20; i++){

      asteroids[i].position.x += asteroidSpeedX[i];
      asteroids[i].position.y += asteroidSpeedY[i];
      if (asteroids[i].position.x > 330 || asteroids[i].position.x < -330) {
        asteroids[i].position.x = -asteroids[i].position.x;
      }
      if (asteroids[i].position.y > 255 || asteroids[i].position.y < -255) {
        asteroids[i].position.y = -asteroids[i].position.y;
      }
      asteroids[i].rotateZ(asteroidRot[i]);
    }


    renderer.render(scene, camera);
  }

}
