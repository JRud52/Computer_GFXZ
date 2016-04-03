function generateAssets(houseIndex) {

        var assets = new THREE.Object3D();
        var assetCollisionList = [];

        if(houseIndex == 1 && houseIndex == 0) { //Temporarily Disabled
            //bathroom mirror
            var mirrorPlaneGeo = new THREE.PlaneBufferGeometry(8, 8);
            var bathroomMirror = new THREE.Mirror(renderer, camera, { clipBias: 0.003, textureWidth: window.innerWidth, textureHeight: window.innerHeight, color: 0x77777 });

            var mirrorMesh = new THREE.Mesh(mirrorPlaneGeo, bathroomMirror.material);
            mirrorMesh.add(bathroomMirror);
            mirrorMesh.translateZ(-69.4);
            mirrorMesh.translateY(8);
            mirrorMesh.translateX(15);
            assets.add(mirrorMesh);

            //mirror with which the perspective of the bathroom mirror is based off of
            var perspectiveMirror = new THREE.Mirror(renderer, camera, { clipBias: 0.003, textureWidth: window.innerWidth, textureHeight: window.innerHeight, color: 0x333333 });

        }

        //Textures
        povrayPic = loader.load("povray/images/pic"+randomInt(0,19)+".png");
        povrayPic.wrapS = ceilingTex.wrapT = THREE.RepeatWrapping;
        povrayPic.repeat.set(1, 1);
        povrayPic.anisotropy = 25;

        //The picture frames around the house
        var picFrame = new THREE.Object3D();

        //the picture to be framed
        var framedPicGeo = new THREE.BoxGeometry(5, 5, 0.5);
        framedPicGeo.translate(2.5, 2.5, 0);
        var framedPicMat = new THREE.MeshPhongMaterial({
                color: 0xFFFFFF,
                map: povrayPic
        });
        var framedPic = new THREE.Mesh(framedPicGeo, framedPicMat);
        picFrame.add(framedPic);

        //the edges of the picture frame        
        var picFrameEdgeGeo = new THREE.CylinderGeometry(0.5, 0.5, 5, 3, 1);
        picFrameEdgeGeo.translate(0, 2.5, 0);
        var picFrameMat = new THREE.MeshPhongMaterial({
                color: 0xffffff
        });
        var picFrameEdge = new THREE.Mesh(picFrameEdgeGeo, picFrameMat);
        var picFrameEdge2 = new THREE.Mesh(picFrameEdgeGeo, picFrameMat);
        var picFrameEdge3 = new THREE.Mesh(picFrameEdgeGeo, picFrameMat);
        var picFrameEdge4 = new THREE.Mesh(picFrameEdgeGeo, picFrameMat);

        //picture frame corners
        var picFrameCornerGeo = new THREE.BoxGeometry(1, 1, 1);
        var picFrameCorner = new THREE.Mesh(picFrameCornerGeo, picFrameMat);
        var picFrameCorner2 = new THREE.Mesh(picFrameCornerGeo, picFrameMat);
        var picFrameCorner3 = new THREE.Mesh(picFrameCornerGeo, picFrameMat);
        var picFrameCorner4 = new THREE.Mesh(picFrameCornerGeo, picFrameMat);
        picFrameCorner2.translateY(5);
        picFrameCorner3.translateX(5);
        picFrameCorner4.translateX(5);
        picFrameCorner4.translateY(5);

        picFrameEdge2.translateX(5);
        picFrameEdge3.translateX(5);
        picFrameEdge3.rotateZ(Math.PI / 2);
        picFrameEdge4.translateX(5);
        picFrameEdge4.translateY(5);
        picFrameEdge4.rotateZ(Math.PI / 2);

        picFrame.add(picFrameEdge);
        picFrame.add(picFrameEdge2);
        picFrame.add(picFrameEdge3);
        picFrame.add(picFrameEdge4);        

        picFrame.add(picFrameCorner);
        picFrame.add(picFrameCorner2);
        picFrame.add(picFrameCorner3);
        picFrame.add(picFrameCorner4);

        picFrame.translateY(10);
        picFrame.translateX(32.5);
        picFrame.translateZ(-69.5);

        assets.add(picFrame);

        //get another pov ray image and frame it - this is the one in the bedroom space
        var picFrame2 = picFrame.clone();
        povrayPic = loader.load("povray/images/pic" + randomInt(0, 19) + ".png");
        povrayPic.wrapS = ceilingTex.wrapT = THREE.RepeatWrapping;
        povrayPic.repeat.set(1, 1);
        povrayPic.anisotropy = 25;        
        var framedPicMat2 = new THREE.MeshPhongMaterial({
            color: 0xFFFFFF,
            map: povrayPic
        });
        picFrame2.children[0].material = framedPicMat2;
        picFrame2.translateX(20);        
        assets.add(picFrame2);

        //get another pov ray image and frame it - this is the one in the kitchen space
        var picFrame3 = picFrame.clone();        
        povrayPic = loader.load("povray/images/pic" + randomInt(0, 19) + ".png");
        povrayPic.wrapS = ceilingTex.wrapT = THREE.RepeatWrapping;
        povrayPic.repeat.set(1, 1);
        povrayPic.anisotropy = 25;
        var framedPicMat3 = new THREE.MeshPhongMaterial({
            color: 0xFFFFFF,
            map: povrayPic
        });
        picFrame3.children[0].material = framedPicMat3;
        picFrame3.translateZ(55);
        picFrame3.translateX(-32);
        picFrame3.rotateY(Math.PI / 2);
        assets.add(picFrame3);

        var sofa, bed, table;

        //pick random asset to spawn or none
        if (houseIndex == 0) {
            table = 1;
            bed = 1;
            sofa = 1;
        }
        else{
            table = Math.floor(Math.random() * 4);
            bed = Math.floor(Math.random() * 4);
            sofa = Math.floor(Math.random() * 4);
        }

        var tablePath = "models/table" + table + ".json";
        var bedPath = "models/bed" + bed + ".json";
        var sofaPath = "models/sofa" + sofa + ".json";

        if(sofa != 0){
            //SOFA
            objectLoader.load(sofaPath, function (obj) {

                    obj.translateX(50);
                    obj.translateY(3);
                    obj.translateZ(-20);
                    obj.rotateY(-Math.PI / 2);

                    //collision box
                    var collisionCubeGeo = new THREE.BoxGeometry(15, 5, 7.5);
                    var collisionCubeMat = new THREE.MeshPhongMaterial({
                            transparent: true,
                            opacity: 0
                    });
                    var collisionCube = new THREE.Mesh(collisionCubeGeo, collisionCubeMat);
                    obj.add(collisionCube);
                    collisionCube.translateZ(-0.75);
                    assetCollisionList.push(collisionCube);
                    assets.add(obj);
            });
        }

        //sink
        objectLoader.load("models/sink.json", function(obj) {

                obj.translateX(15);
                obj.translateY(0);
                obj.translateZ(-68);
                obj.scale.set(1.75, 1.75, 1.75);
                obj.rotateY(-Math.PI);

                //collision box
                var collisionCubeGeo = new THREE.BoxGeometry(2, 8, 2);
                var collisionCubeMat = new THREE.MeshPhongMaterial({
                        transparent: true,
                        opacity: 0
                });
                var collisionCube = new THREE.Mesh(collisionCubeGeo, collisionCubeMat);
                obj.add(collisionCube);
                assetCollisionList.push(collisionCube);
                assets.add(obj);
        });

        if(table != 0){
            //table
            objectLoader.load(tablePath, function (obj) {

                obj.translateX(15);
                obj.translateY(0);
                obj.translateZ(-18);
                obj.scale.set(1.75, 1.75, 1.75);
                obj.rotateY(Math.PI / 2);

                //collision box
                var collisionCubeGeo = new THREE.BoxGeometry(8, 8, 5);
                var collisionCubeMat = new THREE.MeshPhongMaterial({
                    transparent: true,
                    opacity: 0
                });
                var collisionCube = new THREE.Mesh(collisionCubeGeo, collisionCubeMat);
                obj.add(collisionCube);
                assetCollisionList.push(collisionCube);
                assets.add(obj);
            });
        }

        //bath tub
        objectLoader.load("models/bathtub.json", function(obj) {

                obj.translateX(15);
                obj.translateY(2.5);
                obj.translateZ(-40);
                obj.scale.set(1.75, 1.75, 1.75);
                obj.rotateY(-Math.PI);

                //collision box
                var collisionCubeGeo = new THREE.BoxGeometry(5.5, 5, 4);
                var collisionCubeMat = new THREE.MeshPhongMaterial({
                        transparent: true,
                        opacity: 0
                });
                var collisionCube = new THREE.Mesh(collisionCubeGeo, collisionCubeMat);
                obj.add(collisionCube);
                assetCollisionList.push(collisionCube);
                assets.add(obj);
        });


        //tv stand
        objectLoader.load("models/tvStand.json", function(obj) {

                obj.translateX(68);
                obj.translateY(0);
                obj.translateZ(-20);
                obj.rotateY(Math.PI / 2);

                obj.scale.set(1.5, 1.5, 1.5);

                //collision box
                var collisionCubeGeo = new THREE.BoxGeometry(7, 8, 2.25);
                var collisionCubeMat = new THREE.MeshPhongMaterial({
                        transparent: true,
                        opacity: 0
                });
                var collisionCube = new THREE.Mesh(collisionCubeGeo, collisionCubeMat);
                obj.add(collisionCube);
                assetCollisionList.push(collisionCube);
                assets.add(obj);
        });

        if(bed != 0){
            //BED
            objectLoader.load(bedPath, function(obj) {

                    obj.translateX(62);
                    obj.translateY(2);
                    obj.translateZ(-43);

                    //collision box
                    var collisionCubeGeo = new THREE.BoxGeometry(14, 8, 15.5);
                    var collisionCubeMat = new THREE.MeshPhongMaterial({
                            transparent: true,
                            opacity: 0
                    });
                    var collisionCube = new THREE.Mesh(collisionCubeGeo, collisionCubeMat);
                    obj.add(collisionCube);
                    collisionCube.translateZ(-0.25);
                    assetCollisionList.push(collisionCube);
                    assets.add(obj);
            });
        }

        //LAMP 1
        objectLoader.load("models/lamp.json", function(obj) {

                obj.translateX(10);
                obj.translateY(20);
                obj.translateZ(-15);

                assets.add(obj);
        });

        //LAMP 2
        objectLoader.load("models/lamp.json", function (obj) {

            obj.translateX(50);
            obj.translateY(20);
            obj.translateZ(-15);

            assets.add(obj);
        });


        //Toilet
        objectLoader.load("models/toilet.json", function(obj) {
                obj.translateX(5);
                obj.translateZ(-68.5);
                obj.rotateY(1.5);
                obj.scale.set(0.5, 0.5, 0.5);

                //collision box
                var collisionCubeGeo = new THREE.BoxGeometry(10, 20, 5);
                var collisionCubeMat = new THREE.MeshPhongMaterial({
                        transparent: true,
                        opacity: 0
                });
                var collisionCube = new THREE.Mesh(collisionCubeGeo, collisionCubeMat);
                obj.add(collisionCube);
                assetCollisionList.push(collisionCube);
                assets.add(obj);
        });


        var ret = [assets, assetCollisionList, bathroomMirror, perspectiveMirror];
        return ret;
}
