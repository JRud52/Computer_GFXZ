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

        //drawWall(0, 0, 0);
        //drawWall(1, 0, 0);
        //drawWall(0, 1, 0);
        //drawWall(1, 1, 270);

        /*
        var degrees = [0, 90, 180, 270];
        for(i = 0; i < 10; i++) {

                for(j = 0; j < 10; j++) {

                        if(randomInt(0,1) == 1) {

                                drawWall(i, j, degrees[randomInt(0,3)]);
                        }
                }
        }*/

        var maze;
        var frontier;

        var cells = generateArrays(10);

        for(i = 0; i < cells.length; i++) {
                for(j = 0; j < cells[i].length; j++) {

                        drawWall(cells[i][j].leftWall[0],cells[i][j].leftWall[1],cells[i][j].leftWall[2]);
                        drawWall(cells[i][j].rightWall[0],cells[i][j].rightWall[1],cells[i][j].rightWall[2]);
                        drawWall(cells[i][j].topWall[0],cells[i][j].topWall[1],cells[i][j].topWall[2]);
                        drawWall(cells[i][j].bottomWall[0],cells[i][j].bottomWall[1],cells[i][j].bottomWall[2]);
                }
        }
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function toRads(degrees) {
        return degrees * (3.14 / 180)
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
                                rightWall: [i+1,j,270],
                                topWall: [i,j,0],
                                bottomWall: [i,j+1,0]
                        };
                }
        }

        return cells;
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

        scene.add(cube);
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
