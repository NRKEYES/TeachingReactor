// External Dependancies
import { OBJLoader } from "/JS/three/examples/jsm/loaders/OBJLoader.js";
import Stats from '/JS/three/examples/jsm/libs/stats.module.js';
import { BufferGeometryUtils } from "/JS/three/examples/jsm/utils/BufferGeometryUtils.js";
import { OrbitControls } from "/JS/three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "/JS/three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "/JS/three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "/JS/three/examples/jsm/postprocessing/ShaderPass.js";
import { OutlinePass } from "/JS/three/examples/jsm/postprocessing/OutlinePass.js";
import { FXAAShader } from "/JS/three/examples/jsm/shaders/FXAAShader.js";

import { GammaCorrectionShader } from '/JS/three/examples/jsm/shaders/GammaCorrectionShader.js';
import { ColorifyShader } from '/JS/three/examples/jsm/shaders/ColorifyShader.js';
import { FilmPass } from '/JS/three/examples/jsm/postprocessing/FilmPass.js';

// import { BloomPass } from './jsm/postprocessing/BloomPass.js';
// import { FilmPass } from './jsm/postprocessing/FilmPass.js';
// import { DotScreenPass } from './jsm/postprocessing/DotScreenPass.js';
// import { MaskPass, ClearMaskPass } from './jsm/postprocessing/MaskPass.js';
// import { TexturePass } from './jsm/postprocessing/TexturePass.js';

// import { BleachBypassShader } from './jsm/shaders/BleachBypassShader.js';
// import { HorizontalBlurShader } from './jsm/shaders/HorizontalBlurShader.js';
// import { VerticalBlurShader } from './jsm/shaders/VerticalBlurShader.js';
// import { SepiaShader } from './jsm/shaders/SepiaShader.js';
// import { VignetteShader } from './jsm/shaders/VignetteShader.js';



// Internal Dependancies
import Molecule from "/JS/Molecule.js";

let sphere_quality = 20;

var COLORS = {
    H: 0xc0c0c0,
    C: 0x000000,
    Au: 0xd4af37,
    Al: 0x00334d,
    V: 0xff26d4,
    O: 0xff0000,
    N: 0x0033cc
};

// In nanometers
var atom_radius = {
    // Van der walls from wiki https://en.wikipedia.org/wiki/Van_der_Waals_radius
    H: 0.12,
    C: 0.17,
    Au: 0.166,
    Al: 0.184,
    V: 0.152,
    O: 0.152,
    N: 0.155
};


class Visualization {
    constructor(incoming_data, chamber_edge_length) {

        this.preferences = {
            grid_cube_visible: false,
            axis_visible: false,
            colunm_visible: true,
            animate: true,
            auto_rotate: true,
            initial_camera_displacement_multiplier: 1.5,
        }


        // Initialize Ammo engine
        Ammo();

        this.height_for_3d = document.getElementById("Visualization").clientHeight;
        this.width_for_3d = document.getElementById("Visualization").clientWidth;
        this.background_and_emis = 0x00fffa;

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(this.background_and_emis, 0.0);
        this.renderer.setSize(this.width_for_3d, this.height_for_3d);
        this.renderer.physicallyCorrectLights = true;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.bias = 0.0001;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        // this.renderer.gammaOutput = true;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.gammaFactor = 2.2;
        // this.renderer.shadowMap.enabled = true;
        // this.renderer.toneMappingExposure = 1.0;

        this.container = document.getElementById("Visualization");
        this.container.appendChild(this.renderer.domElement);

        this.stats = new Stats();
        let stats_block = document.getElementById("body").appendChild(this.stats.dom);
        stats_block.style.cssText = ' ';
        stats_block.style.position = 'absolute';
        stats_block.style.right = 0;
        stats_block.style.bottom = 0;

    }

    init(incoming_data, chamber_edge_length) {
        this.should_animate = this.preferences.animate;
        this.data = incoming_data;
        this.chamber_edge_length = chamber_edge_length;

        //Engine Variables
        this.height_for_3d = document.getElementById("Visualization").clientHeight;
        this.width_for_3d = document.getElementById("Visualization").clientWidth;
        this.background_and_emis = 0x00fffa;
        this.clock = new THREE.Clock();
        this.tmpTrans = new Ammo.btTransform();
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.new_molecule_glow_time = .5;

        this.rigidBodies = []; // for ammo
        this.selectedObjects = []; // for glows
        this.impactObjects = []; // for glows
        this.newObjects = []; // for glows
        this.line = [];
        this.grid_cube = [];
        this.helper_objects = [];
        this.column = [];


        this.physicsWorld;
        this.setupPhysicsWorld();

        // for glow
        this.outline_params = {
            edgeStrength: 20,
            edgeGlow: 2,
            edgeThickness: 1.0,
            pulsePeriod: 1.0,
            usePatternTexture: false
        };





        for (name in this.data) {
            this.data[name].instances = [];
        }


        this.composer = new EffectComposer(this.renderer);
        // Setup scene, camera, lighting
        this.scene = new THREE.Scene();
        this.scene.position.x = 0;
        this.scene.position.y = 0;
        this.scene.position.z = 0;

        // No success with fog really adding anything
        // this.scene.fog = new THREE.FogExp2(0xefd1b5, .035);
        // this.scene.fog = new THREE.Fog(0xefd1b5, 1, 1000);


        //setup the initial camera conditions
        this.camera = new THREE.PerspectiveCamera(
            45,
            this.width_for_3d / this.height_for_3d,
            0.1,
            1000
        );
        this.camera.position.x = 0 // -left to +right
        this.camera.position.y = 0 // +top to -bottom
        this.camera.position.z = this.chamber_edge_length * this.preferences.initial_camera_displacement_multiplier; // + towards, me - away
        this.camera.lookAt(this.scene.position); // Not totally sure if this is helping orient the camera at init time.

        //setup the camera controler
        // loosely alphabetical
        // a lot of default values, here for completeness
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        this.controls.autoRotate = this.preferences.auto_rotate;
        this.controls.autoRotateSpeed = 4; // default is 2

        this.controls.dampingFactor = 1.0; // TODO play with this more to see if there is an ideal value

        this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
        this.controls.enableKeys = true;
        this.controls.enableZoom = true;
        this.controls.enablePan = true;

        this.controls.keyPanSpeed = 14; // default is 7
        this.controls.keys = {
            LEFT: 37, //left arrow
            UP: 38, // up arrow
            RIGHT: 39, // right arrow
            BOTTOM: 40 // down arrow
        }

        // this.controls.maxAzimuthAngle = Math.; //left and right stops
        // this.controls.minAzimuthAngle = -Math.PI; //Infinity was default

        this.controls.maxPolarAngle = Math.PI; // top and bottom stops
        this.controls.minPolarAngle = -Math.PI;

        this.controls.maxDistance = this.chamber_edge_length * 4;
        this.controls.minDistance = 0;

        this.controls.mouseButtons = {
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN
        }

        this.controls.screenSpacePanning = true;
        this.controls.target = this.scene.position;

        this.controls.zoomSpeed = .5; // default is 1
        // END CONTROL INIT




        this.renderPass = new RenderPass(
            this.scene,
            this.camera
        );
        this.impactPass = new OutlinePass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            this.scene,
            this.camera
        );
        this.selectedPass = new OutlinePass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            this.scene,
            this.camera
        );
        this.newbornPass = new OutlinePass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            this.scene,
            this.camera
        );
        this.effectFXAA = new ShaderPass(FXAAShader);
        this.effectFXAA.uniforms["resolution"].value.set(
            1 / window.innerWidth,
            1 / window.innerHeight
        );

        this.renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(this.renderPass);
        // this.composer.addPass(this.impactPass);
        this.composer.addPass(this.selectedPass);
        this.composer.addPass(this.newbornPass);
        this.composer.addPass(this.effectFXAA);




        for (name in this.data) {
            this.generate_species(name);
            for (let i = 0; i < this.data[name].count.slice(-1)[0]; i++) {
                this.add_molecule(name);
            }
        }

        this.configure_outline_passes();
        this.createLights();
        this.create_chamber();
        this.create_column();
        this.helper_show_axis();

        if (!this.preferences.axis_visible) this.toggle_axis();
        if (!this.preferences.grid_cube_visible) this.toggle_grid_visability();
        // if (!this.preferences.colunm_visible) this.g();


        this.animate();
    }

    setupPhysicsWorld() {
        this.collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
        this.dispatcher = new Ammo.btCollisionDispatcher(
            this.collisionConfiguration
        );
        this.broadphase = new Ammo.btDbvtBroadphase();
        this.solver = new Ammo.btSequentialImpulseConstraintSolver();
        this.overlappingPairCache = new Ammo.btDbvtBroadphase();
        this.physicsWorld = new Ammo.btDiscreteDynamicsWorld(
            this.dispatcher,
            this.overlappingPairCache,
            this.solver,
            this.collisionConfiguration
        );

        // Currently I don't want gravity.
        this.physicsWorld.setGravity(new Ammo.btVector3(0, 0, 0));
    }

    configure_outline_passes() {
        // Configure outline shader
        this.impactObjects = [];
        this.impactPass.selectedObjects = this.impactObjects;
        this.impactPass.renderToScreen = true;
        this.impactPass.edgeStrength = this.outline_params.edgeStrength;
        this.impactPass.edgeGlow = this.outline_params.edgeGlow;
        this.impactPass.pulsePeriod = this.outline_params.pulsePeriod;
        this.impactPass.visibleEdgeColor.set('red');
        this.impactPass.hiddenEdgeColor.set('white');

        this.selectedObjects = [];
        this.selectedPass.selectedObjects = this.selectedObjects;
        this.selectedPass.renderToScreen = true;
        this.selectedPass.edgeStrength = this.outline_params.edgeStrength;
        this.selectedPass.edgeGlow = this.outline_params.edgeGlow;
        this.selectedPass.pulsePeriod = this.outline_params.pulsePeriod;
        this.selectedPass.visibleEdgeColor.set('green');
        this.selectedPass.hiddenEdgeColor.set('white');


        this.newObjects = [];
        this.newbornPass.selectedObjects = this.newObjects;
        this.newbornPass.renderToScreen = true;
        this.newbornPass.edgeStrength = this.outline_params.edgeStrength;
        this.newbornPass.edgeGlow = this.outline_params.edgeGlow;
        this.newbornPass.pulsePeriod = this.outline_params.pulsePeriod;
        this.newbornPass.visibleEdgeColor.set('blue');
        this.newbornPass.hiddenEdgeColor.set('white');
    }

    createLights() {
        // A hemisphere light is a gradient colored light;
        // the first parameter is the sky color, the second parameter is the ground color,
        // the third parameter is the intensity of the light

        let distance_from_center = this.chamber_edge_length * .48

        this.hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, .5);

        // A directional light shines from a specific direction.
        // It acts like the sun, that means that all the rays produced are parallel.
        this.shadowLight_top = new THREE.DirectionalLight(0xffffff, 0.5);
        this.shadowLight_x = new THREE.DirectionalLight(0xffffff, 0.5);
        this.shadowLight_bottom = new THREE.DirectionalLight(0xffffff, 0.5);
        this.shadowLight_z = new THREE.DirectionalLight(0xffffff, 0.5);

        // // Set the direction of the light
        this.shadowLight_top.position.set(
            0,
            distance_from_center,
            0,
        );
        this.shadowLight_bottom.position.set(
            0, -distance_from_center,
            0
        );
        this.helper_show_coordinate(this.shadowLight_bottom.position)


        this.shadowLight_x.position.set(
            this.chamber_edge_length / 2,
            this.chamber_edge_length / 2,
            0
        );

        this.shadowLight_z.position.set(
            0,
            this.chamber_edge_length / 2,
            this.chamber_edge_length
        );
        // Allow shadow casting
        this.shadowLight_top.castShadow = true;
        this.shadowLight_bottom.castShadow = true;

        this.shadowLight_x.castShadow = true;

        this.shadowLight_z.castShadow = true;

        // define the visible area of the projected shadow
        // this.shadowLight.shadow.camera.left = -this.chamber_edge_length;
        // this.shadowLight.shadow.camera.right = this.chamber_edge_length;
        // this.shadowLight.shadow.camera.top = this.chamber_edge_length;
        // this.shadowLight.shadow.camera.bottom = -this.chamber_edge_length;
        // this.shadowLight.shadow.camera.near = 1;
        // this.shadowLight.shadow.camera.far = 1000;

        // define the resolution of the shadow;
        // the higher the better,
        // but also the more expensive and less performant
        this.shadowLight_top.shadow.mapSize.width = 2048;
        this.shadowLight_top.shadow.mapSize.height = 2048;

        // to activate the lights, just add them to the scene
        this.scene.add(this.hemisphereLight);
        this.scene.add(this.shadowLight_top);
        this.scene.add(this.shadowLight_bottom);
        // this.scene.add(this.shadowLight_x);

        // this.scene.add(this.shadowLight_z);
    }

    generate_species(name) {
        let envMap = new THREE.TextureLoader().load("Images/envMap.png")
        let glassMap = new THREE.TextureLoader().load("Images/glassbw.jpg");

        // let envMap = new THREE.TextureLoader().load("Images/moon_1024.jpg");
        let normMap = new THREE.TextureLoader().load("Images/moon_1024.jpg");

        // let envMap = new THREE.TextureLoader().load("Images/ice-hr.jpg");
        // let normMap = new THREE.TextureLoader().load("Images/ice-hr.jpg");

        // let envMap = new THREE.TextureLoader().load("Images/Plastic_04_basecolor.jpg");
        // let normMap = new THREE.TextureLoader().load("Images/Plastic_04_normalOgl.jpg");

        let displacementMap = new THREE.TextureLoader().load("Images/Plastic_04_height.jpg");
        let roughness = new THREE.TextureLoader().load("Images/Plastic_04_roughness.jpg");
        envMap.mapping = THREE.SphericalReflectionMapping;

        let geometry = this.data[name].coords; // Setting up to import different geometries

        let materials = [];
        let mergedGeometry = [];
        // basic monochromatic energy preservation
        // let roughness = 0.4;
        let diffuseColor = new THREE.Color().setHSL(0.0, 0.0, 0.9);

        for (let i = 0; i < geometry.length; i++) {
            //For atom i set up correct material
            let material = new THREE.MeshPhysicalMaterial({
                // wireframe: true
                color: COLORS[geometry[i][0]],
                emissive: COLORS[geometry[i][0]],
                metalness: 0.0, // metalness: .9,
                roughness: 0.1, // roughness: roughness,
                reflectivity: 1.0,
                // color: diffuseColor,
                envMap: envMap,
                normalMap: normMap,
                roughnessMap: roughness,
                // displacementMap: displacementMap,
                normalScale: new THREE.Vector2(0.15, 0.15),
                // displacementScale: .04,
                clearcoatNormalMap: glassMap,
                premultipliedAlpha: true,
            });

            // let material = new THREE.MeshStandardMaterial({
            //     // wireframe: true
            //     color: COLORS[geometry[i][0]],
            //     emissive: COLORS[geometry[i][0]],


            //     map: new THREE.TextureLoader().load("Images/Plastic_04_basecolor.jpg"),
            //     envMap: envMap,
            //     emissiveMap: envMap,
            //     normalMap: normMap,
            //     displacementMap: new THREE.TextureLoader().load("Images/Plastic_04_height.jpg"),
            //     roughnessMap: new THREE.TextureLoader().load("Images/Plastic_04_roughness.jpg"),

            //     normalScale: new THREE.Vector2(0.15, 0.15),
            //     displacementScale: .1,

            //     // metalness: 0.0, // metalness: .9,
            //     // roughnq/ess: 0.5, // roughness: roughness,
            //     // reflectivity: 0.5,
            // });

            materials.push(material);

            // for atom I create the correct geometry
            // let sphereGeometry = new THREE.SphereGeometry(
            let sphereGeometry = new THREE.SphereBufferGeometry(
                atom_radius[geometry[i][0]],
                sphere_quality,
                sphere_quality
            );

            sphereGeometry.translate(
                geometry[i][1].x,
                geometry[i][1].y,
                geometry[i][1].z
            );

            mergedGeometry.push(sphereGeometry);
        }

        let geometry_complete = BufferGeometryUtils.mergeBufferGeometries(mergedGeometry, true)
        geometry_complete.computeBoundingSphere();
        geometry_complete.center();
        // This information is now stored in the main data structure.
        this.data[name]["graphics"] = {
            geom: new THREE.Geometry().fromBufferGeometry(geometry_complete),
            material: materials,
        };

        //Convert Geometry into a triangle mesh that can be used in ammo for colision
        let geom = new THREE.Geometry().fromBufferGeometry(geometry_complete)
        geom.mergeVertices(); // duplicate vertices are created with fromBufferGeometry()
        const vertices = geom.vertices;
        const scale = [1, 1, 1];

        const trig_mesh = new Ammo.btTriangleMesh(true, true);
        trig_mesh.setScaling(new Ammo.btVector3(scale[0], scale[1], scale[2]));
        for (let i = 0; i < geom.vertices.length; i = i + 3) {
            trig_mesh.addTriangle(
                new Ammo.btVector3(vertices[i].x, vertices[i].y, vertices[i].z),
                new Ammo.btVector3(vertices[i + 1].x, vertices[i + 1].y, vertices[i + 1].z),
                new Ammo.btVector3(vertices[i + 2].x, vertices[i + 2].y, vertices[i + 2].z),
                true
            );

        }
        geom.computeBoundingSphere();
        geom.center();
        geom.verticesNeedUpdate = true;

        //store it for everyone!
        this.data[name]["physics"] = {
            geom: geom
        };





        for (let geo of mergedGeometry) {
            geo.dispose();
        }

        for (let mat of materials) {
            mat.dispose();
        }
    }

    add_molecule(name,
        starting_info = {
            starting_position: {
                x: d3.randomUniform(-this.chamber_edge_length / 2, this.chamber_edge_length / 2)(),
                y: d3.randomUniform(-this.chamber_edge_length / 2, this.chamber_edge_length / 2)(),
                z: d3.randomUniform(-this.chamber_edge_length / 2, this.chamber_edge_length / 2)()
            },
            velocity: {
                x: d3.randomNormal(0.0)(1),
                y: d3.randomNormal(0.0)(1),
                z: d3.randomNormal(0.0)(1)
            },
            rotational_velocity: {
                x: d3.randomNormal(0.0)(3.14),
                y: d3.randomNormal(0.0)(3.14),
                z: d3.randomNormal(0.0)(3.14)
            }
        }) {


        // With starting info create a Molecule Instance
        let temp = new Molecule(
            name,
            this.data[name].mass,
            this.data[name].coords,
            this.data[name].graphics.geom,
            this.data[name].graphics.material,
            this.data[name].physics.geom,
            starting_info.starting_position,
            starting_info.velocity,
            starting_info.rotational_velocity
        );

        try {
            this.data[name].instances.push(temp);
        } catch (err) {
            console.log(err)
        }

        this.scene.add(temp.mesh);
        //add to simulation
        this.physicsWorld.addRigidBody(temp.mesh.userData.physicsBody);
        //add to update list
        this.rigidBodies.push(temp.mesh);
        // add to glow list
        this.newObjects.push(temp.mesh);

        return temp.mesh.uuid;
        // console.log(this.data[name])
    }

    create_chamber() {
        console.log(this.chamber_edge_length);
        // Set up local
        let gridHelper = null;
        let material = new THREE.LineBasicMaterial({
            color: 'black',
            opacity: .3,
        });
        let edge = this.chamber_edge_length * 2;
        let divisions = this.chamber_edge_length;

        let grid_color_main = 'gray';
        let grid_color_secondary = 'grey';

        let mass = 0;
        let pos = new THREE.Vector3();
        let dim = new THREE.Vector3();
        let thickness = this.chamber_edge_length / 2;
        console.log(thickness)
        console.table(pos)
            //X - left right
        dim.set(
            thickness,
            edge,
            edge,
        );
        console.log(this.chamber_edge_length);
        console.log((this.chamber_edge_length + thickness) / (-2.0));
        pos.set(
            ((this.chamber_edge_length + thickness) / (-2.0)),
            0,
            0
        );
        console.table(pos)
        this.createRigidBody(pos, dim);
        pos.setX((this.chamber_edge_length + thickness) / (2));
        console.table(pos)
        this.createRigidBody(pos, dim);
        console.table(pos)

        gridHelper = new THREE.GridHelper(this.chamber_edge_length, divisions, grid_color_main, grid_color_secondary);
        gridHelper.position.copy(pos.setX((this.chamber_edge_length) / (-2)));
        gridHelper.geometry.rotateZ(Math.PI / 2);
        gridHelper.material = material;
        this.scene.add(gridHelper);
        this.grid_cube.push(gridHelper);

        gridHelper = new THREE.GridHelper(this.chamber_edge_length, divisions, grid_color_main, grid_color_secondary);
        gridHelper.position.copy(pos.setX((this.chamber_edge_length) / (2)));
        gridHelper.geometry.rotateZ(Math.PI / 2);
        gridHelper.material = material;
        this.scene.add(gridHelper);
        this.grid_cube.push(gridHelper);

        //Y - bottom top
        dim.set(
            edge,
            thickness,
            edge,
        );
        pos.set(
            0,
            (this.chamber_edge_length + thickness) / (-2),
            0,
        );
        this.createRigidBody(pos, dim);
        pos.setY((this.chamber_edge_length + thickness) / (2));
        this.createRigidBody(pos, dim);

        gridHelper = new THREE.GridHelper(this.chamber_edge_length, divisions, grid_color_main, grid_color_secondary);
        gridHelper.position.copy(pos.setY((this.chamber_edge_length) / (-2)));
        gridHelper.material = material;
        this.scene.add(gridHelper);
        this.grid_cube.push(gridHelper);

        gridHelper = new THREE.GridHelper(this.chamber_edge_length, divisions, grid_color_main, grid_color_secondary);
        gridHelper.position.copy(pos.setY((this.chamber_edge_length) / (2)));
        gridHelper.material = material;
        this.scene.add(gridHelper);
        this.grid_cube.push(gridHelper);

        //Z - back front
        dim.set(
            edge,
            edge,
            thickness,
        );
        pos.set(
            0,
            0,
            (this.chamber_edge_length + thickness) / (-2),
        );
        this.createRigidBody(pos, dim);
        pos.setZ((this.chamber_edge_length + thickness) / (2));
        this.createRigidBody(pos, dim);

        gridHelper = new THREE.GridHelper(this.chamber_edge_length, divisions, grid_color_main, grid_color_secondary);
        gridHelper.position.copy(pos.setZ((this.chamber_edge_length) / (-2)));
        gridHelper.geometry.rotateX(Math.PI / 2);
        gridHelper.material = material;
        this.scene.add(gridHelper);
        this.grid_cube.push(gridHelper);

        gridHelper = new THREE.GridHelper(this.chamber_edge_length, divisions, grid_color_main, grid_color_secondary);
        gridHelper.position.copy(pos.setZ((this.chamber_edge_length) / (2)));
        gridHelper.geometry.rotateX(Math.PI / 2);
        gridHelper.material = material;
        this.scene.add(gridHelper);
        this.grid_cube.push(gridHelper);





    }

    createRigidBody(pos = new THREE.Vector3(0, 0, 0), dim = new THREE.Vector3(1, 1, 1), mass = 0) {

        // Actual ammo code
        let transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
        let motionState = new Ammo.btDefaultMotionState(transform);

        // The .5 multipliers appear to be essential.... not able to find a documented reason
        let colShape = new Ammo.btBoxShape(new Ammo.btVector3(dim.x * 0.5, dim.y * 0.5, dim.z * 0.5));
        colShape.setMargin(0.05);

        let localInertia = new Ammo.btVector3(0, 0, 0);
        colShape.calculateLocalInertia(mass, localInertia);

        let rbInfo = new Ammo.btRigidBodyConstructionInfo(
            mass,
            motionState,
            colShape,
            localInertia
        );
        let body = new Ammo.btRigidBody(rbInfo);

        body.setFriction(0);
        body.setRestitution(1.0);
        body.setDamping(0.0, 0.0); // void 	setDamping (btScalar lin_damping, btScalar ang_damping)



        // for visualizaton purposes:
        let show_collision_volumes = false;
        if (show_collision_volumes) {

            let material = new THREE.MeshPhysicalMaterial({
                color: 'grey',
                emissive: 'grey',
                transparent: true,
                opacity: .2,
                reflectivity: 0.0,
                metalness: 0.0,
                roughness: 0.0
            });
            //BoxBufferGeometry(
            //  width: Float,   x
            //  height : Float, y
            //  depth : Float,  z
            //  widthSegments : Integer, heightSegments : Integer, depthSegments : Integer)
            let geometry = new THREE.BoxBufferGeometry(dim.x, dim.y, dim.z);


            let wall = new THREE.Mesh(geometry, material);
            wall.position.set(pos.x, pos.y, pos.z);
            this.scene.add(wall);
            // End geometry helper block

            wall.userData.physicsBody = body;

            // this.rigidBodies.push(wall)
            this.grid_cube.push(wall);

        }
        this.physicsWorld.addRigidBody(body);

    }

    create_column() {
        let column_height = 2 * this.chamber_edge_length;
        let column_dop = (this.chamber_edge_length + column_height) * .5;

        let ao = new THREE.TextureLoader().load("Images/Plastic_04_ambientocclusion.jpg");

        let basecolor = new THREE.TextureLoader().load("Images/Plastic_04_basecolor.jpg");
        let displacementMap = new THREE.TextureLoader().load("Images/Plastic_04_height.jpg");
        let envMap = new THREE.TextureLoader().load("Images/envMap.png")

        let normMap = new THREE.TextureLoader().load("Images/Plastic_04_normalOgl.jpg");

        let roughness = new THREE.TextureLoader().load("Images/Plastic_04_roughness.jpg");


        envMap.mapping = THREE.SphericalReflectionMapping;

        let material = new THREE.MeshStandardMaterial({
            // wireframe: true
            visible: this.preferences.colunm_visible,

            // alphaMap: ao,
            // aoMap: ao,
            // bumpMap: displacementMap,

            color: basecolor,
            emissive: basecolor,

            envMap: envMap,
            // normalMap: normMap,
            // roughnessMap: roughness,
            // displacementMap: displacementMap,
            // clearcoatNormalMap: basecolor,

            // normalScale: new THREE.Vector2(0.15, 0.15),
            // displacementScale: .04,

        });


        //BoxBufferGeometry(
        //  width: Float,   x
        //  height : Float, y
        //  depth : Float,  z
        //  widthSegments : Integer, heightSegments : Integer, depthSegments : Integer)
        let geometry = new THREE.BoxBufferGeometry(this.chamber_edge_length, column_height, this.chamber_edge_length);


        let column = new THREE.Mesh(geometry, material);
        column.position.set(0, column_dop, 0);
        column.castShadow = true;
        column.receiveShadow = true;
        this.column.push(column);
        this.scene.add(column);

        column = new THREE.Mesh(geometry, material);
        column.position.set(0, -column_dop, 0);
        column.castShadow = true;
        column.receiveShadow = true;
        this.column.push(column);
        this.scene.add(column);
    }

    add_to_pass(id, pass) {
        let object = this.scene.getObjectByProperty("uuid", id);
        pass.push(object);
    }

    remove_from_pass(id, pass) {


        if (id == 'all') {
            // pass.length = 0;
            pass.length = [];
            return;
        }

        for (let i = 0; i < pass.length; i++) {
            if (pass[i].uuid == id) {
                pass.splice(i, 1);
            }

        }

    }

    remove_from_scene(id) {
        let object = this.scene.getObjectByProperty("uuid", id);

        for (name in this.data) {
            for (let i = 0; i < this.data[name].instances.length; i++) {
                //for each instance of a species check for reaction

                if (this.data[name].instances[i].mesh.uuid == id) {
                    this.data[name].instances.splice(i, 1);
                }
            }
        }

        this.scene.remove(object);
        this.physicsWorld.removeRigidBody(object.userData.physicsBody);
        Ammo.destroy(object.userData.physicsBody);

        object.geometry.dispose();

        // object.material.dispose();

        // object.dispose();

        this.remove_from_pass(id, this.selectedObjects);
        this.remove_from_pass(id, this.impactObjects);
        this.remove_from_pass(id, this.rigidBodies);
        this.remove_from_pass(id, this.newObjects)

    }

    remove_molecule(name) {
        // let temp = this.data[name].instances.pop();
        //console.log(temp)
        let object = this.scene.getObjectByProperty("uuid", temp.mesh.uuid);

        object.geometry.dispose();
        for (let mat in object.materials) {
            mat.dispose();
        }

        this.scene.remove(object);
        this.physicsWorld.removeRigidBody(object.userData.physicsBody);

        for (let i = 0; i < this.selectedObjects.length; i++) {
            if (this.selectedObjects[i].parent == null) {
                this.rigidBodies.splice(i, 1);
            }
        }

        // console.log(object)
        // console.log(this.rigidBodies[1]);

        for (let i = 0; i < this.rigidBodies.length; i++) {
            if (this.rigidBodies[i].parent == null) {
                this.rigidBodies.splice(i, 1);
            }
        }
        //this.physicsWorld.removeRigidBody(temp.userData.physicsBody);
        //this.rigidBodies.remove(temp.mesh);
    }

    update_rigid_bodies() {
        // Update rigid bodies positions based on their physics update.
        for (let i = 0; i < this.rigidBodies.length; i++) {
            let objThree = this.rigidBodies[i];
            if (objThree == null) {
                this.rigidBodies.splice(i, 1);
                continue;
            }
            let objAmmo = objThree.userData.physicsBody;

            // I believe this is saying:
            // if the object involved is a movable object => bounce
            // else => ignore
            let ms = objAmmo.getMotionState();
            if (ms) {
                ms.getWorldTransform(this.tmpTrans);
                let p = this.tmpTrans.getOrigin();
                let q = this.tmpTrans.getRotation();
                objThree.position.set(p.x(), p.y(), p.z());
                objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
            }
        }
    }

    molecular_collision_checker() {
        let num_manifold = this.physicsWorld.getDispatcher().getNumManifolds();
        for (let i = 0; i < num_manifold; i++) {
            let contactManifold = this.physicsWorld
                .getDispatcher()
                .getManifoldByIndexInternal(i);

            let num_contacts = contactManifold.getNumContacts();
            if (num_contacts > 0) {
                // if (this.selectedObjects.length > 0) {
                //this.selectedObjects.length = 0
            }

            for (let j = 0; j < num_contacts; j++) {
                let obA = contactManifold.getBody0();
                let obB = contactManifold.getBody1();

                // console.log(obA);
                // console.log(obB);
                // console.log(this.scene);
                // console.log(num_manifold);
                // console.log(contactManifold);

                let meshA = this.scene.getObjectByProperty("name", obA.H);
                // console.log(meshA);
                let meshB = this.scene.getObjectByProperty("name", obB.H);
                // console.log(meshB);
                if (meshA != null && meshB != null) {
                    // console.log("Two molecules colided.");

                    let molA = meshA.userData.molecule;
                    let molB = meshB.userData.molecule;

                    // TODO find a way to remove this after a period of time.
                    // console.log(this.impactObjects);
                    this.remove_from_pass(meshA.uuid, this.impactObjects);
                    this.remove_from_pass(meshB.uuid, this.impactObjects);
                    this.add_to_pass(meshA.uuid, this.impactObjects);
                    this.add_to_pass(meshB.uuid, this.impactObjects);


                    if (molA.name == molB.name) {
                        // console.log("Same species impact.")
                        // console.log(molA, molB);
                        // console.log(molA.name);

                        if (molA.name == 0) {
                            this.merge(molA, molB);

                        } else {
                            this.split(molA);
                        }

                    } else {
                        if (molA.name == 0) {
                            this.split(molB);
                        }
                        if (molB.name == 0) {
                            this.split(molA);
                        }
                    }
                }
            }
        }
    }

    molecular_updater() {
        //call update on oll the molecules in the scene
        for (let i = 0; i < this.data.length; i++) {
            // console.log(this.data[i])
            // console.log(this.data[i].instances)
            // console.log(this.data[i].instances.length)

            for (let j = 0; j < this.data[i].instances.length; j++) {
                //for each instance of a species check for reaction

                if (this.data[i].instances[j] == null) { continue; }

                let decompose = this.data[i].instances[j].update(this.delta_t);
                if (decompose) {
                    this.split(this.data[i].instances[j]);
                }
            }
        }
    }

    split(instance) {
        let current_velocity = instance.mesh.userData.physicsBody.getLinearVelocity();
        let current_posistion = instance.mesh.position;

        this.remove_from_scene(instance.mesh.uuid);

        let atom_shift = .1;
        let starting_info = {
            starting_position: {
                x: current_posistion.x + atom_shift, //current_velocity.x(),
                y: current_posistion.y + atom_shift, //current_velocity.y(),
                z: current_posistion.z + atom_shift //current_velocity.z()
            },
            velocity: {
                x: current_velocity.x() * 1,
                y: current_velocity.y() * 1,
                z: current_velocity.z() * 1
            },
            rotational_velocity: {
                x: d3.randomNormal(0.0)(3.14),
                y: d3.randomNormal(0.0)(3.14),
                z: d3.randomNormal(0.0)(3.14)
            }
        }
        let starting_info_2 = {
            starting_position: {
                x: current_posistion.x - atom_shift, //current_velocity.x(),
                y: current_posistion.y - atom_shift, //current_velocity.y(),
                z: current_posistion.z - atom_shift //current_velocity.z()
            },
            velocity: {
                x: current_velocity.x() * -1,
                y: current_velocity.y() * -1,
                z: current_velocity.z() * -1
            },
            rotational_velocity: {
                x: d3.randomNormal(0.0)(3.14),
                y: d3.randomNormal(0.0)(3.14),
                z: d3.randomNormal(0.0)(3.14)
            }
        }

        this.add_molecule(0, starting_info);
        this.add_molecule(0, starting_info_2);


    }

    merge(instance_1, instance_2) {
        let current_velocity = instance_1.mesh.userData.physicsBody.getLinearVelocity();
        let current_posistion = instance_1.mesh.position;
        let current_rotation = instance_1.mesh.userData.physicsBody.getAngularVelocity();

        let starting_info = {
            starting_position: {
                x: current_posistion.x, //current_velocity.x(),
                y: current_posistion.y, //current_velocity.y(),
                z: current_posistion.z //current_velocity.z()
            },
            velocity: {
                x: current_velocity.x() * .5,
                y: current_velocity.y() * .5,
                z: current_velocity.z() * .5
            },
            rotational_velocity: {
                x: current_rotation.x() * .5,
                y: current_rotation.y() * .5,
                z: current_rotation.z() * .5
            }
        }
        this.add_molecule(1, starting_info);
        this.remove_from_scene(instance_1.mesh.uuid);
        this.remove_from_scene(instance_2.mesh.uuid);
    }

    physics_updater() {
        // Step world
        this.physicsWorld.stepSimulation(this.delta_t, 10);

        this.update_rigid_bodies();

        // combine hitting molecules
        this.molecular_collision_checker();

        this.molecular_updater();
    }

    animate() {

        this.controls.update();
        this.camera.updateMatrixWorld();
        this.delta_t = this.clock.getDelta();

        if (this.should_animate) {
            this.physics_updater();
            for (let temp of this.newObjects) {
                // console.log(temp)
                if (temp.userData.molecule.lifetime > this.new_molecule_glow_time) {
                    this.remove_from_pass(temp.uuid, this.newObjects);
                }

            }
        }

        requestAnimationFrame(this.animate.bind(this));
        this.stats.begin();
        this.composer.render(this.scene, this.camera);
        this.stats.end();
    }

    pause_animate() {
        this.should_animate = false;
    }
    resume_animate() {
        this.should_animate = true;
    }

    toggle_animate() {
        this.should_animate = this.should_animate == false;

        if (this.should_animate) {
            document.getElementById("pause_simulation").innerHTML = "Pause";
        } else {
            document.getElementById("pause_simulation").innerHTML = "Resume";
        }
    }

    toggle_grid_visability() {
        console.log('Called grid toggle.')
        for (let side of this.grid_cube) {
            side.visible = side.visible == false;
            // console.log(side);
        }
    }

    toggle_camera_auto_rotate() {
        console.log('Called camera toggle.')
        this.controls.autoRotate = this.controls.autoRotate == false;
    }

    toggle_axis() {
        console.log('Called axis toggle.')
        for (let obj of this.helper_objects) {
            obj.visible = obj.visible == false;
            // console.log(side);
        }
    }

    set_new_molecule_glow_time(new_time) {
        this.new_molecule_glow_time = new_time;
    }

    onDocumentMouseMove(event) {
        //event.preventDefault();
        //console.log(event.clientX, event.clientY);
        //this.mouse.x = event.clientX // / this.width_for_3d * 2;
        //this.mouse.y = -event.clientY // / this.height_for_3d * 2;
        //console.log(this.mouse.x)

        try {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            this.mouse.unproject(this.camera);
        } catch (err) {}
    }

    selector(event) {
        // console.log('clicked');
        // event.preventDefault();
        //this.mouse.unproject(this.camera);
        this.raycaster.setFromCamera(this.mouse, this.camera);

        let intersects = this.raycaster.intersectObjects(this.rigidBodies);

        if (intersects.length > 0) {
            // while (this.selectedObjects.length > 0) {
            //     console.log("shrinking!");
            //     this.selectedObjects[this.selectedObjects.length - 1].scale.setScalar(1.0);
            // }
            // intersects[0].object.scale.setScalar(3.0);

            this.remove_from_pass('all', this.selectedObjects);
            this.add_to_pass(intersects[0].object.uuid, this.selectedObjects);

            console.log(intersects[0].object.position)
            this.controls.target = intersects[0].object.position;
            this.controls.autoRotate = false; // ==this.controls.autoRotate;

            // this.selectedObjects.push(intersects[0].object)
            // c  onsole.log(intersects[0].object);
        } else {
            this.controls.target = this.scene.position;
            this.controls.autoRotate = false;
            this.remove_from_pass('all', this.selectedObjects);
        }


    }

    onDocumentKeyDown(event) {
        if (event.key == " ") {
            this.toggle_animate();
        }
    }

    onWindowResize() {
        this.height_for_3d = document.getElementById("Visualization").clientHeight;
        this.width_for_3d = document.getElementById("Visualization").clientWidth;
        this.camera.aspect = this.width_for_3d / this.height_for_3d;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width_for_3d, this.height_for_3d);
    }

    helper_view_mouse() {
        //console.log('in this mouse')
        // for visualizaton purposes:
        let material = new THREE.MeshPhysicalMaterial({
            color: "grey",
            emissive: "grey",
            reflectivity: 0,
            metalness: 0.9,
            roughness: 1,
            tranparency: 0.5
        });
        let geometry = new THREE.SphereBufferGeometry(0.1, 10, 10);

        let temp = new THREE.Mesh(geometry, material);
        temp.position.set(0, 0, 0);
        this.scene.add(temp);
        return temp;
        //End geometry helper block
    }

    helper_show_axis() {
        //xyz
        //rgb

        let max_min = 50;

        let pos = new THREE.Vector3();

        this.helper_show_coordinate(pos.set(0, 0, 0), 'black')


        for (let i = 1; i < max_min; i++) {
            this.helper_show_coordinate(pos.set(i, 0, 0), 'red')
            this.helper_show_coordinate(pos.set(-i, 0, 0), 'red')
        }
        for (let i = 1; i < max_min; i++) {
            this.helper_show_coordinate(pos.set(0, i, 0), 'green')
            this.helper_show_coordinate(pos.set(0, -i, 0), 'green')
        }
        for (let i = 1; i < max_min; i++) {
            this.helper_show_coordinate(pos.set(0, 0, i), 'blue')
            this.helper_show_coordinate(pos.set(0, 0, -i), 'blue')
        }

    }

    helper_add_line() {
        let material = new THREE.LineBasicMaterial({ color: 0x0000ff });
        let points = [];
        //console.log(this.raycaster.ray.origin)
        let origin = new THREE.Vector3();
        //origin.copy(this.raycaster.ray.origin)
        origin.x = this.mouse.x;
        origin.y = this.mouse.y;
        points.push(origin);

        // console.log(origin);
        // console.log(probe);
        //points.push(this.camera.position);

        // let probe = new THREE.Vector3();
        // probe.copy(origin)
        // probe.addScaledVector(this.raycaster.ray.direction, 10);
        // points.push(origin);
        // points.push(probe);

        let probe = new THREE.Vector3(0, 0, 0);
        points.push(probe);

        let geometry = new THREE.BufferGeometry().setFromPoints(points);
        let line = new THREE.Line(geometry, material);
        this.scene.add(line);
    }

    helper_show_coordinate(pos, color = 'black') {
        // for visualizaton purposes:
        let material = new THREE.MeshPhysicalMaterial({
            color: color,
            emissive: color,
            transparent: true,
            opacity: .5,
            reflectivity: 0.0,
            metalness: 0.0,
            roughness: 0.0
        });
        //BoxBufferGeometry(width : Float, height : Float, depth : Float, widthSegments : Integer, heightSegments : Integer, depthSegments : Integer)
        let geometry = new THREE.SphereBufferGeometry(.1, .1, .1);
        let temp_sphere = new THREE.Mesh(geometry, material);
        temp_sphere.position.set(pos.x, pos.y, pos.z);
        this.helper_objects.push(temp_sphere);

        this.scene.add(temp_sphere);

    }

    clean_all() {
        // Clean up old scene molecules and chamber

        // for (name in this.data) {
        //     while (this.data[name].instances.length > 0) {
        //         let temp = this.data[name].instances.pop();
        //         //console.log(temp)
        //         let object = this.scene.getObjectByProperty('uuid', temp.mesh.uuid);
        //         //console.log(object)
        //         object.geometry.dispose();
        //         for (let mat in object.materials) {
        //             mat.dispose();
        //         }
        //         this.scene.remove(object);
        //     }
        // }

        // console.log(this.chamber)
        // if (this.chamber != null) {
        //     this.chamber.geometry.dispose()
        //     this.chamber.material.dispose();
        //     this.scene.remove(this.chamber);
        // }

        // this.renderer.renderLists.dispose();
    }

    tick(incoming_data) {}
}

export default Visualization;