import * as THREE from "/build/three.module.js";
import Stats from "/js/jsm/libs/stats.module.js";
import {OrbitControls} from "/js/jsm/controls/OrbitControls.js";
import {PLYLoader} from "/js/jsm/loaders/PLYLoader.js";
import {OBJLoader} from "/js/jsm/loaders/OBJLoader.js";
import {MTLLoader} from "/js/jsm/loaders/MTLLoader.js";
import * as dat from "/js/jsm/libs/dat.gui.module.js";

"use strict";

let renderer, scene, camera1, camera2, camera3, camera4, mesh, stats, cameraControls, gui;
let multiview = false, camAway = 200.0;

function init(event) {
    // RENDERER ENGINE
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setClearColor(new THREE.Color(0, 0, 0));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setScissorTest(true); 
    document.body.appendChild(renderer.domElement);

    // SCENE
    scene = new THREE.Scene();

    // CAMERA 1 (PERSPECTIVE VIEW)
    let fovy = 60.0;    // Field ov view
    let aspectRatio = window.innerWidth / window.innerHeight;
    let nearPlane = 0.1;
    let farPlane = 10000.0;
    camera1 = new THREE.PerspectiveCamera(fovy, aspectRatio, nearPlane, farPlane);
    camera1.position.set(0, 0, camAway);
    cameraControls = new OrbitControls(camera1, renderer.domElement);
 
     // CAMERA 2(TOP VIEW)
     aspectRatio = window.innerWidth / 2 / window.innerHeight / 2;
     camera2 = new THREE.PerspectiveCamera(fovy, aspectRatio, nearPlane, farPlane);
     camera2.position.set(0., camAway, 0.); 
     camera2.lookAt(scene.position);   
     camera2.up.set(0., 0., 1.);    

      // CAMERA 3 (FRONT VIEW)
      aspectRatio = window.innerWidth / 2 / window.innerHeight / 2;
      camera3 = new THREE.PerspectiveCamera(fovy, aspectRatio, nearPlane, farPlane);
      camera3.position.set(0., 0., camAway); 
      camera3.lookAt(scene.position);   
      camera3.up.set(0., 1., 0.);    

     // CAMERA 4 (SIDE VIEW)
     aspectRatio = window.innerWidth / 2 / window.innerHeight / 2;
     camera4 = new THREE.PerspectiveCamera(fovy, aspectRatio, nearPlane, farPlane);
     camera4.position.set(camAway, 0., 0.); 
     camera4.lookAt(scene.position);   
     camera4.up.set(0., 1., 0.);    
            
    // MODEL

    let mtlLoader = new MTLLoader();
    mtlLoader.load('./assets/obj/r2d2/r2-d2.mtl', function(materials) {
        materials.preload();
        var objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.load('./assets/obj/r2d2/r2-d2.obj', function (object) {
            object.position.y = object.position.y - 60.;
            mesh = object;
            // SCENE HIERARCHY
            scene.add(mesh);
        });
    });

    // LIGHTS 
    var keyLight = new THREE.DirectionalLight(new THREE.Color('hsl(30, 100%, 75%)'), 1.0);
    keyLight.position.set(-100, 0, 100);
    var fillLight = new THREE.DirectionalLight(new THREE.Color('hsl(240, 100%, 75%)'), 0.75);
    fillLight.position.set(100., 0., 100.);
    var backLight = new THREE.DirectionalLight(0xffffff, 1.0);
    backLight.position.set(100., 0., -100.).normalize();

    // SCENE HIERARCHY

    scene.add(keyLight);
    scene.add(fillLight);
    scene.add(backLight);

    // GUI
    gui = new dat.GUI();
    gui.close();

    // SETUP STATS
    stats = new Stats();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.dom);

    // DRAW SCENE IN A RENDER LOOP (ANIMATION)
    renderLoop();
}

function renderLoop() {
    stats.begin();
    if(!multiview) {
         // CAMERA 1
         camera1.aspect =  window.innerWidth / window.innerHeight;
         camera1.updateProjectionMatrix();
         renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
         renderer.setScissor(0, 0, window.innerWidth, window.innerHeight);
         renderer.render(scene, camera1);
    } 
    else {
        // CAMERA 1
        camera1.aspect = window.innerWidth/2. /  (window.innerHeight/2);
        camera1.updateProjectionMatrix();
       
        renderer.setViewport(window.innerWidth/2., window.innerHeight/2, window.innerWidth/2., window.innerHeight/2);
        renderer.setScissor(window.innerWidth/2., window.innerHeight/2, window.innerWidth/2., window.innerHeight/2);
        renderer.render(scene, camera1);

        // CAMERA 2
        camera2.aspect = window.innerWidth/2. / (window.innerHeight/2);
        camera2.updateProjectionMatrix();
        renderer.setViewport(0, window.innerHeight/2, window.innerWidth/2., window.innerHeight/2);
        renderer.setScissor(0, window.innerHeight/2, window.innerWidth/2., window.innerHeight/2);
        renderer.render(scene, camera2);

        // CAMERA 3
        camera3.aspect = window.innerWidth/2. / (window.innerHeight/2);
        camera3.updateProjectionMatrix();
        renderer.setViewport(0, 0, window.innerWidth/2., window.innerHeight/2);
        renderer.setScissor(0, 0, window.innerWidth/2., window.innerHeight/2);
        renderer.render(scene, camera3);

        // CAMERA 4
        camera4.aspect = window.innerWidth/2. / (window.innerHeight/2);
        camera4.updateProjectionMatrix();
        renderer.setViewport(window.innerWidth/2, 0, window.innerWidth/2., window.innerHeight/2);
        renderer.setScissor(window.innerWidth/2, 0, window.innerWidth/2., window.innerHeight/2);
        renderer.render(scene, camera4);
    }
    updateScene();
    stats.end();
    stats.update();
    requestAnimationFrame(renderLoop);
}

function updateScene() {
    if(mesh) {
        //mesh.rotation.y = mesh.rotation.y + 0.01;
    }
}

// EVENT LISTENERS & HANDLERS

document.addEventListener("DOMContentLoaded", init);

window.addEventListener("resize", () => {
    if(!multiview) {
         // CAMERA 1
         camera1.aspect = window.innerWidth / window.innerHeight;
         camera1.updateProjectionMatrix();
         renderer.setSize(window.innerWidth, window.innerHeight);
    }
    else {
         // CAMERA 1
         camera1.aspect = window.innerWidth / 2. / (window.innerHeight / 2);
         camera1.updateProjectionMatrix();
        // CAMERA 2
         camera2.aspect = window.innerWidth / 2. / (window.innerHeight / 2);
         camera2.updateProjectionMatrix();
         // CAMERA 3
         camera3.aspect = window.innerWidth / 2. / (window.innerHeight / 2);
         camera3.updateProjectionMatrix();
         // CAMERA 4
         camera4.aspect = window.innerWidth / 2. / (window.innerHeight / 2);
         camera4.updateProjectionMatrix();

         renderer.setSize(window.innerWidth, window.innerHeight);
    }
}, false);

document.addEventListener("keydown", (ev) => {
    if(ev.key == " ")	// Space bar
	{
		multiview = !multiview;
	}
}, false);




