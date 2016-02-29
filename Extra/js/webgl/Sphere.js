/*
    Graphics Assignment 2
    Group Members: Justin, Tyler, Will, Michael, Guy
*/

var camera, scene, renderer, controls, stats;
var mapGeo;
var particleSystem;
var particleCount;
var particles;
var clock = new THREE.Clock();

var spotLight;

//texture loader
var loader = new THREE.TextureLoader();;

//Audio files
var music = new Audio('music/plains.ogg');

/*
    ONLOAD FUNCTION
*/
function main() {
        init();
        animate();
}


//initial setup
function init() {

        //some nice tunes
        music.play();

        //Set to our custom canvas
        container = document.getElementById('myCanvas');
        document.body.appendChild(container);

        //Performance Stats
        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.right= '44px';
        container.appendChild(stats.domElement);

        //webGL renderer size 600x450
        renderer = new THREE.WebGLRenderer({
                antialias: false
        });
        renderer.setPixelRatio(($(container).width()-100) / 450);
        renderer.setSize($(container).width()-100,450);
        renderer.shadowMap.enabled = true;
        container.appendChild(renderer.domElement);

        //New perspective camera, positioned to face the trees and such.
        camera = new THREE.PerspectiveCamera(60, ($(container).width()-100) / 450, 0.1, 15000);
        camera.position.z = 2500;
        camera.position.y = 2000;

        // Mouse control
	    controls = new THREE.OrbitControls( camera, renderer.domElement );
	    controls.target.set( 0, 0, 0 );
	    controls.update();

        scene = new THREE.Scene();

        //Making some grass
        var groundTexture = loader.load("textures/grasslight-big.jpg");
        groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
        groundTexture.repeat.set(25, 25);
        groundTexture.anisotropy = 25;
        //Grass's material
        var groundMaterial = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                specular: 0x111111,
                map: groundTexture
        });
        //Grass's Mesh
        var mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(20000, 20000), groundMaterial);
        mesh.position.y = 0;
        mesh.rotation.x = -Math.PI / 2;
        mesh.receiveShadow = true;
        scene.add(mesh);

        var light = new THREE.AmbientLight( 0x303030 ); // soft white light
        scene.add(light);

        var light2 = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
        light2.intensity = 1;
scene.add( light2);

        makeASphere(200, 32, 32, 500, 0, 0);
        makeASphere(200, 16, 16, 500, -1000, 0);
        makeASphere(200, 8, 8, 500, -2500, 0);
        makeASphere(200, 4, 4, 500, -4000, 0);


}

function makeASphere(size, segments, positionX, positionY, positionZ) {

        var geometry = new THREE.SphereGeometry( size,segments, segments );
        var material = new THREE.MeshBasicMaterial( {color: 0xffff00, wireframe: true} );
        var sphere = new THREE.Mesh( geometry, material );
        sphere.position.x = positionX;
        sphere.position.y = positionY;
        sphere.position.z = positionZ;
        scene.add( sphere );
}


var state1, state2, state3, state4;
//updates every frame used for animation and input handling
function update() {


        //render the scene
        renderer.render(scene, camera);
}

function animate() {

        requestAnimationFrame(animate);
        stats.update();
        update();
}
