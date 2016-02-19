/*
    Graphics Assignment 2
    Group Members: Justin, Tyler, Will, Michael, Guy
*/

var camera, scene, renderer, controls, stats;
var clock = new THREE.Clock();

var spotLight;
var molecule;

var lightingTypes = {
        Ambient: function() { updateLighting('ambient'); },
        Directional: function() { updateLighting('directional'); },
        Point: function() { updateLighting('point'); },
        Hemisphere: function() { updateLighting('hemisphere'); },
        Spot: function() { updateLighting('spot'); }
};

//TODO move guy's browse for a file into the gui menu.
//TODO Add the ability to change lighting styles.
//TODO Add the ability to select from preset xyz files in the menu.

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
        container = document.getElementById('myCanvas');
        document.body.appendChild(container);

        var gui = new dat.GUI({ autoPlace: false });

        var guiF2 = gui.addFolder('Lighting Types');
        guiF2.add(lightingTypes, 'Ambient' );
        guiF2.add(lightingTypes, 'Directional' );
        guiF2.add(lightingTypes, 'Point' );
        guiF2.add(lightingTypes, 'Hemisphere' );
        guiF2.add(lightingTypes, 'Spot' );


        gui.domElement.style.position = "absolute";
        gui.domElement.style.top = '100px';
        gui.domElement.style.right = '0px';
	container.appendChild(gui.domElement);

        //webGL renderer size 600x450
        renderer = new THREE.WebGLRenderer({
                antialias: false
        });
        renderer.setPixelRatio(($(container).width() - 100) / 450);
        renderer.setSize($(container).width() - 100, 450);
        renderer.shadowMap.enabled = true;
        container.appendChild(renderer.domElement);

        //New perspective camera, positioned to face the trees and such.
        camera = new THREE.PerspectiveCamera(60, ($(container).width() - 100) / 450, 0.1, 15000);
        camera.position.z = 15;
        camera.position.y = 0;

        // Mouse control
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 0, 0);
        controls.update();

        scene = new THREE.Scene();


        //Add a spotlight for shadows - white light with intesity of 1
        spotLight = new THREE.SpotLight(0xffffff, 1);
        spotLight.name = 'Spot Light';
        spotLight.position.set(5000, 5000, 0);
        spotLight.castShadow = true;
        spotLight.shadowCameraNear = true;
        spotLight.intensity = 1;
        spotLight.shadowCameraFar = 100000;
        scene.add(spotLight);

        var light = new THREE.AmbientLight(0x303030); // soft white light
        scene.add(light);


                        //





        //read the file that the user specified
        var fileInput = document.getElementById("fileInput");
        fileInput.addEventListener('change', function(e) {
                var file = fileInput.files[0];
                var fileReader = new FileReader();
                var xyz;

                fileReader.onload = function(e) {
                        if (molecule != null) {
                                scene.remove(molecule);
                                molecule = null;
                        }

                        xyz = fileReader.result;
                        createMolecule(xyz)
                }

                fileReader.readAsText(file);
        });
}


//updates every frame used for animation and input handling
function update() {
        if (molecule != null) {
                molecule.rotateY(0.01);
        }

        //render the scene
        renderer.render(scene, camera);
}

function animate() {

        requestAnimationFrame(animate);
        stats.update();
        update();
}

function createMolecule(xyz) {
        //split the xyz file by new lines
        var data = xyz.split('\n');

        //number of atoms is the fist line
        var atomCount = data[0];

        //parent of the other spheres
        molecule = new THREE.Object3D();

        //make all of the atoms
        for (var i = 0; i < atomCount; i++) {
                var atomColor;
                var geo = new THREE.SphereGeometry(1, 32, 32);

                //single atoms start at index 2
                var atom = data[2 + i].split(/(\s+)/);

                var element = atom[0];

                switch (element) {
                        case "H":
                                atomColor = new THREE.Color(0xffffff);
                                break;
                        case "O":
                                atomColor = new THREE.Color(0xff0000);
                                break;
                        case "Cl":
                                atomColor = new THREE.Color(0x008000);
                                break;
                        case "N":
                                atomColor = new THREE.Color(0x0000ff);
                                break;
                        case "C":
                                atomColor = new THREE.Color(0x808080);
                                break;
                        case "S":
                                atomColor = new THREE.Color(0xffff00);
                                break;
                        case "P":
                                atomColor = new THREE.Color(0xffffff);
                                break;
                        default:
                                atomColor = new THREE.Color(0xffa500);
                                break;
                }


                var mat = new THREE.MeshBasicMaterial({
                        color: atomColor
                });

                var sphere = new THREE.Mesh(geo, mat);
                sphere.position.x = atom[2];
                sphere.position.y = atom[4];
                sphere.position.z = atom[6];

                molecule.add(sphere);
        }

        scene.add(molecule);
}
