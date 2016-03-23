/*
    Graphics Assignment 3
    Group Members: Justin, Tyler, Will, Michael, Guy
*/

var camera, scene, renderer, controls, stats, collisionObj, frontNode, backNode;
var clock = new THREE.Clock();
var collisionForward = false, collisionBack = false;
var collisionList = [];

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

        //New perspective camera, positioned to face the trees and such.
        camera = new THREE.PerspectiveCamera(50, 550 / 450, 0.1, 1000);

        scene = new THREE.Scene();

        //light 2: ambient light
        ambientLight = new THREE.AmbientLight(0x404040);
        ambientLight.position.set(0, 0, 15);
        ambientLight.castShadow = true;
        scene.add(ambientLight);

        var directionalLight = new THREE.DirectionalLight(0xffffff, 0.75);
        directionalLight.position.set(0, 1, 0);
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
        collisionObj.position.z = -5;

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

//        var cells = generateArrays(5);
//        primsMaze(cells);      
//        drawMaze(cells);

        //ENTIRE HOUSE - 70 wide by 70 long by 20 high
        var house = new THREE.Object3D();

        //OUTER WALLS
        var walls = new THREE.Object3D();

        //FRONT WALL
        var frontWall = new THREE.Object3D();
        var frontWall_L = new THREE.Object3D();
        var frontWall_R = new THREE.Object3D();

        var geometry = new THREE.BoxGeometry(10, 10, 1);
        geometry.translate(5, 5, 0); //Adjust origin point to the bottom left.
        var material = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            emissive: 0x072534,
            side: THREE.DoubleSide,
            shading: THREE.SmoothShading
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

        var doorMat = new THREE.MeshPhongMaterial({
            color: 0xff0000,
            emissive: 0x072534,
            side: THREE.DoubleSide,
            shading: THREE.SmoothShading
        });

        var door = fullSlab.clone();
        door.material = doorMat;
        door.position.x = 30;

        var door_Top = door.clone();
        door_Top.material = material;

    
        var frontWall_Top = frontWall.clone();
        frontWall_Top.rotation.x = Math.PI;
        frontWall_Top.position.y = 20;

        frontWall_Top.add(door_Top);
        frontWall.add(door);
        
        //walls without windows
        var sideWallGeo = new THREE.BoxGeometry(70, 20, 1);
        sideWallGeo.translate(35, 10, 0);
        var sideMat = new THREE.MeshPhongMaterial({
            color: 0x00ff00,
            emissive: 0x072534,
            side: THREE.DoubleSide,
            shading: THREE.SmoothShading
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

        //celing and floor
        var floorGeo = new THREE.BoxGeometry(70, 0.1, 70);
        floorGeo.translate(35, 0.05, 35);
        var floorMat = new THREE.MeshPhongMaterial({
            color: 0x0000ff,
            emissive: 0x072534,
            side: THREE.DoubleSide,
            shading: THREE.SmoothShading
        });
        var floor = new THREE.Mesh(floorGeo, floorMat);
        floor.translateZ(-70);
        var celing = floor.clone();
        celing.translateY(20);


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
        
        house.add(roof)
        house.add(floor);
        house.add(celing);
        house.add(walls);

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

//Function that will actually draw the maze, will only draw the wall if it has information for the wall.
function drawMaze(cells) {

        for (var i = 0; i < cells.length; i++) {
                for (var j = 0; j < cells[i].length; j++) {

                        if (cells[i][j].leftWall != null)
                                drawWall(cells[i][j].leftWall[0], cells[i][j].leftWall[1], cells[i][j].leftWall[2], cells[i][j].leftColor);
                        if (cells[i][j].rightWall != null)
                                drawWall(cells[i][j].rightWall[0], cells[i][j].rightWall[1], cells[i][j].rightWall[2], cells[i][j].rightColor);
                        if (cells[i][j].topWall != null)
                                drawWall(cells[i][j].topWall[0], cells[i][j].topWall[1], cells[i][j].topWall[2], cells[i][j].topColor);
                        if (cells[i][j].bottomWall != null)
                                drawWall(cells[i][j].bottomWall[0], cells[i][j].bottomWall[1], cells[i][j].bottomWall[2], cells[i][j].bottomColor);
                }
        }
}

//Makes the code a bit more readable, will add a cell to the frontier and mark it as visited.
function pushFrontier(cells, frontier, direction, i, j) {

        if (direction == "right")
                j += 1;

        else if (direction == "left")
                j -= 1;

        else if (direction == "up")
                i -= 1;

        else if (direction == "down")
                i += 1;

        if (cells[i][j].visited != true) {
                cells[i][j].visited = true;
                frontier.push(cells[i][j]);
        }
}

//Main decision making function, will push cells to the frontier depending on its location in the maze.
function addNeighbours(cells, frontier, i, j) {

        if (i == 0) { //Top Row

                if (j == 0) { //Top Left
                        pushFrontier(cells, frontier, "right", i, j);
                } else if (j == cells.length - 1) { //Top Right
                        pushFrontier(cells, frontier, "left", i, j);
                } else { //Middle
                        pushFrontier(cells, frontier, "right", i, j);
                        pushFrontier(cells, frontier, "left", i, j);
                }
                pushFrontier(cells, frontier, "down", i, j);
        } else if (i == cells.length - 1) { //Bottom Row

                if (j == 0) { //Bottom Left
                        pushFrontier(cells, frontier, "right", i, j);
                } else if (j == cells.length - 1) { //Bottom Right
                        pushFrontier(cells, frontier, "left", i, j);
                } else { //Middle
                        pushFrontier(cells, frontier, "right", i, j);
                        pushFrontier(cells, frontier, "left", i, j);
                }
                pushFrontier(cells, frontier, "up", i, j);
        } else if (j == 0) { //Left Column

                //Top Left already taken care of.
                //Bottom Left already taken care of.
                pushFrontier(cells, frontier, "up", i, j);
                pushFrontier(cells, frontier, "down", i, j);
                pushFrontier(cells, frontier, "right", i, j);
        } else if (j == cells.length - 1) { //Right Column

                //Top right already taken care of.
                //Bottom right already taken care of.
                pushFrontier(cells, frontier, "up", i, j);
                pushFrontier(cells, frontier, "down", i, j);
                pushFrontier(cells, frontier, "left", i, j);
        } else { //Its somewhere NORMAL

                pushFrontier(cells, frontier, "up", i, j); //up
                pushFrontier(cells, frontier, "down", i, j); //DOWN
                pushFrontier(cells, frontier, "left", i, j); //left
                pushFrontier(cells, frontier, "right", i, j); //right
        }
}

//Function to remove a wall between two cells, you pass it the selected frontier cells' indexes.
function removeWall(cells, i, j) {

        var adjacentCells = [];

        //Determine the possible adjacent cells we can select
        if (i != 0 && cells[i - 1][j].inMaze == true) //Up
                adjacentCells.push({
                cell: cells[i - 1][j],
                direction: "up"
        });
        if (i != cells.length - 1 && cells[i + 1][j].inMaze == true) //Down
                adjacentCells.push({
                cell: cells[i + 1][j],
                direction: "down"
        });
        if (j != 0 && cells[i][j - 1].inMaze == true) //Left
                adjacentCells.push({
                cell: cells[i][j - 1],
                direction: "left"
        });
        if (j != cells.length - 1 && cells[i][j + 1].inMaze == true) //Right
                adjacentCells.push({
                cell: cells[i][j + 1],
                direction: "right"
        });

        //Select a random adjacent cell.
        var selectedCell = adjacentCells[randomInt(0, adjacentCells.length - 1)];

        //Determine its directions so we can delete the respective walls.
        if (selectedCell.direction == "up") {
                cells[i][j].topWall = null;
                selectedCell.cell.bottomWall = null;
        } else if (selectedCell.direction == "down") {
                cells[i][j].bottomWall = null;
                selectedCell.cell.topWall = null;
        } else if (selectedCell.direction == "left") {
                cells[i][j].leftWall = null;
                selectedCell.cell.rightWall = null;
        } else if (selectedCell.direction == "right") {
                cells[i][j].rightWall = null;
                selectedCell.cell.leftWall = null;
        }
}

//Main algorithm function, uses a randomized prims algorithm to draw a maze.
function primsMaze(cells) {

        var frontier = [];

        //First we have to select a random cell in the maze to start with.
        var i = randomInt(0, cells.length - 1);
        var j = randomInt(0, cells.length - 1);

        //That cell is now in the maze, and is visited.
        cells[i][j].inMaze = true;
        cells[i][j].visited = true;

        //Add it's neighbours to the frontier
        addNeighbours(cells, frontier, i, j);

        while (frontier.length != 0) { //If we have cells to choose in the frontier.

                //Pick a random frontier cell
                var randomNeighbour = randomInt(0, frontier.length - 1);

                //And find it's x and y values.
                var cellX = frontier[randomNeighbour].xIndex;
                var cellY = frontier[randomNeighbour].yIndex;

                //The frontier cell is now in the maze, we now clear a path.
                cells[cellX][cellY].inMaze = true;
                removeWall(cells, cellX, cellY);

                //Add all the neighbours from the frontier cell to the frontier.
                addNeighbours(cells, frontier, cellX, cellY);

                frontier.splice(randomNeighbour, 1); // Remove it from the frontier
        }

        //Remove an entrance and an exit.
        var entranceX = randomInt(0, cells.length - 1);
        var exitX = randomInt(0, cells.length - 1);

        cells[entranceX][0].leftWall = null;
        cells[exitX][cells.length - 1].rightWall = null;
}

//Simple function to initialize the array of cells.
function generateArrays(size) {

        //Make a 2D Array
        cells = new Array(size);
        for (i = 0; i < size; i++)
                cells[i] = new Array(size);

        //Initialize each cell with an object holding coordinates for the walls, its index, and flags.
        for (i = 0; i < cells.length; i++) {

                for (j = 0; j < cells[i].length; j++) {

                        cells[i][j] = {

                                leftWall: [i, j, 270],
                                rightWall: [i, j + 1, 270],
                                topWall: [i, j, 0],
                                bottomWall: [i + 1, j, 0],
                                xIndex: i,
                                yIndex: j,
                                visited: false,
                                inMaze: false,
                                leftColor: 0xFF0000,
                                rightColor: 0x00FF00,
                                topColor: 0x0000FF,
                                bottomColor: 0xF0F0F0
                        };
                }
        }

        return cells;
}

//Will draw a wall given coordinates and a rotation value.
function drawWall(z, x, rY, clr) {

        var geometry = new THREE.BoxGeometry(10, 10, 1);
        geometry.translate(5, 5, 0); //Adjust origin point to the bottom left.
        var material = new THREE.MeshPhongMaterial({
                color: clr,
                emissive: 0x072534,
                side: THREE.DoubleSide,
                shading: THREE.SmoothShading
        });
        var cube = new THREE.Mesh(geometry, material);

        //Bring the cube above the ground, and move it depending on the coordinates.
        cube.position.x = x * 10;
        cube.position.z = z * 10;
        cube.rotateY(toRads(rY)); //Rotate it.
        scene.add(cube);

        //add the cube to the list of walls needed for collision
        wallList.push(cube);
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
