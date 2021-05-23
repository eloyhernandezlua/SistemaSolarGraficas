import * as THREE from "/build/three.module.js";
import Stats from "/js/jsm/libs/stats.module.js";
import {OrbitControls} from "/js/jsm/controls/OrbitControls.js";
import * as dat from "/js/jsm/libs/dat.gui.module.js";

"use strict";

class planeta extends THREE.Mesh{
    constructor(radius, textureRoute, rot, tras, posX, posY, posZ, nombre){
        super();
        this.position.x = posX*350/2;
        this.position.y = posY;
        this.position.z = posZ;
        this.name = nombre;
        this.rot = rot;
        this.tras = tras;
        this.posX = posX*350/2;
        this.posY = posY;
        this.posZ = posZ;
        //console.log(textureRoute)
       // let texture1 = new THREE.TextureLoader().load("img/Earth.jpeg");

       this.geometry = new THREE.SphereGeometry(radius/2, 32, 32);
        const loader = new THREE.TextureLoader();
        loader.load(textureRoute, (texture) => {
        this.material = new THREE.MeshBasicMaterial({
            map: texture,
        });
        
        });
    }
}

let renderer, scene, camera, mesh, stats, cameraControls, gui, planets, sol, mercurio, venus, tierra, marte, jupiter, saturno, urano, neptuno;
let flagRot, falgTras
var t = 0;
var follow = 0;
var camera_dif = 0;

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
    cameraControls.enableDamping = true;
            
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
    /*
    let planets = tPlanets.map(texture => new THREE.MeshBasicMaterial({map: texture})).map(material => new THREE.Mesh(sphereGeom, material));

    planets.forEach((planet, index) => {
        planet.position.set(-100 + 40* index, 0, 0);
        scene.add(planet);
    });
*/
    let skybox = new THREE.Mesh(boxGeom, cubeMaterials);
    skybox.scale.set(10000, 10000, 10000)

    // SCENE HIERARCHY
    scene.add(skybox);


    // OPCION PARA LOS PLANETAS -- DATOS REALES ESCALADOS

    //SOL
    sol = new planeta(109, "/img/Sun.png", 0.03333, 0, 0, 0, 0, "sol");
    scene.add(sol);

    //Mercurio
    mercurio = new planeta(0.383, "img/Mercury.jpeg", 1.6, 4.14, 0.38, 0, 0, "mercurio");
    scene.add(mercurio);

    //Venus
    venus = new planeta(.95, "/img/Venus.jpeg", 1.78, 1.6, 0.72, 0 ,0, "venus");
    scene.add(venus);

    //Tierra 
    tierra = new planeta(1, "/img/Earth.jpeg", 1, 1, 1, 0, 0, "tierra");
    scene.add(tierra); 

    //Marte
    marte = new planeta(.533, "/img/Mars.jpeg", 0.8082, 0.53, 1.52, 0 ,0, "marte");
    scene.add(marte);

    //Júpiter
    jupiter = new planeta(11.21, "/img/Jupiter.jpeg", 0.439, 0.084, 5.20, 0 ,0, "jupiter");
    scene.add(jupiter);

    //Saturno
    saturno = new planeta(8.52, "/img/Saturn Planet.jpeg", .3254, 0.034, 9.58, 0 ,0, "saturno");
    scene.add(saturno);

    //Urano
    urano = new planeta(4, "/img/Uranus Planet.jpeg", .229, 0.012, 19.14, 0 ,0, "urano");
    scene.add(urano);

    //Neptuno la distancia real debería de ser 30.20 pero se sale del skybox
    neptuno = new planeta(3.88, "/img/Neptune.jpeg", .1823, 0.006, 20.20, 0 ,0, "neptuno");
    scene.add(neptuno);

    let worldAxes = new THREE.AxesHelper(100000);
    scene.add(worldAxes);

    planets = [sol, mercurio, venus, tierra, marte, jupiter, saturno, urano, neptuno]

    // GUI
    gui = new dat.GUI();
    gui.close();

    let closeUps = {

        cuTierra: function(){
            camera.position.set(tierra.position.x,tierra.position.y, tierra.position.z+3);
            camera.up = new THREE.Vector3(0,1,0);
            camera.lookAt(new THREE.Vector3(tierra.position.x,tierra.position.y,tierra.position.z));
            cameraControls.target.set(tierra.position.x,tierra.position.y,tierra.position.z);
            follow = 3
            camera_dif = 3;
        },
        cuMercurio: function(){
            camera.position.set(mercurio.position.x,mercurio.position.y, mercurio.position.z+3);
            camera.up = new THREE.Vector3(0,1,0);
            camera.lookAt(new THREE.Vector3(mercurio.position.x,mercurio.position.y,mercurio.position.z));
            cameraControls.target.set(mercurio.position.x,mercurio.position.y,mercurio.position.z);
            follow = 1;   
            camera_dif = 3;         
        },
        cuVenus: function(){
            camera.position.set(venus.position.x,venus.position.y, venus.position.z+3);
            camera.up = new THREE.Vector3(0,1,0);
            camera.lookAt(new THREE.Vector3(venus.position.x,venus.position.y,venus.position.z));
            cameraControls.target.set(venus.position.x,venus.position.y,venus.position.z);
            follow = 2;
            camera_dif = 3;
        },
        cuMarte: function(){
            camera.position.set(marte.position.x,marte.position.y, marte.position.z+3);
            camera.up = new THREE.Vector3(0,1,0);
            camera.lookAt(new THREE.Vector3(marte.position.x,marte.position.y,marte.position.z));
            cameraControls.target.set(marte.position.x,marte.position.y,marte.position.z);
            follow = 4
            camera_dif = 3;
        },
        cuJupiter: function(){
            camera.position.set(jupiter.position.x,jupiter.position.y, jupiter.position.z+20);
            camera.up = new THREE.Vector3(0,1,0);
            camera.lookAt(new THREE.Vector3(jupiter.position.x,jupiter.position.y,jupiter.position.z));
            cameraControls.target.set(jupiter.position.x,jupiter.position.y,jupiter.position.z);
            follow = 5
            camera_dif = 20;
        },
        cuSaturno: function(){
            camera.position.set(saturno.position.x,saturno.position.y, saturno.position.z+20);
            camera.up = new THREE.Vector3(0,1,0);
            camera.lookAt(new THREE.Vector3(saturno.position.x,saturno.position.y,saturno.position.z));
            cameraControls.target.set(saturno.position.x,saturno.position.y,saturno.position.z);
            follow =6;
            camera_dif = 20;
        },
        cuUrano: function(){
            camera.position.set(urano.position.x,urano.position.y, urano.position.z+10);
            camera.up = new THREE.Vector3(0,1,0);
            camera.lookAt(new THREE.Vector3(urano.position.x,urano.position.y,urano.position.z));
            cameraControls.target.set(urano.position.x,urano.position.y,urano.position.z);
            follow = 7;
            camera_dif = 10;
        },
        cuNeptuno: function(){
            camera.position.set(neptuno.position.x,neptuno.position.y, neptuno.position.z+5);
            camera.up = new THREE.Vector3(0,1,0);
            camera.lookAt(new THREE.Vector3(neptuno.position.x,neptuno.position.y,neptuno.position.z));
            cameraControls.target.set(neptuno.position.x,neptuno.position.y,neptuno.position.z);
            follow = 8;
            camera_dif = 5;
        },

    }

    let moves = {
        rota: false,
        trasla: false
    }
    let axes = gui.addFolder("Axes");
    axes.add(worldAxes, "visible").name("World Axes").setValue(false).listen().onChange(function(value) {
 
    });

    let acercamiento = gui.addFolder("Vista")
    acercamiento.add(closeUps, "cuTierra").name("Tierra").listen().onChange(function(value) {
    });
    acercamiento.add(closeUps, "cuMercurio").name("Mercurio").listen().onChange(function(value) {
    });
    acercamiento.add(closeUps, "cuVenus").name("Venus").listen().onChange(function(value) {
    });
    acercamiento.add(closeUps, "cuMarte").name("Marte").listen().onChange(function(value) {
    });
    acercamiento.add(closeUps, "cuJupiter").name("Júpiter").listen().onChange(function(value) {
    });
    acercamiento.add(closeUps, "cuSaturno").name("Saturno").listen().onChange(function(value) {
    });
    acercamiento.add(closeUps, "cuUrano").name("Urano").listen().onChange(function(value) {
    });
    acercamiento.add(closeUps, "cuNeptuno").name("Neptuno").listen().onChange(function(value) {
    });
    

    let movements = gui.addFolder("Movimientos");
    movements.add(moves, "rota").name("Rotation").setValue(false).listen().onChange(function(value) {
        flagRot = value;
    });
    movements.add(moves, "trasla").name("Traslation").setValue(false).listen().onChange(function(value) {
        falgTras = value;
    });


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
    //console.log(tierra.position.x)
    cameraControls.update();

    //rotation
    if (flagRot){
        for(let p in planets){
            planets[p].rotation.y += Math.PI / 180 * planets[p].rot;
        }
    }

    //translation
    if(falgTras){
        for(let p in planets){  
            if(p != 0 ){
                planets[p].position.x = planets[p].posX * Math.cos(t*planets[p].tras) + planets[p].posZ * Math.sin(t*planets[p].tras);
                planets[p].position.z =  planets[p].posZ* Math.cos(t*planets[p].tras) - planets[p].posX * Math.sin(t*planets[p].tras);
            }
        }
        if (follow != 0){
            camera.position.set(planets[follow].position.x, planets[follow].position.y, planets[follow].position.z + camera_dif);
            camera.up = new THREE.Vector3(0,1,0);
            camera.lookAt(new THREE.Vector3(planets[follow].position.x, planets[follow].position.y, planets[follow].position.z));
            cameraControls.target.set(planets[follow].position.x, planets[follow].position.y, planets[follow].position.z);
        }
    }else{
        follow =0;
    }


    t+= .01
}

// EVENT LISTENERS & HANDLERS

document.addEventListener("DOMContentLoaded", init);

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    cameraControls.update();
    renderer.setSize(window.innerWidth, window.innerHeight);
}, false);