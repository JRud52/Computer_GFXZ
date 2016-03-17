/*
    Graphics Assignment 3
    Group Members: Justin, Tyler, Will, Michael, Guy
*/

var camera, scene, renderer, controls, stats;
var clock = new THREE.Clock();



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
        //camera.position.z = 5;
        camera.position.y = 100;
        camera.lookAt(new THREE.Vector3(0, 0, 0));

        var orbit = new THREE.OrbitControls(camera, renderer.domElement);
        //orbit.enableZoom = false;

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

        var cells = generateArrays(5);
        primsMaze(cells);



        /**
                ___ ___
                |__    |
                |______|
                TEST

        cells = new Array(2);

        for(i = 0; i < 2; i++)
                cells[i] = new Array(2);
        cells[0][0] = {

                leftWall: [0,0,270],
                rightWall: null,
                topWall: [0,0,0],
                bottomWall: [0+1,0,0],
                xIndex: 0,
                yIndex: 0,
                visited: false,
                inMaze: false,
                leftColor: 0xFF0000,
                rightColor: 0x00FF00,
                topColor: 0x0000FF,
                bottomColor: 0xF0F0F0
        };
        cells[0][1] = {

                leftWall: null,
                rightWall: [0,1+1,270],
                topWall: [0,1,0],
                bottomWall: null,
                xIndex: 0,
                yIndex: 1,
                visited: false,
                inMaze: false,
                leftColor: 0xFF0000,
                rightColor: 0x00FF00,
                topColor: 0x0000FF,
                bottomColor: 0xF0F0F0
        };
        cells[1][0] = {

                leftWall: [1,0,270],
                rightWall: null,
                topWall: [1,0,0],
                bottomWall: [1+1,0,0],
                xIndex: 1,
                yIndex: 0,
                visited: false,
                inMaze: false,
                leftColor: 0xFF0000,
                rightColor: 0x00FF00,
                topColor: 0x0000FF,
                bottomColor: 0xF0F0F0
        };
        cells[1][1] = {

                leftWall: null,
                rightWall: [1,1+1,270],
                topWall: null,
                bottomWall: [1+1,1,0],
                xIndex: 1,
                yIndex: 1,
                visited: false,
                inMaze: false,
                leftColor: 0xFF0000,
                rightColor: 0x00FF00,
                topColor: 0x0000FF,
                bottomColor: 0xF0F0F0
        };
        */
        drawMaze(cells);
        //drawWall(1,1,0); //Test individual wall drawing
}

function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
}

function toRads(degrees) {
        return degrees * (3.14 / 180)
}

function pushFrontier(cells, frontier, direction, i, j) {

        if(direction == "right")
                j += 1;

        else if(direction == "left")
                j -= 1;

        else if(direction == "up")
                i -= 1;

        else if(direction == "down")
                i += 1;

        if(cells[i][j].visited != true) {
                cells[i][j].visited = true;
                frontier.push(cells[i][j]);
        }
}

function drawMaze(cells) {

        for(var i = 0; i < cells.length; i++) {
                for(var j = 0; j < cells[i].length; j++) {

                        if(cells[i][j].leftWall != null)
                                drawWall(cells[i][j].leftWall[0],cells[i][j].leftWall[1],cells[i][j].leftWall[2], cells[i][j].leftColor);
                        if(cells[i][j].rightWall != null)
                                drawWall(cells[i][j].rightWall[0],cells[i][j].rightWall[1],cells[i][j].rightWall[2], cells[i][j].rightColor);
                        if(cells[i][j].topWall != null)
                                drawWall(cells[i][j].topWall[0],cells[i][j].topWall[1],cells[i][j].topWall[2], cells[i][j].topColor);
                        if(cells[i][j].bottomWall != null)
                                drawWall(cells[i][j].bottomWall[0],cells[i][j].bottomWall[1],cells[i][j].bottomWall[2], cells[i][j].bottomColor);
                }
        }
}

function addNeighbours(cells, frontier, i, j) {

        if(i == 0) { //Top Row

                if(j == 0) { //Top Left
                        pushFrontier(cells, frontier, "right", i, j);
                }
                else if(j == cells.length-1) { //Top Right
                        pushFrontier(cells, frontier, "left", i, j);
                }
                else { //Middle
                        pushFrontier(cells, frontier, "right", i, j);
                        pushFrontier(cells, frontier, "left", i, j);
                }
                pushFrontier(cells, frontier, "down", i, j);
        }
        else if(i == cells.length-1) { //Bottom Row

                if(j == 0) { //Bottom Left
                        pushFrontier(cells, frontier, "right", i, j);
                }
                else if(j == cells.length-1) { //Bottom Right
                        pushFrontier(cells, frontier, "left", i, j);
                }
                else { //Middle
                        pushFrontier(cells, frontier, "right", i, j);
                        pushFrontier(cells, frontier, "left", i, j);
                }
                pushFrontier(cells, frontier, "up", i, j);
        }
        else if(j == 0) { //Left Column

                //Top Left already taken care of.
                //Bottom Left already taken care of.
                pushFrontier(cells, frontier, "up", i, j);
                pushFrontier(cells, frontier, "down", i, j);
                pushFrontier(cells, frontier, "right", i, j);
        }
        else if(j == cells.length-1) { //Right Column

                //Top right already taken care of.
                //Bottom right already taken care of.
                pushFrontier(cells, frontier, "up", i, j);
                pushFrontier(cells, frontier, "down", i, j);
                pushFrontier(cells, frontier, "left", i, j);
        }
        else { //Its somewhere NORMAL

                pushFrontier(cells, frontier, "up", i, j); //up
                pushFrontier(cells, frontier, "down", i, j); //DOWN
                pushFrontier(cells, frontier, "left", i, j); //left
                pushFrontier(cells, frontier, "right", i, j); //right
        }
}

function removeWall(cells, i, j) {

        var adjacentCells = [];

        if(i != 0 && cells[i-1][j].inMaze == true) //Up
                adjacentCells.push({ cell: cells[i-1][j], direction: "up" });
        if(i != cells.length-1 && cells[i+1][j].inMaze == true) //Down
                adjacentCells.push({ cell: cells[i+1][j], direction: "down" });
        if(j != 0 && cells[i][j-1].inMaze == true) //Left
                adjacentCells.push({ cell: cells[i][j-1], direction: "left" });
        if(j != cells.length-1 && cells[i][j+1].inMaze == true) //Right
                adjacentCells.push({ cell: cells[i][j+1], direction: "right" });

        var selectedCell = adjacentCells[randomInt(0, adjacentCells.length-1)];

        if(selectedCell.direction == "up") {
                cells[i][j].topWall = null;
                selectedCell.cell.bottomWall = null;
        }
        else if(selectedCell.direction == "down") {
                cells[i][j].bottomWall = null;
                selectedCell.cell.topWall = null;
        }
        else if(selectedCell.direction == "left") {
                cells[i][j].leftWall = null;
                selectedCell.cell.rightWall = null;
        }
        else if(selectedCell.direction == "right") {
                cells[i][j].rightWall = null;
                selectedCell.cell.leftWall = null;
        }
}

function primsMaze(cells) {

        var frontier = [];

        var i = randomInt(0, cells.length-1);
        var j = randomInt(0, cells.length-1);

        cells[i][j].inMaze = true;
        cells[i][j].visited = true;

        addNeighbours(cells, frontier, i, j);

        while(frontier.length != 0) {

                var randomNeighbour = randomInt(0, frontier.length-1);

                var cellX = frontier[randomNeighbour].xIndex;
                var cellY = frontier[randomNeighbour].yIndex;

                cells[cellX][cellY].inMaze = true;
                removeWall(cells, cellX, cellY);

                addNeighbours(cells, frontier, cellX, cellY);

                frontier.splice(randomNeighbour,1); // Remove it from the frontier
        }

        //Remove an entrance and an exit.

        var entranceX = randomInt(0, cells.length-1);
        var exitX = randomInt(0, cells.length-1);

        cells[entranceX][0].leftWall = null;
        cells[exitX][cells.length-1].rightWall = null;
}

function generateArrays(size) {

        cells = new Array(size);

        for(i = 0; i < size; i++) {

                cells[i] = new Array(size);
        }

        for(i = 0; i < cells.length; i++) {

                for(j = 0; j < cells[i].length; j++) {

                        cells[i][j] = {

                                leftWall: [i,j,270],
                                rightWall: [i,j+1,270],
                                topWall: [i,j,0],
                                bottomWall: [i+1,j,0],
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

//Just give it the X and Z point in the grid to start at
function drawWall(z, x, rY, clr) {

        var geometry = new THREE.BoxGeometry(10, 10, 1);
        geometry.translate(5, 5, 0); //Adjust origin point
        var material = new THREE.MeshPhongMaterial({
                color: clr,
                emissive: 0x072534,
                side: THREE.DoubleSide,
                shading: THREE.SmoothShading
        });
        var cube = new THREE.Mesh(geometry, material);

        cube.position.x = x * 10;
        cube.position.z = z * 10;
        cube.rotateY(toRads(rY));

        scene.add(cube);
        animate();
}


//updates every frame used for animation and input handling
function render() {

        //render the scene
        renderer.render(scene, camera);
}

function animate() {

        requestAnimationFrame(animate);
        render();
}
