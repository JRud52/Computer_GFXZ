/*
    Graphics Assignment 3
    Group Members: Justin, Tyler, Will, Michael, Guy
*/

var camera, scene, renderer, controls, stats;
var clock = new THREE.Clock();

//This works on server side only!
//All of the included XYZ molecule files.
var xyzFiles = {
        Aluminum: function() {
                readMolecule('./molecules/aluminumarsenate.xyz');
        }
};

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
        camera = new THREE.PerspectiveCamera(60, 550/450, 0.1, 10000);
        camera.position.z = 15;
        camera.position.y = 0;

        scene = new THREE.Scene();

        //light 2: ambient light
        ambientLight = new THREE.AmbientLight(0xFFFFFF);
        ambientLight.position.set(0, 0, 15);
        ambientLight.castShadow = true;
        scene.add(ambientLight);
}

//read the XYZ file
function readMolecule(xyzURL) {
        $.ajax({
                type: 'POST',
                url: xyzURL,
                async: true,
                datatype: 'text',
                success: function(xyz) {
                        if (molecule != null) {
                                scene.remove(molecule);
                                molecule = new THREE.Object3D();
                        }
                        createMolecule(xyz);
                }
        });
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
