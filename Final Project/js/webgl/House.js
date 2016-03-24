/*
    Graphics Assignment 3
    Group Members: Justin, Tyler, Will, Michael, Guy
*/

var camera, scene, renderer, controls, stats, collisionObj, frontNode, backNode;
var clock = new THREE.Clock();
var collisionForward = false, collisionBack = false;
var collisionList = [];
var doorList = [];

//Variable for entering keys.
var keyState = [];

//testing purposes only remove later
var point = null, point2 = null, point3 = null;



/*
myAudio = new Audio('music/scary.ogg');
myAudio.addEventListener('ended', function() {
        this.currentTime = 0;
        this.play();
}, false);
myAudio.play();
myAudio.volume = 0.05;
*/

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

        //New perspective camera
        camera = new THREE.PerspectiveCamera(50, 550 / 450, 0.1, 1000);

        scene = new THREE.Scene();

        var ambientLight = new THREE.AmbientLight(0x1f1f1f);
        scene.add(ambientLight);
                        
        var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(0, 0, 10);        
        scene.add(directionalLight);


        var loader = new THREE.TextureLoader();;
        //Making some grass
        var groundTexture = loader.load("textures/grass.jpg");
        groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
        groundTexture.repeat.set(15, 15);
        groundTexture.anisotropy = 25;

        //Grass's material
        var groundMaterial = new THREE.MeshPhongMaterial({
                color: 0x505050,
                specular: 0x101010,
                map: groundTexture
        });

        //Grass's Mesh
        var mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(200, 200), groundMaterial);
        mesh.position.y = 0;
        mesh.position.x = 20;
        mesh.position.z = 20;
        mesh.rotation.x = -Math.PI / 2;
        mesh.receiveShadow = true;
        scene.add(mesh);

        //The cylinder acts as a bounding box for collision - it is used internally to position the collision nodes
        //the material can be changed for debuging to see the collision box
        var collisionGeo = new THREE.CylinderGeometry(3, 3, 1, 16, 1);
        var collisionMat = new THREE.MeshPhongMaterial({
                transparent: true
        });
        collisionObj = new THREE.Mesh(collisionGeo, collisionMat);
        collisionObj.position.y = 5;
        collisionObj.position.z = 35;
        collisionObj.position.x = 35;

        //3D points in space used to represent collision nodes on the front/back of our character
        frontNode = new THREE.Object3D();
        backNode = new THREE.Object3D();

        //the front/back nodes are parented to the collision cylinder 
        collisionObj.add(frontNode);
        collisionObj.add(backNode);
        scene.add(collisionObj);      
        
        frontNode.position.z = -3;
        backNode.position.z = 3;

        camera.position.y = 5;
        camera.rotation.y = Math.PI / 4;                

        //event listeners for movement and firing
        window.addEventListener('keydown', onKeyDown, false);
        window.addEventListener('keyup', onKeyUp, false);


        //Textures
        var ceilingTex = loader.load("textures/drywall.jpg");
        ceilingTex.wrapS = ceilingTex.wrapT = THREE.RepeatWrapping;
        ceilingTex.repeat.set(15, 15);
        ceilingTex.anisotropy = 25;

        var wallTex = loader.load("textures/brick.jpg");
        wallTex.wrapS = wallTex.wrapT = THREE.RepeatWrapping;
        wallTex.repeat.set(15, 15);
        wallTex.anisotropy = 25;

        var floorTex = loader.load("textures/woodFloor.jpg");
        floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
        floorTex.repeat.set(15, 15);
        floorTex.anisotropy = 25;

        var doorTex = loader.load("textures/door.jpg");
        doorTex.wrapS = doorTex.wrapT = THREE.RepeatWrapping;        
        doorTex.anisotropy = 25;

        //ENTIRE HOUSE - 70 wide by 70 long by 20 high
        var house = new THREE.Object3D();

        //WALLS
        var walls = new THREE.Object3D();

        //FRONT WALL
        var frontWall = new THREE.Object3D();
        var frontWall_L = new THREE.Object3D();
        var frontWall_R = new THREE.Object3D();

        var geometry = new THREE.BoxGeometry(10, 10, 1);
        //Adjust origin point to the bottom left.
        geometry.translate(5, 5, 0);
        var material = new THREE.MeshPhongMaterial({
            map: wallTex
        });

        var fullSlab = new THREE.Mesh(geometry, material);       

        geometry = new THREE.BoxGeometry(10, 5, 1);
        geometry.translate(5, 2.5, 0); //Adjust origin point to the bottom left.
        var halfSlabY = new THREE.Mesh(geometry, material);
        halfSlabY.position.x = 10;
                
        var fullSlab2 = fullSlab.clone();
        fullSlab2.position.x = 20;
        
        frontWall_L.add(fullSlab);
        frontWall_L.add(halfSlabY);
        frontWall_L.add(fullSlab2);

        frontWall_R = frontWall_L.clone();
        frontWall_R.position.x = 40;
        frontWall.add(frontWall_L);
        frontWall.add(frontWall_R);

        //DOOR
        var doorMat = new THREE.MeshPhongMaterial({
            map: doorTex
        });

        var door = fullSlab.clone();
        door.material = doorMat;
        door.position.x = 30;

        var door_Top = door.clone();
        door_Top.material = material;

        //add the door to the list of interactable doors
        doorList.push(door);
    
        var frontWall_Top = frontWall.clone();
        frontWall_Top.rotation.x = Math.PI;
        frontWall_Top.position.y = 20;

        frontWall_Top.add(door_Top);
        frontWall.add(door);
        
        //outer walls without windows        
        var sideWallGeo = new THREE.BoxGeometry(71, 20, 1);
        sideWallGeo.translate(35, 10, 0);
        var sideMat = new THREE.MeshPhongMaterial({
            map: wallTex
        });

        var sideWall_L = new THREE.Mesh(sideWallGeo, sideMat);
        var sideWall_R = sideWall_L.clone();
        var sideWall_Back = sideWall_L.clone();

        sideWall_L.rotation.y = Math.PI / 2;
        sideWall_R.rotation.y = Math.PI / 2;
        sideWall_L.position.x = 70;
        sideWall_Back.position.z = -70;

        walls.add(sideWall_L);
        walls.add(sideWall_R);
        walls.add(sideWall_Back);
        walls.add(frontWall);
        walls.add(frontWall_Top);

        //floor
        var floorGeo = new THREE.BoxGeometry(70, 0.1, 70);
        floorGeo.translate(35, 0.05, 35);

        var floorMat = new THREE.MeshPhongMaterial({            
            map: floorTex
        });
        var floor = new THREE.Mesh(floorGeo, floorMat);
        floor.translateZ(-70);      

        //celing
        var ceilingMat = new THREE.MeshPhongMaterial({
            map: ceilingTex
        });

        var ceiling = new THREE.Mesh(floorGeo, ceilingMat)
        ceiling.translateY(20);
        ceiling.translateZ(-70);

        //roof 
        var roofGeo = new THREE.CylinderGeometry(0, 70, 25, 4, 32);
        roofGeo.rotateY(Math.PI / 4);
        roofGeo.translate(35, 12.5, 35);
        var roofMat = new THREE.MeshPhongMaterial({
            color: 0x000000,
            emissive: 0x072534
        });
        var roof = new THREE.Mesh(roofGeo, roofMat);
        roof.translateY(20.1);
        roof.translateZ(-70);

        //inside walls
        var innerWall = new THREE.Mesh(sideWallGeo, sideMat);
        innerWall.scale.x = 0.4;
        innerWall.translateZ(-35);
        walls.add(innerWall);

        var innerWall2 = innerWall.clone();
        innerWall2.translateX(41.6);
        walls.add(innerWall2);

        var innerWall_Short = innerWall.clone();
        innerWall_Short.scale.x = 0.25;
        innerWall_Short.rotateY(Math.PI / 2);
        innerWall_Short.translateZ(27.7);
        walls.add(innerWall_Short);

        var innerWall_Short2 = innerWall_Short.clone();
        innerWall_Short2.translateZ(14.2);
        innerWall_Short2.translateX(17.2);
        walls.add(innerWall_Short2);

        //light
        var insideLight = new THREE.PointLight(0xffffff, 0.6, 80);
        insideLight.translateZ(-35);
        insideLight.translateX(35);
        insideLight.translateY(15);
        
        house.add(insideLight);
        house.add(roof)
        house.add(ceiling);
        house.add(floor);        
        house.add(walls);


        //add all of the walls to the collision list
        for (var i = 0; i < frontWall_L.children.length; i++) {
            collisionList.push(frontWall_L.children[i]);
        }

        for (var i = 0; i < frontWall_R.children.length; i++) {
            collisionList.push(frontWall_R.children[i]);
        }

        for (var i = 0; i < walls.children.length; i++) {           
            collisionList.push(walls.children[i]);            
        }

        collisionList.push(door);

        scene.add(house);
}

//Returns a random int in a range, inclusive.
function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
}

//Converts degrees to radians.
function toRads(degrees) {
        return degrees * (3.14 / 180)
}

//get the distane between 2 points
function distance(v1, v2) {
    var dx = v2.x - v1.x;
    var dy = v2.y - v1.y;
    var dz = v2.z - v1.z;    
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}


//updates every frame used for animation and input handling
function render() {
        //make the camera follow the collisionObj 
        camera.position.set(collisionObj.position.x, collisionObj.position.y, collisionObj.position.z);
        camera.rotation.set(collisionObj.rotation.x, collisionObj.rotation.y, collisionObj.rotation.z);    

        //check for user input
        handleInput();

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
        //movement and rotation using WASD
        if (keyState['a'.charCodeAt(0) - 32]) {
            collisionObj.rotateY(0.025);
        }
        if (keyState['d'.charCodeAt(0) - 32]) {
            collisionObj.rotateY(-0.025);            
        }
        if (keyState['w'.charCodeAt(0) - 32]) {
                //disable forward movement if the frontNode collides with a wall
                if (!checkCollision(0)) {
                    collisionObj.translateZ(-0.25);                    
                }    
        }
        if (keyState['s'.charCodeAt(0) - 32]) {
                //disable backward movement if the backNode collides with a wall
                if (!checkCollision(1)) {
                    collisionObj.translateZ(0.25);
                }                
        }

        //e for interaction
        if (keyState['e'.charCodeAt(0) - 32]) {
            for (var i = 0; i < doorList.length; i++) {                
                if (distance(collisionObj.position, doorList[i].position) < 10) {                                        
                    interactDoor(doorList[i]);
                }
            }
        }

        
}


//open a door
function interactDoor(door) {
    var delta = 0;
    if (door.rotation.y < 1.5) {
        delta = 0.4;
        door.rotateY(delta);        
    }
}

//check the vertex at the front or back of the object depending on collision
function checkCollision(direction) {    
    
    //get the forward/backward direction from the front/back node to the center of the collisionObj
    var rayDirection = new THREE.Vector3();

    //0 = front, 1 = back
    if (direction == 0) {
        rayDirection.setFromMatrixPosition(frontNode.matrixWorld).sub(collisionObj.position);
    }
    else {
        rayDirection.setFromMatrixPosition(backNode.matrixWorld).sub(collisionObj.position);
    }
    
    
    var collision = false;

    //cast a ray forward the origin of the player's collision object 
    var ray = new THREE.Raycaster(collisionObj.position, rayDirection.clone().normalize());

    //check if the ray to the node collides with any of the walls
    var collisions = ray.intersectObjects(collisionList);
    if (collisions.length > 0 && collisions[0].distance < rayDirection.length()) {
        collision = true;
    }

    return collision;
}
