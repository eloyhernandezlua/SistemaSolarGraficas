import * as THREE from "/build/three.module.js";
import Stats from "/js/jsm/libs/stats.module.js";
import {OrbitControls} from "/js/jsm/controls/OrbitControls.js";
import * as dat from "/js/jsm/libs/dat.gui.module.js";

"use strict";

class planeta extends THREE.Mesh{
    constructor(radius, textureRoute, rot, tras, posX, posY, posZ){
        super();

        console.log(textureRoute)
       // let texture1 = new THREE.TextureLoader().load("img/Earth.jpeg");

       var Geometry = new THREE.SphereGeometry(radius, 32, 32);
        const loader = new THREE.TextureLoader();
        loader.load(textureRoute, (texture) => {
        let planetMaterial = new THREE.MeshBasicMaterial({
            map: texture,
        });
        let planet = new THREE.Mesh(Geometry, planetMaterial);
        
        planet.position.x = posX*350;
        planet.position.y = posY;
        planet.position.z = posZ;
        
        scene.add(planet);
        
        });
    }
}

let renderer, scene, camera, mesh, stats, cameraControls, gui, planets;

function init(event) {
    // RENDERER ENGINE
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setClearColor(new THREE.Color(0, 0, 0));
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // SCENE
    scene = new THREE.Scene();

    // CAMERA
    let fovy = 60.0;    // Field ov view
    let aspectRatio = window.innerWidth / window.innerHeight;
    let nearPlane = 0.1;
    let farPlane = 10000.0;
    camera = new THREE.PerspectiveCamera(fovy, aspectRatio, nearPlane, farPlane);
    camera.position.set(0, 0, 500);
    cameraControls = new OrbitControls(camera, renderer.domElement);
            
    // MODEL
    // GEOMETRY
    let boxGeom = new THREE.BoxGeometry()
    let sphereGeom = new THREE.SphereGeometry(10, 50, 50);

    // MATERIAL
    let texture1 = new THREE.TextureLoader().load("/img/space.jpeg");
    
    /*let texture2 = new THREE.TextureLoader().load("/img/elyvisions/tron_bk.png");
    let texture3 = new THREE.TextureLoader().load("/img/elyvisions/tron_up.png");
    let texture4 = new THREE.TextureLoader().load("/img/elyvisions/tron_dn.png");
    let texture5 = new THREE.TextureLoader().load("/img/elyvisions/tron_rt.png");
    let texture6 = new THREE.TextureLoader().load("/img/elyvisions/tron_lf.png");
*/
    let tPlanets = [
        new THREE.TextureLoader().load("/img/Sun.png"),
        new THREE.TextureLoader().load("/img/Mercury.jpeg"),
        new THREE.TextureLoader().load("/img/Venus.jpeg"),
        new THREE.TextureLoader().load("/img/Earth.jpeg"),
        new THREE.TextureLoader().load("/img/Mars.jpeg"),
        new THREE.TextureLoader().load("/img/Jupiter.jpeg"),
        new THREE.TextureLoader().load("/img/Saturn.jpeg"),
        new THREE.TextureLoader().load("/img/Uranus.jpeg"),
        new THREE.TextureLoader().load("/img/Neptune.jpeg")
    ];
    
    let cubeMaterials = [
        new THREE.MeshBasicMaterial({map: texture1, side: THREE.DoubleSide}),
        new THREE.MeshBasicMaterial({map: texture1, side: THREE.DoubleSide}),
        new THREE.MeshBasicMaterial({map: texture1, side: THREE.DoubleSide}),
        new THREE.MeshBasicMaterial({map: texture1, side: THREE.DoubleSide}),
        new THREE.MeshBasicMaterial({map: texture1, side: THREE.DoubleSide}),
        new THREE.MeshBasicMaterial({map: texture1, side: THREE.DoubleSide})
    ];

    // MESH & SCENE HIERARCHY
    let planets = tPlanets.map(texture => new THREE.MeshBasicMaterial({map: texture})).map(material => new THREE.Mesh(sphereGeom, material));

    planets.forEach((planet, index) => {
        planet.position.set(-100 + 40* index, 0, 0);
        scene.add(planet);
    });

    let skybox = new THREE.Mesh(boxGeom, cubeMaterials);
    skybox.scale.set(1000, 1000, 1000)

    // SCENE HIERARCHY
    scene.add(skybox);


    // OPCION PARA LOS PLANETAS -- DATOS REALES ESCALADOS

    //SOL
    new planeta(109, "/img/Sun.png", 0.03333, 0, 0, 0, 0);

    //Mercurio

    new planeta(0.383, "img/Mercury.jpeg", 1.6, 4.14, 0.38, 0, 0);

    //Venus

    new planeta(.95, "/img/Venus.jpeg", 1.78, 1.6, 0.72, 0 ,0);

    //Tierra
      
    new planeta(1, "/img/Earth.jpeg", 1, 1, 1, 0, 0);
    

    //Marte
    new planeta(.533, "/img/Mars.jpeg", 0.8082, 0.53, 1.52, 0 ,0);

    //Júpiter
    new planeta(11.21, "/img/Jupiter.jpeg", 0.439, 0.084, 5.20, 0 ,0);

    //Saturno
    new planeta(8.52, "/img/Saturn Planet.jpeg", .3254, 0.034, 9.58, 0 ,0);

    //Urano
    new planeta(4, "/img/Uranus Planet.jpeg", .229, 0.012, 19.14, 0 ,0);

    //Neptuno
    new planeta(3.88, "/img/Neptune.jpeg", .1823, 0.006, 30.20, 0 ,0);




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
    renderer.render(scene, camera); // DRAW SCENE
    updateScene();
    stats.end();
    stats.update();
    requestAnimationFrame(renderLoop);
}

function updateScene() {
    
}

// EVENT LISTENERS & HANDLERS

document.addEventListener("DOMContentLoaded", init);

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    cameraControls.update();
    renderer.setSize(window.innerWidth, window.innerHeight);
}, false);