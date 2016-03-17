/*
    Graphics Assignment 3
    Group Members: Justin, Tyler, Will, Michael, Guy
*/

var camera, scene, renderer, controls, stats, collisionObj, lastCubePos;
var clock = new THREE.Clock();
var wallList = [];

//Variable for entering keys.
var keyState = [];

/*
    ONLOAD FUNCTION
*/
function main() {
    init();
    animate();
}


//initial setup
function init() {

    //Set to our custom canvas
    container = document.getElementById('myCanvasLeft');

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setClearColor(0x808080, 0.5);
    renderer.setPixelRatio(550 / 450);
    renderer.setSize(550, 450);
    container.appendChild(renderer.domElement);

    //New perspective camera, positioned to face the trees and such.
    camera = new THREE.PerspectiveCamera(90, 550 / 450, 0.1, 10000);

    var orbit = new THREE.OrbitControls(camera, renderer.domElement);
    orbit.enableZoom = false;

    scene = new THREE.Scene();

    //light 2: ambient light
    ambientLight = new THREE.AmbientLight(0xFFFFFF);
    ambientLight.position.set(0, 0, 15);
    ambientLight.castShadow = true;
    scene.add(ambientLight);

    hemisphereLight = new THREE.HemisphereLight(0xFFFFFF, 0xC1C1D1, 0.25);
    hemisphereLight.castShadow = true;
    hemisphereLight.position.set(0, 15, 0);
    scene.add(hemisphereLight);

    var objectLoader = new THREE.ObjectLoader();
    objectLoader.load("models/feels.json", function(obj) {
        //scene.add( obj );
    });



    //Grid
    var size = 500, step = 10;
    var geometry = new THREE.Geometry();
    for (var i = -size; i <= size; i += step) {
        geometry.vertices.push(new THREE.Vector3(-size, 0, i));
        geometry.vertices.push(new THREE.Vector3(size, 0, i));
        geometry.vertices.push(new THREE.Vector3(i, 0, -size));
        geometry.vertices.push(new THREE.Vector3(i, 0, size));
    }
    var material = new THREE.LineBasicMaterial({
        color: 0x000000,
        opacity: 0.5
    });
    var line = new THREE.LineSegments(geometry, material);
    scene.add(line);

    //0,0,0 point
    var pointGeometry = new THREE.Geometry();
    pointGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
    var pointMaterial = new THREE.PointsMaterial({
        size: 10,
        sizeAttenuation: false,
        color: 0xC551F2
    });
    var point = new THREE.Points(pointGeometry, pointMaterial);
    scene.add(point);

    //drawWall(0, 0, 0);
    //drawWall(1, 0, 0);
    //drawWall(0, 1, 0);
    //drawWall(1, 1, 270);

    var degrees = [0, 90, 180, 270];

    for(i = 0; i < 10; i++) {
        for(j = 0; j < 10; j++) {
            if(randomInt(0,1) == 1) {
                    drawWall(i, j, degrees[randomInt(0,3)]);
            }
        }
    }


    var collisionGeo = new THREE.CylinderGeometry(4, 4, 1, 16, 1);
    var collisionMat = new THREE.MeshPhongMaterial({ color: 0xff0000, wireframe: true });
    collisionObj = new THREE.Mesh(collisionGeo, collisionMat);

    camera.position.y = 20;
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    scene.add(collisionObj);


    //event listeners for movement and firing
    window.addEventListener('keydown', onKeyDown, false);
    window.addEventListener('keyup', onKeyUp, false);
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function toRads(degrees) {
    return degrees * (3.14 / 180)
}

//Just give it the X and Z point in the grid to start at
function drawWall(x, z, rY) {

    var geometry = new THREE.BoxGeometry(10, 10, 1);
    geometry.translate(5, 5, 0); //Adjust origin point
    var material = new THREE.MeshPhongMaterial({
        color: 0xFF0000,
        emissive: 0x072534,
        side: THREE.DoubleSide,
        shading: THREE.SmoothShading
    });
    var cube = new THREE.Mesh(geometry, material);

    cube.position.x = x * 10;
    cube.position.z = z * 10;
    cube.rotateY(toRads(rY));
  
    //add the cube to the list of walls needed for collision
    wallList.push(cube);
        
    scene.add(cube);
}

//testing purposes only remove later
var point = null, point2 = null, point3 = null;
//updates every frame used for animation and input handling
function render() {
    collisionObj.geometry.verticesNeedUpdate = true;

//    collisionObj.position.set(camera.position.x, collisionObj.position.y, camera.position.z);
    var collisionObjPos = collisionObj.position.clone();

    //cast a ray from the origin of the player's collision cube to each of its vertices
    //loop through all of the vertices in the collision cube
    for (var i = 0; i < collisionObj.geometry.vertices.length; i++) {        

        //get the vertex in global space by cloning the vertex in local space then apply the matrix of the collision cube
        var vertexGlobalSpace = collisionObj.geometry.vertices[i].clone().applyMatrix4(collisionObj.matrix);

        //get the vector that points from the vertex in global space to the cube's origin
        var rayDirection = vertexGlobalSpace.sub(collisionObj.position);        

        //cast a ray from the origin of the player's collision cube towards the vertex - normalize because we only care about direction
        var ray = new THREE.Raycaster(collisionObjPos, rayDirection.clone().normalize());

        //check if the ray to the vertex collides with any of the walls
        var collisions = ray.intersectObjects(wallList);
        if (collisions.length > 0 && collisions[0].distance < rayDirection.length()){
            //console.log(" Hit ");
        }


        //TESTING ONLY
        if (i == 0 && point == null) {
            var pointGeo = new THREE.SphereGeometry(0.25, 32, 32);
            var pointMat = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
            point = new THREE.Mesh(pointGeo, pointMat);
            scene.add(point);            
            point.position.set(vertexGlobalSpace.x, vertexGlobalSpace.y, vertexGlobalSpace.z);
            console.log(vertexGlobalSpace);
            console.log(collisionObj.geometry.vertices[i]);
        }
        else if (i == 1 && point2 == null) {
            var pointGeo = new THREE.SphereGeometry(0.25, 32, 32);
            var pointMat = new THREE.MeshPhongMaterial({ color: 0x0000ff });
            point2 = new THREE.Mesh(pointGeo, pointMat);
            scene.add(point2);
            point2.position.set(vertexGlobalSpace.x, vertexGlobalSpace.y, vertexGlobalSpace.z);
            console.log(vertexGlobalSpace);
            console.log(collisionObj.geometry.vertices[i]);
        }
        else if (i == 8 && point3 == null) {
            var pointGeo = new THREE.SphereGeometry(0.25, 32, 32);
            var pointMat = new THREE.MeshPhongMaterial({ color: 0x00ffff });
            point2 = new THREE.Mesh(pointGeo, pointMat);
            scene.add(point2);            
            point2.position.set(vertexGlobalSpace.x, vertexGlobalSpace.y, vertexGlobalSpace.z);
            console.log(vertexGlobalSpace);
            console.log(collisionObj.geometry.vertices[i]);
        }
    }

    //render the scene
    renderer.render(scene, camera);
}

function animate() {
    requestAnimationFrame(animate);
    render();
}


//handles keydown events
function onKeyDown(event) {
    keyState[event.keyCode || event.charCode] = true;
}

//handles keyup events
function onKeyUp(event) {
    keyState[event.keyCode || event.charCode] = false;
}


//checks if the user hit specific keys for movement
function handleInput() {
    //movement and rotation WASD
    if (keyState['a'.charCodeAt(0) - 32]) {
        collisionObj.rotateZ(0.1);
    }
    if (keyState['d'.charCodeAt(0) - 32]) {
        collisionObj.rotateZ(-0.1);
    }
    if (keyState['w'.charCodeAt(0) - 32]) {
        collisionObj.translateY(2);
    }
    if (keyState['s'.charCodeAt(0) - 32]) {
        collisionObj.translateY(-2);
    }
}