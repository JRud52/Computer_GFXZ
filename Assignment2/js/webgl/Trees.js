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
var rain = new Audio('music/rain.ogg');

/*
    ONLOAD FUNCTION
*/
function main() {
        init();
        animate();
}


//initial setup
function init() {

      //  music.play();
     //   rain.play();

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

        //Creating Fog
        scene.fog = new THREE.FogExp2(0xe6e6e6, 0.0002);

        //Creating the geomtry for th etree
        mapGeo = new THREE.Geometry();
        var treeGeo = new THREE.CylinderGeometry(0, 4, 10, 32, 1, true);
        //set the pivot point to the bottom of the geometry
        treeGeo.applyMatrix(new THREE.Matrix4().makeTranslation(0, 1.5, 0));

        //generate the trees
        generateTrees(treeGeo, 150, 5000, 5000, 75, 40, 150, 50);

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

        //Add a spotlight for shadows - white light with intesity of 1
        spotLight = new THREE.SpotLight(0xffffff, 1);
        spotLight.name = 'Spot Light';
        spotLight.position.set(5000, 5000, 0);
        spotLight.castShadow = true;
        spotLight.shadowCameraNear = true;
        spotLight.intensity = 1;
        spotLight.shadowCameraFar = 100000;
        scene.add(spotLight);

        var light = new THREE.AmbientLight( 0x303030 ); // soft white light
        scene.add(light);


        //skydome
        var skyGeo = new THREE.SphereGeometry(6000, 60, 40);

        //load the texture for the skydome
        var skyTexture = loader.load("textures/sky.jpg");
        var SkyUni = {
            texture: { type: 't', value: skyTexture }
        };

        //shaders used for mapping the texture onto the dome
        var skyMat = new THREE.ShaderMaterial({
            uniforms: SkyUni,
            vertexShader: document.getElementById('sky-vertex').textContent,
            fragmentShader: document.getElementById('sky-fragment').textContent
        });

        //create the mesh and adjust its scale and render settings because we are inside the sphere
        skyBox = new THREE.Mesh(skyGeo, skyMat);
        skyBox.scale.set(-1.5, 1.5, 1.5);
        skyBox.rotation.order = 'XZY';
        skyBox.renderOrder = 1000.0;
        skyBox.rotation.x = Math.PI / 2;

        scene.add(skyBox);

 //       makeTree();
}


function makeTree() {
    var geometry = new THREE.CylinderGeometry(50, 50, 2000, 32);
    var bark = loader.load("textures/bark.jpg")
    var material = new THREE.MeshBasicMaterial({ color: 0x5c5c3d, map: bark });
    var cylinder = new THREE.Mesh(geometry, material);
    scene.add(cylinder);
}


var state1, state2, state3, state4;
//updates every frame used for animation and input handling
function update() {

        var rotateAmount = 10;

        if(spotLight.position.x >= 5000 && spotLight.position.y >= 5000)
                state1 = true;
        if(spotLight.position.x >= 5000 && spotLight.position.y <= -5000)
                state2 = true;
        if(spotLight.position.x <= -5000 && spotLight.position.y <= -5000)
                state3 = true;
        if(spotLight.position.x <= -5000 && spotLight.position.y >= 5000)
                state4 = true;

        if(state1) {
                spotLight.position.y -= rotateAmount;
                state4 = false;
        }
        if(state2) {
                spotLight.position.x -= rotateAmount*2;
                state1 = false;
        }
        if(state3) {
                spotLight.position.y += rotateAmount;
                state2 = false;
        }
        if(state4) {
                spotLight.position.x += rotateAmount*2;
                state3 = false;
        }
        //render the scene
        renderer.render(scene, camera);
}

function animate() {

        requestAnimationFrame(animate);
        stats.update();
        update();
}

function generateTrees(treeGeo, maxTrees, xBound, zBound, xScaleMax, xScaleMin, yScaleMax, yScaleMin) {
        var treeTexture = loader.load("textures/TreeTexture.png");
        treeTexture.wrapS = treeTexture.wrapT = THREE.RepeatWrapping;
        treeTexture.anisotropy = 16;

        var mat = new THREE.MeshPhongMaterial({
            color: 0x09C580,
            shininess: 0,
            specular: 0x222222,
            shading: THREE.SmoothShading,
            map: treeTexture
        });

        for (i = 0; i < maxTrees; i++) {
                tree = new THREE.Mesh(treeGeo, mat);

                //randomly place a tree somewhere in the scene
                tree.position.x = (Math.random() * (xBound*2) - xBound);
                tree.position.z = (Math.random() * (zBound*2) - zBound);

                //randomize the tree's rotation (0 to 2 Pi)
                tree.rotation.y = Math.floor(Math.random() * (Math.PI * 2));

                //randomize the tree's scale
                //the width and depth of the tree should be the same so it doesnt end up being too thin or stretched
                tree.scale.x = Math.floor(Math.random() * (xScaleMax - xScaleMin + 1)) + xScaleMin;
                tree.scale.z = tree.scale.x;

                tree.scale.y = Math.floor(Math.random() * (yScaleMax - yScaleMin + 1)) + yScaleMin;
                tree.position.y = 0;

                tree.castShadow = true;
                tree.receiveShadow = true;
                scene.add(tree);
        }
}
