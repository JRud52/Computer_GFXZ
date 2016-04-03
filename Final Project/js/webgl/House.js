/*
    Final Project
    Group Members: Justin, Tyler, Will, Michael, Guy
*/

var camera, scene, renderer, controls, stats, collisionObj, frontNode, backNode;
var clock = new THREE.Clock();

var collisionForward = false, collisionBack = false;
var houseList = [], doorList = [], tvList = [];
var loader, objectLoader;

var doorTex, floorTex, wallTex, ceilingTex;

var tvVideoTex = [];
var videos = [];
var videoContext = [];
var playingVidIndex = -1;

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
var houseLand = new Audio('music/land.ogg');

var options, spawnerOptions, particleSystem;
var tick = 0;

var roadMesh, grassMesh;

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
        camera = new THREE.PerspectiveCamera(90, 550 / 450, 0.1, 2000000);

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

        //Initial Grass
        grassMaterial = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                specular: 0x111111,
                map: groundTexture
        });
        grassMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(450, 1000), grassMaterial);
        grassMesh.position.y = 0;
        grassMesh.position.x = 35;
        grassMesh.position.z = 125 + 5;
        grassMesh.rotation.x = -Math.PI / 2;
        grassMesh.receiveShadow = true;
        scene.add(grassMesh);

        //Creating Initial Road
        roadMaterial = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                specular: 0x111111,
                map: roadTexture
        });

        roadMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(50, 600), roadMaterial);
        roadMesh.position.y = 0.01;
        roadMesh.position.x = 35;
        roadMesh.position.z = 300 + 30;
        roadMesh.rotation.x = -Math.PI / 2;
        roadMesh.receiveShadow = true;
        scene.add(roadMesh);

        //The cylinder acts as a bounding box for collision - it is used internally to position the collision nodes
        //the material can be changed for debuging to see the collision box
        var collisionGeo = new THREE.CylinderGeometry(3, 3, 1, 16, 1);
        var collisionMat = new THREE.MeshPhongMaterial({
                transparent: true,
                opacity: 0
        });
        collisionObj = new THREE.Mesh(collisionGeo, collisionMat);
        collisionObj.position.y = 5;
        collisionObj.position.z = 50;
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

        for(i = 0; i < 5; i++) {

            //Video information for the TV
            // get the video element
            videos[i] = document.getElementById("tvVideo"+(i+1));
            videos[i].load();

            videoImage = document.createElement('canvas');
            videoImage.width = 480;
            videoImage.height = 204;

            //defaults for the initial video image
            videoContext[i] = videoImage.getContext('2d');
            videoContext[i].fillStyle = '#000000';
            videoContext[i].fillRect(0, 0, videoImage.width, videoImage.height);

            //texture representing the video
            tvVideoTex[i] = new THREE.Texture(videoImage);
            tvVideoTex[i].minFilter = THREE.LinearFilter;
            tvVideoTex[i].magFilter = THREE.LinearFilter;
            tvVideoTex[i].format = THREE.RGBFormat;
        }



        //Static house
        generateHouse(new THREE.Vector3(0, 0, 0), 0, 0, false, 0, 0);

        //set of inital houses along the road sides
        for (var i = 0; i < 3; i++) {
                generateHouse(new THREE.Vector3(160, 0, 100 + 100 * i), toRads(270), 0, false);
                generateHouse(new THREE.Vector3(-90, 0, 30 + 100 * i), toRads(90), 0, false);
        }

        // Add Sky Mesh
        sky = new THREE.Sky();
        scene.add(sky.mesh);

        var sunTexture = loader.load("povray/images/texture.png");
        sunTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
        sunTexture.repeat.set(1, 35);
        sunTexture.anisotropy = 25;

        // Add Sun Helper
        sunSphere = new THREE.Mesh(
                new THREE.SphereBufferGeometry(20000, 16, 8),
                new THREE.MeshBasicMaterial({
                        color: 0xfaecd2
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

        scene.fog = new THREE.FogExp2( 0xc2f9f5, 0.0025 );
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

var aheadSpawnHouse = 300;
var moveRoad = false;
var roadTracker = 0;

//updates every frame used for animation and input handling
function render() {

        for(i = 0; i < videos.length; i++) {

            //get the new frame of the video on the TV
            if (videos[i].readyState === videos[i].HAVE_ENOUGH_DATA) {
                    videoContext[i].drawImage(videos[i], 0, 0);
                    if (tvVideoTex[i]){
                        tvVideoTex[i].needsUpdate = true;
                    }
            }
        }


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

        if (collisionObj.position.z > aheadSpawnHouse && collisionObj.position.z < aheadSpawnHouse + 15) {

                //House 1
                animationOne = randomInt(1, 3);
                animationTwo = randomInt(1, 3);

                //Animation 1 - Fall from Heavens.
                //Animation 2 - Rise Up
                //Animation 3 - Fling

                if (animationOne == 1) {
                        generateHouse(new THREE.Vector3(160, 100, aheadSpawnHouse + 100), toRads(270), animationOne, true);
                } else if (animationOne == 2)
                        generateHouse(new THREE.Vector3(160, -50, aheadSpawnHouse + 100), toRads(270), animationOne, true);
                else
                        generateHouse(new THREE.Vector3(160, 0, (aheadSpawnHouse + 100) + 500), toRads(270), animationOne, true, aheadSpawnHouse + 26);

                if (animationTwo == 1)
                        generateHouse(new THREE.Vector3(-90, 100, aheadSpawnHouse + 30), toRads(90), animationTwo, true);
                else if (animationTwo == 2)
                        generateHouse(new THREE.Vector3(-90, -50, aheadSpawnHouse + 30), toRads(90), animationTwo, true);
                else
                        generateHouse(new THREE.Vector3(-90, 0, (aheadSpawnHouse + 30) + 500), toRads(90), animationTwo, true, aheadSpawnHouse + 98);


                aheadSpawnHouse += 100;
        }

        updateHouses();

        if(moveRoad) {
            roadMesh.translateY(-2);
            grassMesh.translateY(-2);
            roadTracker+=2;

            if(roadTracker == 100) {
                roadTracker = 0;
                moveRoad = false;
            }
        }

        //render the scene
        renderer.render(scene, camera);
}

function updateHouses() {

        //remove old houses when there are more than 9 in the scene
        if (houseList.length > 7) {

            //move the static house forward
            houseList[0].house.translateZ(100);

            moveRoad = true;

            scene.remove(houseList[2].house);
            scene.remove(houseList[1].house);

            houseList.splice(1,2);
            doorList.splice(1,2);
            tvList.splice(1,2);
        }

        //update all houses
        for (i = 0; i < houseList.length; i++) {

                var house = houseList[i];

                if(i == 0) {
                    houseList[0].bathroomMirror.renderWithMirror(house.perspectiveMirror);
                }

                if (house.animateType == 1 && house.house.position.y > 0) {
                        house.house.position.y -= 0.5;
                        house.house.rotateY(toRads(3.6));
                        if (house.house.position.y == 0)
                                houseLand.play();
                        continue;
                }

                if (house.animateType == 2 && house.house.position.y < 0) {
                        house.house.position.y += 0.25;
                        if (house.house.position.y == 0)
                                houseLand.play();
                        continue;
                }

                if (house.animateType == 3 && house.house.position.z > house.zGoal) {
                        house.house.position.z -= 2;

                        house.house.rotateZ((Math.PI / 126) * 25); //Maybe be framerate independent, need outside testing

                        if (house.house.position.z > house.zGoal + 250)
                                house.house.position.y += 0.8;
                        else
                                house.house.position.y -= 0.8;

                        //Floating point hacks, i wish this was haskell lma0
                        if (house.house.position.z < house.zGoal || (house.house.position.z > house.zGoal && house.house.position.z < house.zGoal + 0.99))
                                houseLand.play();
                        continue;
                }
        }
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
                        //get global position of the doors and tv's
                        var doorPos = new THREE.Vector3().setFromMatrixPosition(doorList[i].matrixWorld);
                        var tvPos = new THREE.Vector3().setFromMatrixPosition(tvList[i].matrixWorld);

                        if (collisionObj.position.distanceTo(doorPos) < 10) {
                                interactDoor(doorList[i]);
                        }

                        if (collisionObj.position.distanceTo(tvPos) < 30) {
                            if (playingVidIndex == -1) {
                                playingVidIndex = houseList[i].houseVid;
                                videos[playingVidIndex].play();
                            }
                            else {
                                videos[playingVidIndex].pause();
                                playingVidIndex = -1;
                            }
                        }
                }
        }
}


function generateHouse(positionVector, rotationRads, animationType, animation, zGoal, houseIndex) {

        var allAssets = generateAssets(houseIndex);
        var assets = allAssets[0];
        var assetCollision = allAssets[1];
        var bathMirror = allAssets[2];
        var persMirror = allAssets[3];
        var houseCollision = [];

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


        //TV
        var vidIndex = randomInt(0, 4)
        var tvScreenGeo = new THREE.PlaneGeometry(15, 10, 4, 4);
        var tvScreenMat = new THREE.MeshLambertMaterial({
            color: 0xFFFFFF,
            map: tvVideoTex[vidIndex]
        });

        var tvScreen = new THREE.Mesh(tvScreenGeo, tvScreenMat);
        tvScreen.translateX(69);
        tvScreen.translateY(10);
        tvScreen.translateZ(-20);
        tvScreen.rotateY(-Math.PI / 2);
        house.add(tvScreen);
        tvList.push(tvScreen);

        //parent all of the objects to the house object
        //house.add(insideLight);
        house.add(roof)
        house.add(ceiling);
        house.add(floor);
        house.add(walls);


        //add all of the walls to the collision list
        for (var i = 0; i < frontWall_L.children.length; i++) {
                houseCollision.push(frontWall_L.children[i]);
        }

        for (var i = 0; i < frontWall_R.children.length; i++) {
                houseCollision.push(frontWall_R.children[i]);
        }

        for (var i = 0; i < walls.children.length; i++) {
                houseCollision.push(walls.children[i]);
        }

        //add the door to the collision list
        houseCollision.push(door);

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
        var houseObject = {
                house: house,
                animateType: animationType,
                animate: animation,
                zGoal: zGoal,
                assetCollisionList: assetCollision,
                houseCollisionList: houseCollision,
                bathroomMirror: bathMirror,
                perspectiveMirror: persMirror,
                houseVid: vidIndex
        };
        houseList.push(houseObject);

       // assets.visible = false;

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
        for (var i = 0; i < houseList.length; i++) {
                if (collisionObj.position.distanceTo(houseList[i].house.position) < 100) {
                        //check house walls for collision
                        var collisions = ray.intersectObjects(houseList[i].houseCollisionList);
                        if (collisions.length > 0 && collisions[0].distance < rayDirection.length()) {
                                collision = true;
                                break;
                        }

                        //check assets for collision
                        collisions = ray.intersectObjects(houseList[i].assetCollisionList);
                        if (collisions.length > 0 && collisions[0].distance < rayDirection.length()) {
                                collision = true;
                                break;
                        }
                }
        }
        return collision;
}
