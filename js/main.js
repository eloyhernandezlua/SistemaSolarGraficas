import * as THREE from "/build/three.module.js";
import Stats from "/js/jsm/libs/stats.module.js";
import {OrbitControls} from "/js/jsm/controls/OrbitControls.js";
import * as dat from "/js/jsm/libs/dat.gui.module.js";

"use strict";

class Composite extends THREE.Group {
    constructor() {
        super();
    }
}
class Primitive extends THREE.Mesh {
    constructor() {
        super();
    }
}

class FlatArrow extends Primitive {
    constructor() {
        super();
        let vertices = [
            0, 0, 0,
            0.5, 0, 0.5,
            0.5, 0, 0.25,
            0.5, 0, 0,
            1, 0, 0.25,
            1, 0, -0.25,
            0.5, 0, -0.25,
            0.5, 0, -0.5
        ];
        let indices = [
            0, 3, 1,
            0, 7, 3,
            2, 6, 5,
            2, 5, 4
        ];
        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(vertices, 3)
        );
        this.geometry.setIndex(indices);
        this.material = new THREE.MeshBasicMaterial();
    }
}

class OrbitalCamera extends THREE.PerspectiveCamera {
    constructor(fovy, aspectRatio, nearPlane, farPlane) {
        super(fovy, aspectRatio, nearPlane, farPlane);
        this.target = new THREE.Vector3(0, 0, 0);
        this.position.set(new THREE.Vector3(0, 0, 10));
        this.lookAt(this.target);
        this.r = this.position.distanceTo(this.target);
    }

    focusObj(obj) {
        var bbox = new THREE.Box3().setFromObject(obj);
        let xbar = (bbox.min.x + bbox.max.x) / 2;
        let ybar = (bbox.min.y + bbox.max.y) / 2;
        let zbar = (bbox.min.z + bbox.max.z) / 2;
        this.target = new THREE.Vector3(xbar, ybar, zbar);

        let z1 =
        (bbox.max.y - ybar) / Math.tan(((this.fov / 2) * Math.PI) / 180) + bbox.max.z;
        let z2 =
        (bbox.max.x - xbar) / Math.tan(((this.fov / 2) * Math.PI) / 180) + bbox.max.z;

        this.position.set(xbar, ybar, Math.max(z1, z2) * 2);
        this.lookAt(this.target);
    }

    orbit(obj, theta) {
        this.lookAt(this.target);
        this.r = this.position.distanceTo(this.target);
        this.position.set(this.r*Math.sin(theta), this.position.y, this.r*Math.cos(theta));
    }
}

class Planet extends Primitive {
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

       this.geometry = new THREE.SphereGeometry(radius/2, 32, 32);
        const loader = new THREE.TextureLoader();
        if (nombre != "sol"){
            loader.load(textureRoute, (texture) => {
                this.material = new THREE.MeshStandardMaterial({
                    map: texture,
                });
                this.receiveShadow = false;
                this.castShadow = true;
            });
        } else{
            loader.load(textureRoute, (texture) => {
                this.material = new THREE.MeshBasicMaterial({
                    map: texture,
                });
            });
        }
        
    }
}

// GLOBALS
let renderer, scene, camera, camera2, camera3, stats, cameraControls, gui, planets, sol, mercurio, venus, tierra, marte, jupiter, saturno, urano, neptuno;
let flagRot, falgTras;
let card; // Access to DOM card;
var t = 0;
var follow = 0;
var camera_dif = 0;

// Rotation
let theta = 0;

let multiview = false;

function init(event) {
    // RENDERER ENGINE
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setClearColor(new THREE.Color(104, 185, 226));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setScissorTest(true); // lets renderer to
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
    camera.up.set(0,1,0);
    camera.lookAt(new THREE.Vector3(0,0,0));
    cameraControls = new OrbitControls(camera, renderer.domElement);
    cameraControls.enableDamping = true;


    // CAMERA2 (Top View)
    aspectRatio = window.innerWidth/2 / window.innerHeight;
    camera2 = new THREE.PerspectiveCamera(fovy, aspectRatio, nearPlane, farPlane);
    camera2.position.set(0, 500, 0);
    camera2.lookAt(new THREE.Vector3(0,0,0));
    camera2.up.set(0,0,1);

    aspectRatio = window.innerWidth/2 / window.innerHeight;
    camera3 = new OrbitalCamera(fovy, aspectRatio, nearPlane, farPlane);
            
    // MODEL
    // GEOMETRY
    let boxGeom = new THREE.BoxGeometry()

    // MATERIAL
    let texture1 = new THREE.TextureLoader().load("/img/space.jpeg");
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

    //LIGHT
    let light = new THREE.PointLight( new THREE.Color("white"), 1.5, 10000, 2);
    light.position.set( 0, 0, 0 );
    light.castShadow = true;
    scene.add( light );
    let pointLightHelper = new THREE.PointLightHelper( light, 100 );
    scene.add(pointLightHelper);


    // OPCION PARA LOS PLANETAS -- DATOS REALES ESCALADOS

    //SOL
    sol = new Planet(109, "/img/Sun.jpeg", 0.03333, 0, 0, 0, 0, "sol");
    scene.add(sol);

    //Mercurio
    mercurio = new Planet(0.383, "img/Mercury.jpeg", 1.6, 4.14, 0.38, 0, 0, "mercurio");
    scene.add(mercurio);

    //Venus
    venus = new Planet(.95, "/img/Venus.jpeg", 1.78, 1.6, 0.72, 0 ,0, "venus");
    scene.add(venus);

    //Tierra 
    tierra = new Planet(1, "/img/Earth.jpeg", 1, 1, 1, 0, 0, "tierra");
    scene.add(tierra); 

    //Marte
    marte = new Planet(.533, "/img/Mars.jpeg", 0.8082, 0.53, 1.52, 0 ,0, "marte");
    scene.add(marte);

    //Júpiter
    jupiter = new Planet(11.21, "/img/Jupiter.jpeg", 0.439, 0.084, 5.20, 0 ,0, "jupiter");
    scene.add(jupiter);

    //Saturno
    saturno = new Planet(8.52, "/img/Saturn.jpeg", .3254, 0.034, 9.58, 0 ,0, "saturno");
    scene.add(saturno);

    //Urano
    urano = new Planet(4, "/img/Uranus.jpeg", .229, 0.012, 19.14, 0 ,0, "urano");
    scene.add(urano);

    //Neptuno la distancia real debería de ser 30.20 pero se sale del skybox
    neptuno = new Planet(3.88, "/img/Neptune.jpeg", .1823, 0.006, 20.20, 0 ,0, "neptuno");
    scene.add(neptuno);


    let worldAxes = new THREE.AxesHelper(100000);
    scene.add(worldAxes);

    planets = [sol, mercurio, venus, tierra, marte, jupiter, saturno, urano, neptuno]
    // var bbox = new THREE.Box3().setFromObject(planets[3]);
    // let xbar = (bbox.min.x + bbox.max.x)/2
    // let ybar = (bbox.min.y + bbox.max.y)/2
    // let zbar = (bbox.min.z + bbox.max.z)/2

    // let z1 = ((bbox.max.y - ybar) / Math.tan(fovy/2 * Math.PI/ 180)) + bbox.max.z; 
    // let z2 = ((bbox.max.x - xbar) / Math.tan(fovy/2 * Math.PI/ 180)) + bbox.max.z;

    // camera3.position.set(xbar, ybar, Math.max(z1, z2) * 2);
    // camera3.lookAt(xbar, ybar, zbar);
    camera3.focusObj(planets[follow]);

    // GUI
    gui = new dat.GUI();
    gui.close();

    let closeUps = {
        cuTierra: function(){
            follow = 3
            camera.position.set(tierra.position.x,tierra.position.y, tierra.position.z+3);
            camera.up = new THREE.Vector3(0,1,0);
            camera.lookAt(new THREE.Vector3(tierra.position.x,tierra.position.y,tierra.position.z));
            cameraControls.target.set(tierra.position.x,tierra.position.y,tierra.position.z);
            camera_dif = 3;

            // Camera 3
            camera3.focusObj(planets[follow]);
        },
        cuMercurio: function(){
            camera.position.set(mercurio.position.x,mercurio.position.y, mercurio.position.z+3);
            camera.up = new THREE.Vector3(0,1,0);
            camera.lookAt(new THREE.Vector3(mercurio.position.x,mercurio.position.y,mercurio.position.z));
            cameraControls.target.set(mercurio.position.x,mercurio.position.y,mercurio.position.z);
            follow = 1;   
            camera_dif = 3;         

            // Camera 3
            camera3.focusObj(planets[follow]);
        },
        cuVenus: function(){
            camera.position.set(venus.position.x,venus.position.y, venus.position.z+3);
            camera.up = new THREE.Vector3(0,1,0);
            camera.lookAt(new THREE.Vector3(venus.position.x,venus.position.y,venus.position.z));
            cameraControls.target.set(venus.position.x,venus.position.y,venus.position.z);
            follow = 2;
            camera_dif = 3;

            // Camera 3
            camera3.focusObj(planets[follow]);
        },
        cuMarte: function(){
            camera.position.set(marte.position.x,marte.position.y, marte.position.z+3);
            camera.up = new THREE.Vector3(0,1,0);
            camera.lookAt(new THREE.Vector3(marte.position.x,marte.position.y,marte.position.z));
            cameraControls.target.set(marte.position.x,marte.position.y,marte.position.z);
            follow = 4;
            camera_dif = 3;

            // Camera 3
            camera3.focusObj(planets[follow]);
        },
        cuJupiter: function(){
            camera.position.set(jupiter.position.x,jupiter.position.y, jupiter.position.z+20);
            camera.up = new THREE.Vector3(0,1,0);
            camera.lookAt(new THREE.Vector3(jupiter.position.x,jupiter.position.y,jupiter.position.z));
            cameraControls.target.set(jupiter.position.x,jupiter.position.y,jupiter.position.z);
            follow = 5;
            camera_dif = 20;

            // Camera 3
            camera3.focusObj(planets[follow]);
        },
        cuSaturno: function(){
            camera.position.set(saturno.position.x,saturno.position.y, saturno.position.z+20);
            camera.up = new THREE.Vector3(0,1,0);
            camera.lookAt(new THREE.Vector3(saturno.position.x,saturno.position.y,saturno.position.z));
            cameraControls.target.set(saturno.position.x,saturno.position.y,saturno.position.z);
            follow =6;
            camera_dif = 20;

            // Camera 3
            camera3.focusObj(planets[follow]);
        },
        cuUrano: function(){
            camera.position.set(urano.position.x,urano.position.y, urano.position.z+10);
            camera.up = new THREE.Vector3(0,1,0);
            camera.lookAt(new THREE.Vector3(urano.position.x,urano.position.y,urano.position.z));
            cameraControls.target.set(urano.position.x,urano.position.y,urano.position.z);
            follow = 7;
            camera_dif = 10;

            // Camera 3
            camera3.focusObj(planets[follow]);
        },
        cuNeptuno: function(){
            camera.position.set(neptuno.position.x,neptuno.position.y, neptuno.position.z+5);
            camera.up = new THREE.Vector3(0,1,0);
            camera.lookAt(new THREE.Vector3(neptuno.position.x,neptuno.position.y,neptuno.position.z));
            cameraControls.target.set(neptuno.position.x,neptuno.position.y,neptuno.position.z);
            follow = 8;
            camera_dif = 5;

            // Camera 3
            camera3.focusObj(planets[follow]);
        },

    }

    let moves = {
        rota: false,
        trasla: false
    }
    let helpers = gui.addFolder("Helpers");
    helpers.add(worldAxes, "visible").name("World Axes").setValue(false).listen().onChange(function(value) {
 
    });
    helpers.add(pointLightHelper, "visible").name("Point Light").setValue(false).listen().onChange(function(value) {
 
    });
    

    
    card = document.getElementsByClassName("card")[0];
    let acercamiento = gui.addFolder("Vista")
    acercamiento.add(closeUps, "cuTierra").name("Tierra").listen().onChange(function(value) {
        updateCard("Tierra", "Nuestro hogar, el planeta Tierra, es un planeta terrestre y rocoso. Tiene una superficie sólida y activa, con montañas, valles, cañones, llanuras y mucho más. La Tierra es especial porque es un planeta océano, ya que el agua cubre el 70% de su superficie.  <br><br>Nuestra atmósfera está compuesta, en gran parte, por nitrógeno. También tiene mucho oxígeno, que nos permite respirar. Además, nos protege de los meteoroides que se acercan a la Tierra, la mayoría de los cuales se desintegran en nuestra atmósfera antes de llegar a la superficie en forma de meteoritos.  <br><br>La Tierra es el único planeta que tiene solo una luna.  <br><br>La Tierra tiene muchos satélites que la observan y la estudian.  <br><br>La Tierra es el tercer planeta desde el Sol en nuestro sistema solar. Así, nuestros vecinos más cercanos son Venus y Marte.  "
        , "https://es.wikipedia.org/wiki/Tierra");
        toggleCard();
    });
    acercamiento.add(closeUps, "cuMercurio").name("Mercurio").listen().onChange(function(value) {
        updateCard("Mercurio", "Mercurio es el planeta más pequeño de nuestro sistema solar. Simplemente, es un poco más grande que la Luna de la Tierra. Es el planeta más cercano al Sol, pero no es realmente el más cálido, Venus es el más cálido.<br><br>Junto con Venus, la Tierra y Marte, Mercurio es uno de los planetas rocosos. Tiene una superficie sólida que está cubierta de cráteres. Tiene una atmósfera delgada y no tiene ninguna luna. A Mercurio le gusta simplificar las cosas.<br><br>Este planeta pequeño da vueltas lentamente comparado con la Tierra, por lo tanto, un día dura un largo tiempo. A Mercurio le lleva 59 días de la Tierra hacer una rotación completa. Un año en Mercurio pasa rápido. Debido a que es el planeta más cercano al Sol, no le lleva mucho tiempo cubrir toda la circunferencia. Completa una vuelta alrededor del Sol en solo 88 días de la Tierra.<br><br>Se conoce a Mercurio desde la antigüedad, ya que es visible sin necesidad de usar telescopios avanzados."
        , "https://es.wikipedia.org/wiki/Mercurio_(planeta)");
        toggleCard();
    });
    acercamiento.add(closeUps, "cuVenus").name("Venus").listen().onChange(function(value) {
        updateCard("Venus", "Aunque Venus no es el planeta más cercano al Sol, es el más caliente. Tiene una atmósfera densa, llena de dióxido de carbono, que provoca el efecto invernadero, y de nubes compuestas de ácido sulfúrico. Los gases atrapan el calor y mantienen a Venus bien calentito. De hecho, hace tanto calor en Venus que metales como el plomo serían charcos de metal fundido.<br><br>Venus se ve como un planeta muy activo. Tiene montañas y volcanes. Venus es similar a la Tierra, en tamaño. La Tierra es solo un poco más grande.<br><br>Debido a que está tan cerca del Sol, un año pasa muy rápido. Venus tarda 225 días terrestres en dar toda la vuelta alrededor del Sol. Esto significa que, en Venus, un día es un poco más largo que un año.<br><br>Se conoce su existencia desde la antigüedad porque no es necesario usar telescopios avanzados para verlo.<br><br>Ha recibido visitas de varias naves espaciales: Mariner 2, Mariner 5, Mariner 10, Pioneer Venus 1, Pioneer Venus 2 y un orbitador llamado Magallanes."
        , "https://es.wikipedia.org/wiki/Venus_(planeta)");
        toggleCard();
    });
    acercamiento.add(closeUps, "cuMarte").name("Marte").listen().onChange(function(value) {
        updateCard("Marte", "Marte es un planeta desértico y frío. Es la mitad del tamaño de la Tierra, y también recibe el nombre de \"planeta rojo\". Es rojo por el hierro oxidado que tiene en el suelo.  <br><br>Como la Tierra, Marte tiene estaciones, casquetes polares, volcanes, cañones y clima. Tiene una atmósfera poco densa hecha de dióxido de carbono, nitrógeno y argón.  <br><br>Hay signos de antiguas inundaciones en Marte, pero ahora el agua existe principalmente en su polvo helado y sus nubes delgadas. En algunas laderas marcianas, se han encontrado pruebas de agua líquida salada.  <br></br>Los científicos quieren saber si Marte podría haber tenido seres vivos en el pasado. También quieren saber si Marte podría albergar vida ahora o en el futuro.  <br></br>Se conoce su existencia desde la antigüedad porque no es necesario usar los telescopios más avanzados para verlo.  <br></br>Varias misiones han visitado el planeta rojo, y es el único planeta por donde han circulado los rovers, que se han paseado por Marte tomando fotos y haciendo mediciones." 
        , "https://es.wikipedia.org/wiki/Marte_(planeta)");
        toggleCard();
    });
    acercamiento.add(closeUps, "cuJupiter").name("Júpiter").listen().onChange(function(value) {
        updateCard("Júpiter", "Júpiter es el planeta más grande de nuestro sistema solar. Es parecido a una estrella, pero nunca llegó a ser lo suficientemente grande como para empezar a arder. Está cubierto de rayas de nubes arremolinadas. Tiene fuertes tormentas como la Gran Mancha Roja, que hace cientos de años que dura. Júpiter es un gigante hecho de gas, y no tiene una superficie sólida, pero puede tener un núcleo interno sólido de aproximadamente el tamaño de la Tierra. Júpiter también tiene anillos, pero son demasiado tenues para verlos muy bien.  <br><br>Tiene 79 lunas confirmadas.  <br><br>Se sabe de su existencia desde la antigüedad, ya que se puede ver sin necesidad de usar telescopios avanzados.  <br><br>Ha recibido vistas de varias naves, orbitadores y sondas, como los Pioneer 10 y 11, los Voyager 1 and 2, Cassini, New Horizons y Juno.  " 
        , "https://es.wikipedia.org/wiki/J%C3%BApiter_(planeta)");
        toggleCard();
    });
    acercamiento.add(closeUps, "cuSaturno").name("Saturno").listen().onChange(function(value) {
        updateCard("Saturno", "Saturno no es el único planeta que tiene anillos, pero definitivamente tiene los más bellos. Los anillos que vemos están compuestos por grupos de pequeños aros que rodean a Saturno. Están hechos de pedazos de hielo y roca. Como Júpiter, Saturno es una pelota de hidrógeno y helio, en gran parte.  <br><br>Cuando Galileo Galilei vio a Saturno a través de un telescopio en el siglo XVII, no estaba seguro de lo que estaba viendo. Al principio, creyó que estaba mirando tres planetas, o un planeta con asas. Ahora, sabemos que esas \"asas\" eran los anillos de Saturno.  <br><br>Tiene más de 50 lunas, falta confirmar la existencia de varias lunas más.  <br><br>Cuatro naves robotizadas han visitado Saturno: Pioneer 11, Cassini y Voyager 1 and 2." 
        , "https://es.wikipedia.org/wiki/Saturno_(planeta)");
        toggleCard();
    });
    acercamiento.add(closeUps, "cuUrano").name("Urano").listen().onChange(function(value) {
        updateCard("Urano", "Urano está compuesto de agua, metano y amoniaco sobre un pequeño centro rocoso. Su atmósfera está hecha de hidrógeno y helio, como Júpiter y Saturno, pero además contiene metano. El metano es lo que le da a Urano el color azul.  <br><br>Urano también tiene anillos tenues. Los anillos internos son angostos y oscuros. Los anillos externos tienen colores vivos y son más fáciles de ver. Como Venus, Urano rota en dirección opuesta a la de la mayoría de los otros planetas. Y, a diferencia de cualquier otro planeta, Urano rota de lado.  <br><br>Se han identificado 27 lunas <br><br>Urano fue descubierto en 1781 por William Herschel, en el Reino Unido.  <br><br>Solo ha recibido la visita del Voyager 2." 
        , "https://es.wikipedia.org/wiki/Urano_(planeta)");
        toggleCard();
    });
    acercamiento.add(closeUps, "cuNeptuno").name("Neptuno").listen().onChange(function(value) {
        updateCard("Neptuno", "Neptuno es oscuro, frío y muy ventoso. Es el último de los planetas de nuestro sistema solar. Está más de 30 veces más lejos del Sol que la Tierra. Neptuno es muy parecido a Urano. Está compuesto de una espesa mezcla de agua, amoniaco y metano sobre un centro sólido del tamaño de la Tierra. Su atmósfera se compone de hidrógeno, helio y metano. El metano le da a Neptuno el mismo color azul de Urano. Neptuno tiene seis anillos que no se ven fácilmente.  <br><br>Tiene 14 lunas.  <br><br>Fue descubierto en 1846 por Urbain Le Verrier, John Couch Adams y Johann Galle.  <br><br>Solo lo ha visitado el Voyager 2.  " 
        , "https://es.wikipedia.org/wiki/Neptuno_(planeta)");
        toggleCard();
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

    if(!multiview) {
        // CAMERA1
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        // origin, width, height
        renderer.setViewport(0,0, window.innerWidth, window.innerHeight); 
        renderer.setScissor(0,0, window.innerWidth, window.innerHeight); 
        renderer.render(scene, camera);
    } 
    else {
        // CAMERA1
        camera3.aspect = window.innerWidth/2 / window.innerHeight;
        camera3.updateProjectionMatrix();
        renderer.setViewport(0,0, window.innerWidth/2 - 10, window.innerHeight); 
        renderer.setScissor(0,0, window.innerWidth/2 - 10, window.innerHeight); 
        renderer.render(scene, camera3);

        // 
        camera.aspect = window.innerWidth/2 / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setViewport(window.innerWidth/2 + 10, 0, window.innerWidth/2 - 10, window.innerHeight);
        renderer.setScissor(window.innerWidth/2 + 10, 0, window.innerWidth/2 - 10, window.innerHeight);
        renderer.render(scene, camera);
    }

    updateScene();
    stats.end();
    stats.update();
    requestAnimationFrame(renderLoop);
}

function updateScene() {
    cameraControls.update();

    //rotation
    // camera3.orbit(planets[follow], theta);
    // theta += 0.01;


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
            // camera.position.set(planets[follow].position.x, planets[follow].position.y, planets[follow].position.z + camera_dif);
            // camera.up = new THREE.Vector3(0,1,0);
            // camera.lookAt(new THREE.Vector3(planets[follow].position.x, planets[follow].position.y, planets[follow].position.z));
            // cameraControls.target.set(planets[follow].position.x, planets[follow].position.y, planets[follow].position.z);
        }
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

document.addEventListener("keydown", (ev) => {
    if(ev.key == " ") {
        multiview = !multiview;
        document.getElementsByClassName("view-hud")[0].classList.toggle("show-view-hud");
    }
})

document.querySelector(".close").addEventListener("click", toggleCard);

function toggleCard() {
    card.classList.toggle("show-card");
}

function updateCard(title, text, link) {
    if(window.getComputedStyle(card).getPropertyValue("visibility") === "visible") toggleCard();
    document.getElementsByClassName("card-title")[0].innerHTML = title;
    document.getElementsByClassName("card-text")[0].innerHTML = text;
    document.getElementsByClassName("card-link")[0].setAttribute("href", link);
}

