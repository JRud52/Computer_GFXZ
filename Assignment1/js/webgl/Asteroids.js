/*
    Graphics Assignment 1
    Group Members: Justin, Tyler, Will, Michael, Guy
*/

var camera, scene, renderer;
var walls;
var container;

var keyState = [];

var numOfAsteroids = 5;
var activeAsteroids = 0;
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


var points = 0;

var music = new Audio('music/vapor.ogg');
var laser = new Audio('music/laser.ogg');
var explode = new Audio('music/explosion.ogg');


/*
    ONLOAD FUNCTION
*/
function main() {
    init();
    update();
}

function init() {

        //music.play();
        container = document.getElementById('myCanvas');
        document.body.appendChild(container);

    //webGL renderer size 600x450
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(600 / 450);
    renderer.setSize(600, 450);
    container.appendChild(renderer.domElement);


    //orthographic camera used to have a direct connection with the canvas dimensions and the world coordinates (used for bounds checking during movment)
    camera = new THREE.OrthographicCamera(-300, 300, 225, -225, 0.1, 1000);
    camera.position.z = 100;

    scene = new THREE.Scene();

    //initialize keyState array to false meaning no key is down
    for (i = 0; i < 1024; i++) {
        keyState[i] = false;
    }

    //player ship
    var shipGeo = new THREE.Geometry();
    shipGeo.vertices.push(
        new THREE.Vector3(0, 2, 0),
        new THREE.Vector3(-1, -1, 0),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(1, -1, 0),
        new THREE.Vector3(0, 2, 0)
    );
    var shipMat = new THREE.LineBasicMaterial({ color: 0xFFFFFF });
    ship = new THREE.Line(shipGeo, shipMat);

    //scale is altered because we originally create the objects smaller than the size we intend them to be
    ship.scale.x = 5;
    ship.scale.y = 5;
    scene.add(ship);


    //spawn the asteroids
    spawnAsteroids();

    //event listeners for movement and firing
    window.addEventListener('keydown', onKeyDown, false);
    window.addEventListener('keyup', onKeyUp, false);
}



function spawnAsteroids() {
    //base asteroid
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


    //randomly spawn asteroids -- each will be scaled differently and will then float around
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

        //the movement speed of the asteroids
        asteroidSpeedX[i] = Math.random() * (0.5 - -0.5) + -0.5;
        asteroidSpeedY[i] = Math.random() * (0.5 - -0.5) + -0.5;

        scene.add(asteroids[i]);

        activeAsteroids++;
    }
}


//updates ever frame used for animation and input handling
function update() {
    requestAnimationFrame(update);

    //get input
    handleInput();

    //move the asteroids around the scene and ensure they dont go out of view
    for (i = 0; i < activeAsteroids; i++) {
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

    //keep the ship in view by negating its position if it crosses a bound
    if (ship.position.x > 310 || ship.position.x < -310) {
        ship.position.x *= -1;
    }
    if (ship.position.y > 235 || ship.position.y < -235) {
        ship.position.y *= -1;
    }

    //if the player killed all of the asteroids spawn more
    if (activeAsteroids <= 0) {
        spawnAsteroids();
    }

    //check for collision between 2 asteroids
    //checkCollision();


    //render the scene
    renderer.render(scene, camera);
}


//handles keydown events
function onKeyDown(event) {
    keyState[event.keyCode || event.charCode] = true;
}


//handles keyup events
function onKeyUp(event) {
    keyState[event.keyCode || event.charCode] = false;
}


//checks if the user hit specific keys for movement and firing controls
function handleInput() {

    //movement and rotation WASD
    if (keyState['a'.charCodeAt(0) - 32]) {
        ship.rotateZ(0.1);
    }
    if (keyState['d'.charCodeAt(0) - 32]) {
        ship.rotateZ(-0.1);
    }
    if (keyState['w'.charCodeAt(0) - 32]) {
        ship.translateY(2);
    }
    if (keyState['s'.charCodeAt(0) - 32]) {
        ship.translateY(-2);
    }

    //spacebar to shoot
    if (keyState[32]) {
            laser.play();
        shoot();
    }

    //check move projectiles forward and check for collision with asteroids
    for (i = 0; i < projectileCount; i++) {
        projectile[i].translateY(5);
        projectileCollision(i);
    }

}


/*
    Checks each active projectile for collision with asetroids
*/
function projectileCollision(index) {
    for (var i = 0; i < activeAsteroids; i++) {
        var dx = projectile[index].position.x - asteroids[i].position.x;
        var dy = projectile[index].position.y - asteroids[i].position.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 10) {
            console.log(asteroids);

            //remove the projectile from the scene
            scene.remove(projectile[index]);

            //shift to remove the projectile from the list
            for (j = index; j < projectile.length - 1; j++) {
                projectile[j] = projectile[j + 1];
            }


            //remove from the scene the asteroid that was hit
            explode.play();
            scene.remove(asteroids[i]);

            //shift left to remove asteroid
            for (j = i; j < activeAsteroids - 1; j++) {
                asteroids[j] = asteroids[j + 1];
                asteroidSpeedX[j] = asteroidSpeedX[j + 1];
                asteroidSpeedY[j] = asteroidSpeedX[j + 1];
            }

            asteroidSpeedX.pop();
            asteroidSpeedY.pop();
            asteroids.pop();
            activeAsteroids--;

            points += 10;
            /*
            projectile.pop();
            projectileCount--;
            */
            break;
        }
    }
}

//handles firing of projectiles
//a new projectile cannot be fired until the first has travelled a distance of 100
function shoot() {

    //track distance of the first projectile to prevent a new one from spawning
    if (projectileCount > 0) {
        var projX = projectile[projectileCount-1].position.x - ship.position.x;
        var projY = projectile[projectileCount-1].position.y - ship.position.y;
        var projDist = Math.sqrt(projX * projX + projY * projY);
        if (projDist > 100) shooting = false;
    }

    //allow a new projectile
    if (!shooting) {
        shooting = true;

        var projectileMat = new THREE.PointsMaterial({ color: 0xFF0000, size: 3 });
        var projectileGeo = new THREE.Geometry();
        projectileGeo.vertices.push(new THREE.Vector3(0, 0, 0));
        projectile[projectileCount] = new THREE.Points(projectileGeo, projectileMat);
        projectile[projectileCount].translateX(ship.position.x);
        projectile[projectileCount].translateY(ship.position.y);
        projectile[projectileCount].rotation.z = ship.rotation.z;

        scene.add(projectile[projectileCount]);

        projectileCount++;
    }
}

function checkCollision() {
    for (i = 0; i < activeAsteroids; i++) {
        for (j = 0; j < activeAsteroids; j++) {
            if (j != i) {
                var dx = asteroids[i].position.x - asteroids[j].position.x;
                var dy = asteroids[i].position.y - asteroids[j].position.y;
                var distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 40) {
                    asteroidSpeedX[j] *= -1;
                    asteroidSpeedY[j] *= -1;
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