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
        renderer.setClearColor(0x505050 , 0.5);
        renderer.setPixelRatio(550 / 450);
        renderer.setSize(550, 450);
        container.appendChild(renderer.domElement);

        //New perspective camera, positioned to face the trees and such.
        camera = new THREE.PerspectiveCamera(90, 550/450, 0.1, 10000);
        //camera.position.z = 5;
        camera.position.y = 50;
        camera.lookAt(new THREE.Vector3(0,0,0));

        var orbit = new THREE.OrbitControls( camera, renderer.domElement );
			//orbit.enableZoom = false;

        scene = new THREE.Scene();

        //light 2: ambient light
        ambientLight = new THREE.AmbientLight(0xFFFFFF);
        ambientLight.position.set(0, 0, 15);
        ambientLight.castShadow = true;
        //scene.add(ambientLight);

        hemisphereLight = new THREE.HemisphereLight(0xFFFFFF, 0xC1C1D1, 0.25);
        hemisphereLight.castShadow = true;
        hemisphereLight.position.set(0, 15, 0);
        scene.add(hemisphereLight);

        var objectLoader = new THREE.ObjectLoader();
	objectLoader.load("models/feels.json", function ( obj ) {
	 	//scene.add( obj );
	} );



        //Grid
        var size = 500, step = 10;
        var geometry = new THREE.Geometry();
        for ( var i = - size; i <= size; i += step ) {
        	geometry.vertices.push( new THREE.Vector3( - size, 0, i ) );
        	geometry.vertices.push( new THREE.Vector3(   size, 0, i ) );
        	geometry.vertices.push( new THREE.Vector3( i, 0, - size ) );
        	geometry.vertices.push( new THREE.Vector3( i, 0,   size ) );
        }
        var material = new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.5 } );
        var line = new THREE.LineSegments( geometry, material );
        scene.add( line );

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

        drawWall(0,0,0);
        drawWall(10,0,0);
        drawWall(0,10,0);
        drawWall(10,10,270);





}
function toRads(degrees) { return degrees * (3.14/180) }

//Just give it the X point in the grid to start at
function drawWall(x,z, rY) {

        var geometry = new THREE.BoxGeometry( 10, 10, 1 );
        geometry.translate(5,5,0); //Adjust origin point
        var material = new THREE.MeshPhongMaterial( {color: 0xFFFFFF, emissive: 0x072534,
					side: THREE.DoubleSide,
					shading: THREE.SmoothShading} );
        var cube = new THREE.Mesh( geometry, material );

        cube.position.x = x;
        cube.position.z = z;
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
