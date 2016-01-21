var camera, scene, renderer;
var walls;
var container;

var keyState = [];

var numOfAsteroids = 15;
var asteroids = [];
var asteroidSpeedX = [];
var asteroidSpeedY = [];
var asteroidRot = [];
var asteroidScale = [];

var ship;
var projectile = [];
var projectileCount = 0;
var shooting = false;

var asteroidMat = [];

function main() {
    init();
    update();
}

function init() {

    container = document.getElementById('myCanvas');
    document.body.appendChild(container);

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(600 / 450);
    renderer.setSize(600, 450);
    container.appendChild(renderer.domElement);

    //camera = new THREE.PerspectiveCamera( 60, ratio, 0.1, 1000 );
    camera = new THREE.OrthographicCamera(-300, 300, 225, -225, 0.1, 1000);
    //camera = new THREE.OrthographicCamera(-85, 85, 65, -65, 0.1, 1000);
    camera.position.z = 100;

    scene = new THREE.Scene();

    for (i = 0; i < 1024; i++){
        keyState[i] = false;
    }

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

    var shipGeo = new THREE.Geometry();
    shipGeo.vertices.push(
        new THREE.Vector3(0, 2, 0),
        new THREE.Vector3(-1, -1, 0),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(1, -1, 0),
        new THREE.Vector3(0, 2, 0)
    );
    var shipMat = new THREE.LineBasicMaterial({color : 0xFFFFFF});
    ship = new THREE.Line(shipGeo, shipMat);
    ship.scale.x = 5;
    ship.scale.y = 5;
    scene.add(ship);

    for (i = 0; i < numOfAsteroids; i++) {

        asteroidMat[i] = new THREE.LineBasicMaterial({
            color: 0xFFFFFF
        });

        asteroids[i] = new THREE.Line(asteroidGeo, asteroidMat[i]);

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

        window.addEventListener('keydown', onKeyDown, false);
        window.addEventListener('keyup', onKeyUp, false);

    }
}

function update() {
    requestAnimationFrame(update);

    move();

    for (i = 0; i < numOfAsteroids; i++) {
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

    if (ship.position.x > 310 || ship.position.x < -310){
        ship.position.x *= -1;
    }
    if (ship.position.y > 235 || ship.position.y < -235){
        ship.position.y *= -1;
    }

    //checkCollision();

    renderer.render(scene, camera);
}

function onKeyDown(event){
    keyState[event.keyCode || event.charCode] = true;
}

function onKeyUp(event){
    keyState[event.keyCode || event.charCode] = false;
}

function move(){
    if (keyState['a'.charCodeAt(0) - 32]){
        ship.rotateZ(0.1);
    }
    if (keyState['d'.charCodeAt(0) - 32]){
        ship.rotateZ(-0.1);
    }
    if (keyState['w'.charCodeAt(0) - 32]){
        ship.translateY(2);
    }
    if (keyState['s'.charCodeAt(0) - 32]){
        ship.translateY(-2);
    }
    if (keyState[32]){
        shoot();
    }

    for (i = 1; i <= projectileCount; i++){
        projectile[i].translateY(5);
    }

}

function shoot(){
    //console.log(projectileCount);
    if (projectileCount > 0){
        var projX = projectile[projectileCount].position.x - ship.position.x;
        var projY = projectile[projectileCount].position.y - ship.position.y;
        var projDist = Math.sqrt(projX * projX + projY * projY);
        if (projDist > 100) shooting = false;
    }

    if (!shooting){
        projectileCount++;
        shooting = true;
        var projectileMat = new THREE.PointsMaterial({color : 0xFF0000, size : 3});
        var projectileGeo = new THREE.Geometry();
        projectileGeo.vertices.push(new THREE.Vector3(0,0,0));
        projectile[projectileCount] = new THREE.Points(projectileGeo, projectileMat);
        projectile[projectileCount].translateX(ship.position.x);
        projectile[projectileCount].translateY(ship.position.y);
        projectile[projectileCount].rotation.z = ship.rotation.z;
        scene.add(projectile[projectileCount]);
    }
}

function checkCollision() {
    for (i = 0; i < numOfAsteroids; i++) {
        for (j = 0; j < numOfAsteroids; j++) {
            if (j != i) {
                var dx = asteroids[i].position.x - asteroids[j].position.x;
                var dy = asteroids[i].position.y - asteroids[j].position.y;
                var distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 40) {


                    //asteroids[i].material.setValues({
                    //    color: 0xFF0000
                    //});
                    //asteroids[j].material.setValues({
                    //    color: 0xFF0000
                    //});
                    //console.log('collide');
                    //if (asteroidScale[i] > asteroidScale[j]) {
                        asteroidSpeedX[j] *= -1;
                        asteroidSpeedY[j] *= -1;
                    //} else {
                    //    asteroidSpeedX[i] *= -1;
                    //    asteroidSpeedY[i] *= -1;
                    //}

                } else {

                    asteroids[i].material.setValues({
                        color: 0xFFFFFF
                    });
                    asteroids[j].material.setValues({
                        color: 0xFFFFFF
                    });
                }
            }
        }
    }

}
