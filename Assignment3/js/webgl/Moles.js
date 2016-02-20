/*
    Graphics Assignment 2
    Group Members: Justin, Tyler, Will, Michael, Guy
*/

var camera, scene, renderer, controls, stats;
var clock = new THREE.Clock();

var ambientLight = new THREE.AmbientLight();
var directionalLight = new THREE.DirectionalLight();
var hemisphereLight = new THREE.HemisphereLight();
var pointLight = new THREE.PointLight();
var spotLight = new THREE.SpotLight();

var molecule = new THREE.Object3D();


//visible

//This works on server side only!
var xyzFiles = {
        Anatoxin: function() {
                readMolecule('./molecules/anatoxin-a.xyz');
        },
        Heroin: function() {
                readMolecule('./molecules/heroin.xyz');
        },
        Lactose: function() {
                readMolecule('./molecules/lactose.xyz');
        },
        Methamphetamine: function() {
                readMolecule('./molecules/methamphetamine.xyz');
        },
        Tetrasilete: function() {
                readMolecule('./molecules/tetrasilete.xyz');
        },
        Caffeine: function() {
                readMolecule('./molecules/caffeine.xyz');
        },
        loadFile: function() {
                $('#myInput').click();
        }
};

var lighting = {
        Ambient: function() {
                ambientLight.visible = !ambientLight.visible;
        },
        Directional: function() {
                directionalLight.visible = !directionalLight.visible;
        },
        Point: function() {
                pointLight.visible = !pointLight.visible;
        },
        Hemisphere: function() {
                hemisphereLight.visible = !hemisphereLight.visible;
        },
        Spot: function() {
                spotLight.visible = !spotLight.visible;
        }
};

var options = {

        size: 1,
        lightColor: "#ffffff",
        secLightColor: "#ffffff",
        intensity: 1
};

//TODO Differentiate size of atoms based on atomic value.
//TODO Change lighting menu style to boolean type.
//TODO add rotation speed, toggle off rotation
//TODO Add atom count maybe somewhere.
//TODO Add more xyz molecules
//TODO Allow changing of lighting distance, and intensity.

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
        document.body.appendChild(container);

        renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: true
        });
        renderer.setClearColor(0x808080 , 0.5);
        renderer.setPixelRatio(550 / 450);
        renderer.setSize(550, 450);
        container.appendChild(renderer.domElement);

        //New perspective camera, positioned to face the trees and such.
        camera = new THREE.PerspectiveCamera(60, 550/450, 0.1, 10000);
        camera.position.z = 15;
        camera.position.y = 0;

        // Mouse control
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 0, 0);
        controls.update();

        scene = new THREE.Scene();

        var gui = new dat.GUI({
                autoPlace: false,
                width: 325
        });

        var guiF1 = gui.addFolder('Molecules', "a");
        guiF1.add(xyzFiles, 'Anatoxin').name('Anatoxin-a');
        guiF1.add(xyzFiles, 'Heroin');
        guiF1.add(xyzFiles, 'Lactose');
        guiF1.add(xyzFiles, 'Methamphetamine');
        guiF1.add(xyzFiles, 'Tetrasilete');
        guiF1.add(xyzFiles, 'Caffeine');
        gui.add(xyzFiles, 'loadFile').name('Upload XYZ');

        var guiF2 = gui.addFolder('Lighting Types');
        guiF2.add(lighting, 'Ambient');
        guiF2.add(lighting, 'Directional');
        guiF2.add(lighting, 'Point');
        guiF2.add(lighting, 'Hemisphere');
        guiF2.add(lighting, 'Spot');

        var guiF3 = gui.addFolder('Render Options');
        guiF3.add(options, 'size', 0, 2);
        guiF3.addColor(options, 'lightColor');
        guiF3.addColor(options, 'secLightColor');
        guiF3.add(options, 'intensity', 0, 10);

        gui.domElement.style.position = "absolute";
        gui.domElement.style.top = '290px';
        gui.domElement.style.right = '300px';
        document.body.appendChild(gui.domElement);
        guiF2.open();
        guiF3.open();

        spotLight = new THREE.SpotLight(0xffffff, 1);
        spotLight.position.set(0, 0, 15);
        spotLight.castShadow = true;
        scene.add(spotLight);

        ambientLight = new THREE.AmbientLight(0xFFFFFF);
        ambientLight.position.set(0,0,15);
        ambientLight.castShadow = true;
        scene.add(ambientLight);

        directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
        directionalLight.position.set(0,0,15);
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        hemisphereLight = new THREE.HemisphereLight(0xFFFFFF, 0xC1C1D1, 1);
        hemisphereLight.castShadow = true;
        scene.add(hemisphereLight);

        pointLight = new THREE.PointLight(0xFFFFFF, 5, 100, 10);
        pointLight.position.set(0,0,15);
        pointLight.castShadow = true;
        scene.add(pointLight);


        var fileInput = document.getElementById('myInput');
        fileInput.addEventListener('change', function(e) {
                var file = fileInput.files[0];
                var fileReader = new FileReader();
                var xyz;

                fileReader.onload = function(e) {
                        if (molecule != null) {
                                scene.remove(molecule);
                                molecule = new THREE.Object3D();
                        }

                        xyz = fileReader.result;
                        createMolecule(xyz);
                }

                fileReader.readAsText(file);
        });

}

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

function updateLighting(primaryColor, secondaryColor, intensity) {

        ambientLight.color.setHex(primaryColor);
        directionalLight.color.setHex(primaryColor);
        pointLight.color.setHex(primaryColor);
        spotLight.color.setHex(primaryColor);
        hemisphereLight.color.setHex(primaryColor);
        hemisphereLight.groundColor.setHex(secondaryColor);

        directionalLight.intensity = intensity;
        pointLight.intensity = intensity;
        spotLight.intensity = intensity;
        hemisphereLight.intensity = intensity;
}

//updates every frame used for animation and input handling
function render() {

        //render the scene
        renderer.render(scene, camera);
}

function animate() {

        var atoms = molecule.children;
        for(i = 0; i < atoms.length; i++) {

                atoms[i].scale.x = options.size;
                atoms[i].scale.y = options.size;
                atoms[i].scale.z = options.size;
        }

        var primaryColor = parseInt(options.lightColor.replace(/^#/, ''), 16);
        var secondaryColor = parseInt(options.secLightColor.replace(/^#/, ''), 16);
        var intensity = options.intensity;
        updateLighting(primaryColor, secondaryColor, intensity);

        if (molecule != null) {
                molecule.rotateY(0.01);
        }

        requestAnimationFrame(animate);
        render();
}

function createMolecule(xyz) {
        //split the xyz file by new lines
        var data = xyz.split('\n');

        //number of atoms is the fist line
        var atomCount = data[0];

        //make all of the atoms
        for (var i = 0; i < atomCount; i++) {
                var atomColor;
                var geo = new THREE.SphereGeometry(1, 32, 32);

                //single atoms start at index 2
                var atom = data[2 + i].split(/(\s+)/);

                var element = atom[0];

                var colorArray = {
                        H: 0xFFFFFF,
                        C: 0x000000,
                        N: 0x87CEEB,
                        O: 0xFF2200,
                        F: 0x1FF01F, Cl: 0x1FF01F,
                        Br: 0x992200,
                        I: 0x6600BB,
                        He: 0x00FFFF, Ne: 0x00FFFF, Ar: 0x00FFFF, Xe: 0x00FFFF, Kr: 0x00FFFF,
                        P: 0xFF9900,
                        S: 0xDDDD00,
                        B: 0xFFAA77,
                        Li: 0x7700FF, Na: 0x7700FF, K: 0x7700FF, Rb: 0x7700FF, Cs: 0x7700FF, Fr: 0x7700FF,
                        Be: 0x007700, Mg: 0x007700, Ca: 0x007700, Sr: 0x007700, Ba: 0x007700, Ra: 0x007700,
                        Ti: 0x999999,
                        Fe: 0xDD7700
                };

                if(!(element in colorArray))
                        atomColor = new THREE.Color(0xDD77FF);
                else
                        atomColor = new THREE.Color(colorArray[element]);

                var mat = new THREE.MeshPhongMaterial({
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
