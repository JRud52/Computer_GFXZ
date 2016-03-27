/*
    Graphics Assignment 3
    Group Members: Justin, Tyler, Will, Michael, Guy
*/

var camera, scene, renderer, controls, stats, collisionObj, frontNode, backNode;
var clock = new THREE.Clock();
var collisionForward = false,
        collisionBack = false;
var collisionList = [],
        houseList = [],
        doorList = [];
var loader, objectLoader;

var doorTex, floorTex, wallTex, ceilingTex;

//used to disable collision
var collisionOff = false;

//Variable for entering keys.
var keyState = [];

var sky, sunSphere;
var azimuth = 0;

//testing purposes only, remove later
var point = null,
        point2 = null,
        point3 = null;

var doorOpen = new Audio('music/door.ogg');

var options, spawnerOptions, particleSystem;
var tick = 0;


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
        renderer.setPixelRatio(550 / 450);
        renderer.setSize(550, 450);
        container.appendChild(renderer.domElement);

        //New perspective camera
        camera = new THREE.PerspectiveCamera(50, 550 / 450, 0.1, 2000000);

        scene = new THREE.Scene();

        var ambientLight = new THREE.AmbientLight(0xaaaaaa);
        scene.add(ambientLight);

        var directionalLight = new THREE.DirectionalLight(0xf8f9dc, 0.5);
        directionalLight.position.set(0, 100, 100);
        //directionalLight.rotateY(45);
        scene.add(directionalLight);

        //texture loader
        loader = new THREE.TextureLoader();

        //object loader
        objectLoader = new THREE.ObjectLoader();

        //Textures
        ceilingTex = loader.load("textures/drywall.jpg");
        ceilingTex.wrapS = ceilingTex.wrapT = THREE.RepeatWrapping;
        ceilingTex.repeat.set(15, 15);
        ceilingTex.anisotropy = 25;

        wallTex = loader.load("textures/brick.jpg");
        wallTex.wrapS = wallTex.wrapT = THREE.RepeatWrapping;
        wallTex.repeat.set(2.5, 2.5);
        wallTex.anisotropy = 25;

        floorTex = loader.load("textures/woodFloor.jpg");
        floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
        floorTex.repeat.set(15, 15);
        floorTex.anisotropy = 25;

        doorTex = loader.load("textures/door.jpg");
        doorTex.wrapS = doorTex.wrapT = THREE.RepeatWrapping;
        doorTex.anisotropy = 25;

        //Making some grass
        var groundTexture = loader.load("textures/grass.jpg");
        groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
        groundTexture.repeat.set(30, 30);
        groundTexture.anisotropy = 25;

        var roadTexture = loader.load("textures/road.jpg");
        roadTexture.wrapS = roadTexture.wrapT = THREE.RepeatWrapping;
        roadTexture.repeat.set(1, 25);
        roadTexture.anisotropy = 25;

        //Grid
        var size = 250,
                step = 10;
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


        //Initial Grass
        var groundMaterial = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                specular: 0x111111,
                map: groundTexture
        });
        var mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(450, 1080), groundMaterial);
        mesh.position.y = 0;
        mesh.position.x = 35;
        mesh.position.z = 340;
        mesh.rotation.x = -Math.PI / 2;
        mesh.receiveShadow = true;
        scene.add(mesh);

        //Creating Initial Road
        var roadMaterial = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                specular: 0x111111,
                map: roadTexture
        });

        var roadMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(50, 750), roadMaterial);
        roadMesh.position.y = 0.01;
        roadMesh.position.x = 35;
        roadMesh.position.z = 375 + 30;
        roadMesh.rotation.x = -Math.PI / 2;
        roadMesh.receiveShadow = true;
        scene.add(roadMesh);

        var geometry = new THREE.SphereGeometry(1, 32, 32);
        var material = new THREE.MeshBasicMaterial({
                color: 0xffffFF
        });
        var sphereC = new THREE.Mesh(geometry, material);
        scene.add(sphereC);
        var geometry = new THREE.SphereGeometry(1, 32, 32);
        var material = new THREE.MeshBasicMaterial({
                color: 0x42ff00
        });
        var sphereY = new THREE.Mesh(geometry, material);
        scene.add(sphereY);
        sphereY.position.y += 1;
        var geometry = new THREE.SphereGeometry(1, 32, 32);
        var material = new THREE.MeshBasicMaterial({
                color: 0x0d00ff
        });
        var sphereZ = new THREE.Mesh(geometry, material);
        sphereZ.position.z += 1;
        scene.add(sphereZ);
        var geometry = new THREE.SphereGeometry(1, 32, 32);
        var material = new THREE.MeshBasicMaterial({
                color: 0xff0000
        });
        var sphereX = new THREE.Mesh(geometry, material);
        sphereX.position.x += 1;
        scene.add(sphereX);



        //The cylinder acts as a bounding box for collision - it is used internally to position the collision nodes
        //the material can be changed for debuging to see the collision box
        var collisionGeo = new THREE.CylinderGeometry(3, 3, 1, 16, 1);
        var collisionMat = new THREE.MeshPhongMaterial({
                transparent: true
        });
        collisionObj = new THREE.Mesh(collisionGeo, collisionMat);
        collisionObj.position.y = 5;
        collisionObj.position.z = 100;
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


        //Static house
        generateHouse(new THREE.Vector3(0, 0, 0), 0);

        //Right side of the road
        generateHouse(new THREE.Vector3(160, 0, 100), toRads(270));
        generateHouse(new THREE.Vector3(160, 0, 200), toRads(270));
        generateHouse(new THREE.Vector3(160, 0, 300), toRads(270));
        generateHouse(new THREE.Vector3(160, 0, 400), toRads(270));

        //Left side of the road
        generateHouse(new THREE.Vector3(-90, 0, 30), toRads(90));
        generateHouse(new THREE.Vector3(-90, 0, 130), toRads(90));
        generateHouse(new THREE.Vector3(-90, 0, 230), toRads(90));
        generateHouse(new THREE.Vector3(-90, 0, 330), toRads(90));

        // Add Sky Mesh
        sky = new THREE.Sky();
        scene.add(sky.mesh);

        // Add Sun Helper
        sunSphere = new THREE.Mesh(
                new THREE.SphereBufferGeometry(20000, 16, 8),
                new THREE.MeshBasicMaterial({
                        color: 0xffffff
                })
        );
        sunSphere.position.y = -700000;
        scene.add(sunSphere);

        var distance = 400000;

        var uniforms = sky.uniforms;
        uniforms.turbidity.value = 1;
        uniforms.reileigh.value = 0.3;
        uniforms.luminance.value = 1;
        uniforms.mieCoefficient.value = 0.001;
        uniforms.mieDirectionalG.value = 0.9;

        var theta = Math.PI * (0 - 0.5);
        var phi = 2 * Math.PI * (0 - 0.5);

        sunSphere.position.x = distance * Math.cos(phi);
        sunSphere.position.y = distance * Math.sin(phi) * Math.sin(theta);
        sunSphere.position.z = distance * Math.sin(phi) * Math.cos(theta);

        sunSphere.visible = true;

        sky.uniforms.sunPosition.value.copy(sunSphere.position);

}

//Returns a random int in a range, inclusive.
function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
}

//Converts degrees to radians.
function toRads(degrees) {
        return degrees * (3.14 / 180)
}

//get the magnitude of a 3D vector
function magnitude(vector3) {
        return vector3.x * vector3.x + vector3.y * vector3.y + vector3.z * vector3.z;
}

//updates every frame used for animation and input handling
function render() {

        updateHouses();
        //make the camera follow the collisionObj
        camera.position.set(collisionObj.position.x, collisionObj.position.y, collisionObj.position.z);
        camera.rotation.set(collisionObj.rotation.x, collisionObj.rotation.y, collisionObj.rotation.z);

        //check for user input
        handleInput();

        var theta = Math.PI * (0 - 0.5);
        if (azimuth >= 0.51)
                azimuth = 0;
        var phi = 2 * Math.PI * ((azimuth += 0.0001) - 0.5);

        var distance = 400000;

        sunSphere.position.x = distance * Math.cos(phi);
        sunSphere.position.y = distance * Math.sin(phi) * Math.sin(theta);
        sunSphere.position.z = distance * Math.sin(phi) * Math.cos(theta);

        sky.uniforms.sunPosition.value.copy(sunSphere.position);

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

        var moveAmount = 1;
        //movement and rotation using WASD
        if (keyState['a'.charCodeAt(0) - 32]) {
                collisionObj.rotateY(moveAmount / 25);
        }
        if (keyState['d'.charCodeAt(0) - 32]) {
                collisionObj.rotateY(-moveAmount / 25);
        }
        if (keyState['w'.charCodeAt(0) - 32]) {
                //disable forward movement if the frontNode collides with a wall
                if (!checkCollision(0)) {
                        collisionObj.translateZ(-moveAmount);
                }
        }
        if (keyState['s'.charCodeAt(0) - 32]) {
                //disable backward movement if the backNode collides with a wall
                if (!checkCollision(1)) {
                        collisionObj.translateZ(moveAmount);
                }
        }

        //e for interaction
        if (keyState['e'.charCodeAt(0) - 32]) {
                for (var i = 0; i < houseList.length; i++) {
                        var doorPos = new THREE.Vector3().setFromMatrixPosition(doorList[i].matrixWorld);

                        if (collisionObj.position.distanceTo(doorPos) < 10) {
                                interactDoor(doorList[i]);
                        }
                }
        }
}

function generateAssets() {
        var assets = new THREE.Object3D();

        var framedPicGeo = new THREE.BoxGeometry(5, 5, 0.5);
        framedPicGeo.translate(2.5, 2.5, 0);
        var framedPicMat = new THREE.MeshPhongMaterial({
                color: 0x00ff00
        });
        var framedPic = new THREE.Mesh(framedPicGeo, framedPicMat);

        var picFrame = new THREE.Object3D();
        var picFrameEdgeGeo = new THREE.CylinderGeometry(0.5, 0.5, 5, 3, 1);
        picFrameEdgeGeo.translate(0, 2.5, 0);
        var picFrameMat = new THREE.MeshPhongMaterial({
                color: 0xffffff
        });
        var picFrameEdge = new THREE.Mesh(picFrameEdgeGeo, picFrameMat);
        var picFrameEdge2 = new THREE.Mesh(picFrameEdgeGeo, picFrameMat);
        var picFrameEdge3 = new THREE.Mesh(picFrameEdgeGeo, picFrameMat);
        var picFrameEdge4 = new THREE.Mesh(picFrameEdgeGeo, picFrameMat);

        var picFrameCornerGeo = new THREE.BoxGeometry(1, 1, 1);
        // picFrameCornerGeo.translate(0.25, 0.25, 0);
        var picFrameCorner = new THREE.Mesh(picFrameCornerGeo, picFrameMat);
        var picFrameCorner2 = new THREE.Mesh(picFrameCornerGeo, picFrameMat);
        var picFrameCorner3 = new THREE.Mesh(picFrameCornerGeo, picFrameMat);
        var picFrameCorner4 = new THREE.Mesh(picFrameCornerGeo, picFrameMat);
        picFrameCorner2.translateY(5);
        picFrameCorner3.translateX(5);
        picFrameCorner4.translateX(5);
        picFrameCorner4.translateY(5);

        picFrameEdge2.translateX(5);
        picFrameEdge3.translateX(5);
        picFrameEdge3.rotateZ(Math.PI / 2);
        picFrameEdge4.translateX(5);
        picFrameEdge4.translateY(5);
        picFrameEdge4.rotateZ(Math.PI / 2);

        picFrame.add(picFrameEdge);
        picFrame.add(picFrameEdge2);
        picFrame.add(picFrameEdge3);
        picFrame.add(picFrameEdge4);
        picFrame.add(framedPic);

        picFrame.add(picFrameCorner);
        picFrame.add(picFrameCorner2);
        picFrame.add(picFrameCorner3);
        picFrame.add(picFrameCorner4);

        picFrame.translateY(10);
        picFrame.translateX(32.5);
        picFrame.translateZ(-69.5);

        assets.add(picFrame);


        objectLoader.load("models/sofa.json", function(obj) {

                obj.translateX(50);
                obj.translateY(3);
                obj.translateZ(-20);
                obj.rotateY(-Math.PI / 2);

                //collision box
                var collisionCubeGeo = new THREE.BoxGeometry(15, 5, 7.5);
                var collisionCubeMat = new THREE.MeshPhongMaterial({
                        transparent: true,
                        opacity: 0
                });
                var collisionCube = new THREE.Mesh(collisionCubeGeo, collisionCubeMat);
                obj.add(collisionCube);
                collisionCube.translateZ(-0.75);
                collisionList.push(collisionCube);
                assets.add(obj);
        });

        //BED
        objectLoader.load("models/bed.json", function(obj) {

                obj.translateX(62);
                obj.translateY(2);
                obj.translateZ(-43);

                //collision box
                var collisionCubeGeo = new THREE.BoxGeometry(14, 8, 15.5);
                var collisionCubeMat = new THREE.MeshPhongMaterial({
                        transparent: true,
                        opacity: 0
                });
                var collisionCube = new THREE.Mesh(collisionCubeGeo, collisionCubeMat);
                obj.add(collisionCube);
                collisionCube.translateZ(-0.25);
                collisionList.push(collisionCube);

                assets.add(obj);
        });


        //LAMP
        objectLoader.load("models/lamp.json", function(obj) {

                obj.translateX(10);
                obj.translateY(20);
                obj.translateZ(-15);

                assets.add(obj);
        });


        //Toilet
        objectLoader.load("models/toilet.json", function(obj) {
                obj.translateX(5);
                obj.translateZ(-68.5);
                obj.rotateY(1.5);
                obj.scale.set(0.5, 0.5, 0.5);

                //collision box
                var collisionCubeGeo = new THREE.BoxGeometry(10, 20, 5);
                var collisionCubeMat = new THREE.MeshPhongMaterial({
                        transparent: true,
                        opacity: 0
                });
                var collisionCube = new THREE.Mesh(collisionCubeGeo, collisionCubeMat);
                obj.add(collisionCube);
                collisionList.push(collisionCube);

                assets.add(obj);
        });

        return assets;
}

function generateHouse(positionVector, rotationRads) {

        var assets = generateAssets();

        //ENTIRE HOUSE - 70 wide by 70 long by 20 high (not including the roof)
        var house = new THREE.Object3D();

        house.add(assets);

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

        //HOUSE WINDOWS
        var glassGeo = new THREE.BoxGeometry(9, 9, 0.5);
        glassGeo.translate(4.5, 4.5, 0);
        var glassMat = new THREE.MeshPhongMaterial({
                transparent: true,
                opacity: 0.4,
                color: 0x0C0C0C
        });
        var glass = new THREE.Mesh(glassGeo, glassMat);
        glass.translateX(1);
        glass.translateY(1);

        var windowEdgeGeo = new THREE.BoxGeometry(10, 1, 1);
        windowEdgeGeo.translate(5, 0.5, 0);
        var windowEdgeMat = new THREE.MeshPhongMaterial({
                color: 0xffffff
        });

        var windowEdge = new THREE.Mesh(windowEdgeGeo, windowEdgeMat);
        var windowEdge2 = windowEdge.clone();
        windowEdge2.translateX(1);
        windowEdge2.rotateZ(Math.PI / 2);


        var windowEdge3 = windowEdge.clone();
        windowEdge3.translateY(9);

        var windowEdge4 = windowEdge.clone();
        windowEdge4.translateX(10);
        windowEdge4.rotateZ(Math.PI / 2);

        var windowEdge5 = windowEdge.clone();
        windowEdge5.translateX(5.5);
        windowEdge5.rotateZ(Math.PI / 2);

        var windowEdge6 = windowEdge.clone();
        windowEdge6.translateY(4.25);

        var houseWindow = new THREE.Object3D();
        houseWindow.add(windowEdge6);
        houseWindow.add(windowEdge5);
        houseWindow.add(windowEdge4);
        houseWindow.add(windowEdge3);
        houseWindow.add(windowEdge2);
        houseWindow.add(windowEdge);
        houseWindow.add(glass);

        houseWindow.translateX(10);
        houseWindow.translateY(5);

        var houseWindow2 = houseWindow.clone();
        houseWindow2.translateX(40);

        frontWall.add(houseWindow);
        frontWall.add(houseWindow2);

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
        var roofGeo = new THREE.CylinderGeometry(0, 60, 25, 4, 32);
        roofGeo.rotateY(Math.PI / 4);
        roofGeo.translate(35, 12.5, 35);
        var roofMat = new THREE.MeshPhongMaterial({
                color: 0x444444
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

        var innerWall_ExtraShort = innerWall_Short.clone();
        innerWall_ExtraShort.scale.x = 0.1;
        innerWall_ExtraShort.translateX(28);
        walls.add(innerWall_ExtraShort);


        var innerWall_Short2 = innerWall_Short.clone();
        innerWall_Short2.translateZ(14.2);
        innerWall_Short2.translateX(17.2);
        walls.add(innerWall_Short2);

        var innerWall_ExtraShort2 = innerWall_Short2.clone();
        innerWall_ExtraShort2.scale.x = 0.1;
        innerWall_ExtraShort2.translateX(-17);
        walls.add(innerWall_ExtraShort2);

        //light
        var insideLight = new THREE.PointLight(0xffffff, 0.3, 80);
        insideLight.translateZ(-35);
        insideLight.translateX(35);
        insideLight.translateY(15);

        //parent all of the objects to the house object
        //house.add(insideLight);
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

        //add the door to the collision list
        collisionList.push(door);

        //move the house
        house.position.set(positionVector.x, positionVector.y, positionVector.z);

        if (rotationRads > 0) {
                //rotate the house
                house.rotateY(rotationRads);

                //compensate for pivot point not being in the center of the house by moving it
                house.translateX(-70);
                house.translateZ(70);
        }

        //add this new house to the list of houses

        var houseObject = { house: house, hide: false, animateType: 0, beginAnimation: true };
        houseList.push(houseObject);

        scene.add(houseObject.house);
}

//open a door
function interactDoor(door) {
        var delta = 0;
        if (door.rotation.y < 1.5) {
                delta = 0.4;
                door.rotateY(delta);
                doorOpen.play();
        }
}

//check the vertex at the front or back of the object depending on collision
function checkCollision(direction) {
        if (collisionOff) return false;

        //get the forward/backward direction from the front/back node to the center of the collisionObj
        var rayDirection = new THREE.Vector3();

        //0 = front, 1 = back
        if (direction == 0) {
                rayDirection.setFromMatrixPosition(frontNode.matrixWorld).sub(collisionObj.position);
        } else {
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

var randomRotate = toRads(randomInt(1,10));
var rotateTick = 0;

function updateHouses() {
        var houseIndex;
        for (var i = 0; i < houseList.length; i++) {
                var x = Math.pow(camera.position.x - houseList[i].house.position.x, 2);
                //var y = Math.pow(camera.position.y - houseList[0].position.y, 2);
                var z = Math.pow(camera.position.z - houseList[i].house.position.z, 2);
                var distance = Math.sqrt(x + z);

                //If house is far away
                if (distance > 225)
                        houseList[i].hide = true;
                //Its close
                else
                        houseList[i].hide = false;


                //fallFromHeavens(houseList[i]);

                if(houseList[i].hide == true) {

                        riseOrLowerHouse(houseList[i]);

                }

                else {

                        riseOrLowerHouse(houseList[i]);
                }
        }
}
//My idea is to have 1 or 3 animations like we were talking about, it will randomly call one of these funcitons
//All that works, the problem is because it is based on distance it will infinitely call the animation in its current state
//Because my animation sends the object farther away.  To deal with this im thinking of using some sort of boolean flag but
//Cant wrap my head around it right now, i think it will increase performance as well.
function fallFromHeavens(house) {

        if(house.hide == true) {

                house.house.translateY(1);
                if(rotateTick++ == 0) {
                        //house.house.rotateZ(randomRotate);
                        //house.house.rotateX(randomRotate);
                }
                else {
                        //house.house.rotateZ(-randomRotate);
                        //house.house.rotateX(-randomRotate);
                }

                if(house.house.position.y >= 50) {

                        house.hide = false;
                        house.beginAnimation == false;
                        house.animateType = randomInt(0,1);
                        randomRotate = toRads(randomInt(1,10));

                        house.house.position.y = -50;

                }
        }

        else {

        }
}

function riseOrLowerHouse(house) {

        if(house.hide == true) {

                house.house.translateY(-0.05);

                if(house.house.position.y <= -50) {

                        house.hide = false;
                        house.animateType = randomInt(0, 1);
                        randomRotate = toRads(randomInt(1,10));
                }
        }

        else {

                if(house.house.position.y < 0) {
                        house.house.translateY(0.05);

                        if(house.house.position.y >= 0) {

                                house.animateType = randomInt(0, 1);
                                randomRotate = toRads(randomInt(1,10));
                        }
                }
        }
}
