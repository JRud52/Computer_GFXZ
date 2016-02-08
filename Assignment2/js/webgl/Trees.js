/*
    Graphics Assignment 2
    Group Members: Justin, Tyler, Will, Michael, Guy
*/



var camera, scene, renderer, controls;
var mapGeo;
var particleSystem;
var particleCount;
var particles;
var clock = new THREE.Clock();

var stats;

/*
    ONLOAD FUNCTION
*/
function main() {
        init();
        animate();
        update();
}


//initial setup
function init() {

        //Set to our custom canvas
        container = document.getElementById('myCanvas');
        document.body.appendChild(container);

        //Performance Stats
        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '44px';
        container.appendChild(stats.domElement);

        //webGL renderer size 600x450
        renderer = new THREE.WebGLRenderer({
                antialias: true
        });
        renderer.setPixelRatio(($(container).width()-100) / 450);
        renderer.setSize($(container).width()-100,450);
        renderer.shadowMap.enabled = true;
        container.appendChild(renderer.domElement);

        //New perspective camera, positioned to face the trees and such.
        camera = new THREE.PerspectiveCamera(60, ($(container).width()-100) / 450, 0.1, 10000);
        camera.position.z = 2500;
        camera.position.y = 2000;
        camera.lookAt(new THREE.Vector3(500, 0, 500));

        scene = new THREE.Scene();
         scene.fog = new THREE.FogExp2(0xe6e6e6, 0.0002);

        mapGeo = new THREE.Geometry();
        var treeGeo = new THREE.CylinderGeometry(0, 4, 10, 32, 1, true);

        //set the pivot point to the bottom of the geometry
        treeGeo.applyMatrix(new THREE.Matrix4().makeTranslation(0, 1.5, 0));

        //generate the trees
        generateTrees(treeGeo, 100, 400, 200, 75, 40, 150, 50);

        //Making some grass
        var loader = new THREE.TextureLoader();
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
        var spotLight = new THREE.SpotLight(0xffffff, 1);
        spotLight.name = 'Spot Light';
        spotLight.position.set(2000, 4000, 2000);
        spotLight.castShadow = true;
        spotLight.shadowCameraNear = true;
        spotLight.intensity = 1;


        //directional light for shadows
        var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(2000, 4000, 2000);
        directionalLight.castShadow = true;
        directionalLight.shadowMapEnabled = true;
        //scene.add(directionalLight);

        spotLight.shadowCameraFar = 10000;
        scene.add(spotLight);



        //setTimeout(function(){addObjects();},1000);


        // particle system parameters
        particleCount = 10000;
        particles = new THREE.Geometry();
        var pMaterial = new THREE.ParticleBasicMaterial({
            color: 0x99d6ff,
            size: 10
        });


        for (var p = 0; p < particleCount; p++) {
            //create the single particle
            var pX = (Math.random() * 400 - 200) * 10;
            var pY = (Math.random() * 400 - 200) * 10;
            var pZ = (Math.random() * 400 - 200) * 10;
            var particle = new THREE.Vector3(pX, pY, pZ);

            // add the single particle
            particles.vertices.push(particle);
        }

        // rain particle system
        particleSystem = new THREE.ParticleSystem(
            particles,
            pMaterial
        );

        // add it to the scene
        scene.add(particleSystem);
}

function addObjects() {

        scene.add(dae);
}

//updates every frame used for animation and input handling
function update() {
    /*
        particleSystem.position.y -= 10;


        for (i = 0; i < particleCount; i++){
            var particle = particles[i];

            // check if we need to reset
            if (particle.position.y < -200) {
                particle.position.y = 200;
            }
        }
    */
        //render the scene
        renderer.render(scene, camera);

}

function animate() {

        requestAnimationFrame(animate);
        stats.update();
        update();
}

function generateTrees(treeGeo, maxTrees, xBound, zBound, xScaleMax, xScaleMin, yScaleMax, yScaleMin) {
        var loader = new THREE.TextureLoader();
        var treeTexture = loader.load("textures/TreeTexture.png");
        treeTexture.wrapS = treeTexture.wrapT = THREE.RepeatWrapping;
        treeTexture.anisotropy = 16;

        var mat = new THREE.MeshPhongMaterial({
            color: 0x09C580,
            shininess: 250,
            specular: 0x222222,
            shading: THREE.SmoothShading,
            map: treeTexture
        });

        for (i = 0; i < maxTrees; i++) {
                tree = new THREE.Mesh(treeGeo, mat);

                //randomly place a tree somewhere in the scene
                tree.position.x = Math.floor(Math.random() * xBound - zBound) * 10;
                tree.position.z = Math.floor(Math.random() * xBound - zBound) * 10;

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
