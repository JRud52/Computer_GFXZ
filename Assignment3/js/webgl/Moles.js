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

//all types of available lighting that the user can toggle on or off
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

        //GUI to show some available molecules - server side
        var guiF1 = gui.addFolder('Molecules', "a");
        guiF1.add(xyzFiles, 'Anatoxin').name('Anatoxin-a');
        guiF1.add(xyzFiles, 'Heroin');
        guiF1.add(xyzFiles, 'Lactose');
        guiF1.add(xyzFiles, 'Methamphetamine');
        guiF1.add(xyzFiles, 'Tetrasilete');
        guiF1.add(xyzFiles, 'Caffeine');

        //allow the user to upload their own XYZ file
        gui.add(xyzFiles, 'loadFile').name('Upload XYZ');

        //GUI to allow the user to select a lighting type
        var guiF2 = gui.addFolder('Lighting Types');
        guiF2.add(lighting, 'Ambient');
        guiF2.add(lighting, 'Directional');
        guiF2.add(lighting, 'Point');
        guiF2.add(lighting, 'Hemisphere');
        guiF2.add(lighting, 'Spot');

        //GUI to allow the user to specify lighting parameters
        var guiF3 = gui.addFolder('Render Options');
        guiF3.add(options, 'size', 0, 2);
        guiF3.addColor(options, 'lightColor');
        guiF3.addColor(options, 'secLightColor');
        guiF3.add(options, 'intensity', 0, 10);

        //position the dom elemeent of the GUI
        gui.domElement.style.position = "absolute";
        gui.domElement.style.top = '290px';
        gui.domElement.style.right = '300px';
        document.body.appendChild(gui.domElement);
        guiF2.open();
        guiF3.open();


        //add a light of each type
        //light 1: spot light
        spotLight = new THREE.SpotLight(0xffffff, 1);
        spotLight.position.set(0, 0, 15);
        spotLight.castShadow = true;
        scene.add(spotLight);

        //light 2: ambient light
        ambientLight = new THREE.AmbientLight(0xFFFFFF);
        ambientLight.position.set(0,0,15);
        ambientLight.castShadow = true;
        scene.add(ambientLight);

        //light 3: directional light
        directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
        directionalLight.position.set(0,0,15);
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        //light 4: hemisphere light
        hemisphereLight = new THREE.HemisphereLight(0xFFFFFF, 0xC1C1D1, 1);
        hemisphereLight.castShadow = true;
        scene.add(hemisphereLight);

        //light 5: point light
        pointLight = new THREE.PointLight(0xFFFFFF, 5, 100, 10);
        pointLight.position.set(0,0,15);
        pointLight.castShadow = true;
        scene.add(pointLight);

        
        //handler for when the user selects an XYZ file
        var fileInput = document.getElementById('myInput');
        fileInput.addEventListener('change', function (e) {

                //get and read the file
                var file = fileInput.files[0];
                var fileReader = new FileReader();
                var xyz;

                fileReader.onload = function (e) {
                        //if there was already a molecule loaded remove it from the scene
                        if (molecule != null) {
                                scene.remove(molecule);
                                molecule = new THREE.Object3D();
                        }

                        //setup the new molecule 
                        xyz = fileReader.result;
                        createMolecule(xyz);
                }

                //read the file as plain text
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

//updates the lighting parameters for each light in the scene - the parameters are selected by the user via the GUI
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
        
        //scale the molecule to the size specified by the user via the GUI
        molecule.scale.x = options.size;
        molecule.scale.y = options.size;
        molecule.scale.z = options.size;

        //adjust lighting based on the parameters selected by the user
        var primaryColor = parseInt(options.lightColor.replace(/^#/, ''), 16);
        var secondaryColor = parseInt(options.secLightColor.replace(/^#/, ''), 16);
        var intensity = options.intensity;
        updateLighting(primaryColor, secondaryColor, intensity);

        //if we have a molecule rotate it slowly about the Y axis
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

                //associative array representing the atom colors
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

                //ensure that the element is in the array of colors 
                if (!(element in colorArray))
                        //default color for elements not in the array
                        atomColor = new THREE.Color(0xDD77FF);
                else
                        atomColor = new THREE.Color(colorArray[element]);

                //material for the atom
                var mat = new THREE.MeshPhongMaterial({
                        color: atomColor
                });

                //the atom is represented by a sphere
                var sphere = new THREE.Mesh(geo, mat);
                sphere.position.x = atom[2];
                sphere.position.y = atom[4];
                sphere.position.z = atom[6];


                //0.55->1.5 scale on sphere.
                //scale the atom based on its 
                var scaleArray = {
                        H: 0.55, He: 0.55,
                        Li: 0.9, Be: 0.9, B: 0.9, C: 0.9, N: 0.9, O: 0.9, F: 0.9, Ne: 0.9,
                        Na: 1.05, Mg: 1.05, Al: 1.05, Si: 1.05, P: 1.05, S: 1.05, Cl: 1.05, Ar: 1.05,
                        K: 1.25, Ca: 1.25, Sc: 1.25, Ti: 1.25, V: 1.25, Cr: 1.25, Mn: 1.25, Fe: 1.25, Co: 1.25, Ni: 1.25, Cu: 1.25, Zn: 1.25, Ga: 1.25, Ge: 1.25, As: 1.25, Se: 1.25, Br: 1.25, K: 1.25
                }
                
                //scale defaults to 1.5 if it is not in the scale array
                var scaleAmount = 1.5;
                if(element in scaleArray)
                        scaleAmount = scaleArray[element];

                console.log(element);
                console.log(scaleAmount);

                //scale the sphere
                sphere.scale.x = scaleAmount;
                sphere.scale.y = scaleAmount;
                sphere.scale.z = scaleAmount;

                //add the sphere to the molecule object (so we can rotate the entire object later)
                molecule.add(sphere);
        }

        //add the molecule to the scene 
        scene.add(molecule);
}
