// External Dependancies

import { OrbitControls } from '/JS/three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from '/JS/three/examples/jsm/loaders/OBJLoader.js';
import { EffectComposer } from '/JS/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '/JS/three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from '/JS/three/examples/jsm/postprocessing/ShaderPass.js';
import { OutlinePass } from '/JS/three/examples/jsm/postprocessing/OutlinePass.js';
import { BokehPass } from '/JS/three/examples/jsm/postprocessing/BokehPass.js';
import { BokehShader, BokehDepthShader } from '/JS/three/examples/jsm/shaders/BokehShader2.js';

import { FXAAShader } from '/JS/three/examples/jsm/shaders/FXAAShader.js';
import { BufferGeometryUtils } from '/JS/three/examples/jsm/utils/BufferGeometryUtils.js';

// Internal Dependancies
import Molecule from '/JS/Molecule.js'
//importScripts('/JS/ammo/ammo.js')


let sphere_quality = 10;

var COLORS = {
    "H": 0xC0C0C0,
    "C": 0x000000,
    "Au": 0xD4AF37,
    "Al": 0x00334d,
    "V": 0xff26d4,
    "O": 0xff0000,
    "N": 0x0033cc
};

// In nanometers
var atom_radius = { // Van der walls from wiki https://en.wikipedia.org/wiki/Van_der_Waals_radius
    "H": .12,
    "C": .17,
    "Au": .166,
    "Al": .184,
    "V": .152,
    "O": .152,
    "N": .155
};



class Visualization {

    setupPhysicsWorld() {
        this.collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
        this.dispatcher = new Ammo.btCollisionDispatcher(this.collisionConfiguration);
        this.broadphase = new Ammo.btDbvtBroadphase();
        this.solver = new Ammo.btSequentialImpulseConstraintSolver();
        this.overlappingPairCache = new Ammo.btDbvtBroadphase();
        this.physicsWorld = new Ammo.btDiscreteDynamicsWorld(this.dispatcher, this.overlappingPairCache, this.solver, this.collisionConfiguration);
        // this.physicsWorld.setGravity(new Ammo.btVector3(0, gravityConstant, 0));
        // this.physicsWorld.getWorldInfo().set_m_gravity(new Ammo.btVector3(0, gravityConstant, 0));

        // Currently I don't want gravity.
        this.physicsWorld.setGravity(new Ammo.btVector3(0, 0, 0));
    }


    constructor(incoming_data, chamber_edge_length) {
        // Initialize Ammo engine
        Ammo();
        //Engine Variables
        this.height_for_3d = document.getElementById("Visualization").clientHeight;
        this.width_for_3d = document.getElementById("Visualization").clientWidth;
        this.background_and_emis = 0x00fffa;
        this.clock = new THREE.Clock();
        this.tmpTrans = new Ammo.btTransform();
        this.physicsWorld;
        this.setupPhysicsWorld()

        this.chamber_edge_length = chamber_edge_length;
        this.camera_displacement = chamber_edge_length * 2;

        this.rigidBodies = []; // for ammo
        this.selectedObjects = [] // for glow
        this.outline_params = {
            edgeStrength: 30,
            edgeGlow: .1,
            edgeThickness: 1.0,
            pulsePeriod: 0,
            usePatternTexture: false
        };
        this.chamber = null;

        //this.line = [];


        //Create renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.setClearColor(this.background_and_emis, 0.0)
        this.renderer.setSize(this.width_for_3d, this.height_for_3d);
        this.renderer.gammaInput = true;
        this.renderer.gammaOutput = true;
        this.renderer.shadowMap.enabled = true;


        // Setup scene, camera, lighting
        this.scene = new THREE.Scene();
        this.scene.position.x = 0;
        this.scene.position.y = 0;
        this.scene.position.z = 0;
        this.scene.overrideMaterial = { color: 0xffff00 };


        this.camera = new THREE.PerspectiveCamera(30, this.width_for_3d / this.height_for_3d, 1, 1000);
        this.camera.position.x = this.camera_displacement; //camera.lookAt(scene.position)
        this.camera.position.y = this.chamber_edge_length * 3 / 2; //camera.lookAt(scene.position)
        this.camera.position.z = this.chamber_edge_length * 3; //camera.lookAt(scene.position)



        this.renderPass = new RenderPass(this.scene, this.camera);

        // Configure outline shader
        this.outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), this.scene, this.camera);
        this.outlinePass.selectedObjects = this.selectedObjects;
        this.outlinePass.renderToScreen = true;
        this.outlinePass.edgeStrength = this.outline_params.edgeStrength;
        this.outlinePass.edgeGlow = this.outline_params.edgeGlow;
        this.outlinePass.visibleEdgeColor.set(0xffffff);
        //this.outlinePass.hiddenEdgeColor.set(0xffffff);

        // Add rendering to everything that needs it
        this.container = document.getElementById('Visualization');
        this.container.appendChild(this.renderer.domElement);
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(this.renderPass);
        this.composer.addPass(this.outlinePass);


        // Setup all the controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
        this.controls.dampingFactor = 0.25;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 1;
        this.controls.maxDistance = this.chamber_edge_length * 4;
        this.controls.maxPolarAngle = Math.PI;

        this.animate();
    }

    createLights() {
        // A hemisphere light is a gradient colored light; 
        // the first parameter is the sky color, the second parameter is the ground color, 
        // the third parameter is the intensity of the light
        this.hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, .9)

        // A directional light shines from a specific direction. 
        // It acts like the sun, that means that all the rays produced are parallel. 
        this.shadowLight = new THREE.DirectionalLight(0xffffff, .5);
        this.shadowLight_x = new THREE.DirectionalLight(0xffffff, .5);
        this.shadowLight_y = new THREE.DirectionalLight(0xffffff, .5);
        this.shadowLight_z = new THREE.DirectionalLight(0xffffff, .5);

        // Set the direction of the light  
        this.shadowLight.position.set(this.chamber_edge_length, this.chamber_edge_length / 2, this.chamber_edge_length / 2);
        this.shadowLight_x.position.set(this.chamber_edge_length, 0, 0);
        this.shadowLight_y.position.set(0, this.chamber_edge_length, 0);
        this.shadowLight_z.position.set(0, 0, this.chamber_edge_length);
        // Allow shadow casting 
        this.shadowLight.castShadow = true;
        this.shadowLight_x.castShadow = true;
        this.shadowLight_y.castShadow = true;
        this.shadowLight_z.castShadow = true;


        // define the visible area of the projected shadow
        this.shadowLight.shadow.camera.left = -this.chamber_edge_length;
        this.shadowLight.shadow.camera.right = this.chamber_edge_length;
        this.shadowLight.shadow.camera.top = this.chamber_edge_length;
        this.shadowLight.shadow.camera.bottom = -this.chamber_edge_length;
        this.shadowLight.shadow.camera.near = 1;
        this.shadowLight.shadow.camera.far = 1000;

        // define the resolution of the shadow; the higher the better, 
        // but also the more expensive and less performant
        this.shadowLight.shadow.mapSize.width = 2048;
        this.shadowLight.shadow.mapSize.height = 2048;



        // to activate the lights, just add them to the scene
        this.scene.add(this.hemisphereLight);
        this.scene.add(this.shadowLight);
        //this.scene.add(this.shadowLight_y);
        //this.scene.add(this.shadowLight_z);
    }

    init(incoming_data, chamber_edge_length) {

        this.data = incoming_data;
        for (name in this.data) {
            this.data[name].instances = [];
        }

        this.tmpTrans = new Ammo.btTransform();
        this.physicsWorld;
        this.rigidBodies = [];
        this.setupPhysicsWorld()


        this.chamber_edge_length = chamber_edge_length;
        this.controls.maxDistance = this.chamber_edge_length * 4;
        this.selectedObjects = [];



        this.composer = new EffectComposer(this.renderer);

        // Setup scene, camera, lighting
        this.scene = new THREE.Scene();
        this.scene.position.x = 0;
        this.scene.position.y = 0;
        this.scene.position.z = 0;

        // No success with fog really adding anything
        // this.scene.fog = new THREE.FogExp2(0xefd1b5, .035);
        // this.scene.fog = new THREE.Fog(0xefd1b5, 1, 1000);

        this.createLights();

        this.renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(this.renderPass);

        // Configure outline shader
        this.outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), this.scene, this.camera);
        this.outlinePass.selectedObjects = this.selectedObjects;
        this.outlinePass.renderToScreen = true;
        this.outlinePass.edgeStrength = this.outline_params.edgeStrength;
        this.outlinePass.edgeGlow = this.outline_params.edgeGlow;
        this.outlinePass.visibleEdgeColor.set(0x01cdfe);
        this.outlinePass.hiddenEdgeColor.set(0x01cdfe);

        this.composer.addPass(this.outlinePass);

        // this.bokehPass = new BokehPass(this.scene, this.camera, {
        //     focus: this.chamber_edge_length,
        //     aperture: 0.000009,
        //     maxblur: 1.0,
        //     width: this.width,
        //     height: this.height
        // });
        // this.composer.addPass(this.bokehPass);


        for (name in this.data) {
            this.generate_species(name)
            for (let i = 0; i < this.data[name].count.slice(-1)[0]; i++) {
                this.add_molecule(name);
            }
        }
        this.add_grid()
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

        //console.log(this.chamber)
        if (this.chamber != null) {
            this.chamber.geometry.dispose()
            this.chamber.material.dispose();
            this.scene.remove(this.chamber);
        }


        this.renderer.renderLists.dispose();

    }

    generate_species(name) {

        let envMap = new THREE.TextureLoader().load('Images/envMap.png');
        envMap.mapping = THREE.SphericalReflectionMapping;

        let geometry = this.data[name].coords; // Setting up to import different geometries

        let materials = [];
        let mergedGeometry = [];
        // basic monochromatic energy preservation
        let roughness = .4;
        let diffuseColor = new THREE.Color().setHSL(0.0, 0.0, .9);

        for (let i = 0; i < geometry.length; i++) {

            //For atom i set up correct material
            let material = new THREE.MeshPhysicalMaterial({
                //let material = new THREE.MeshDepthMaterial({
                color: COLORS[geometry[i][0]],
                emissive: COLORS[geometry[i][0]],
                reflectivity: 1.0,
                color: diffuseColor,
                metalness: .9,
                roughness: roughness,
                envMap: envMap,
            });
            materials.push(material)

            // for atom I create the correct geometry
            let sphereGeometry = new THREE.SphereBufferGeometry(atom_radius[geometry[i][0]], sphere_quality, sphere_quality);

            sphereGeometry.translate(geometry[i][1].x, geometry[i][1].y, geometry[i][1].z);

            mergedGeometry.push(sphereGeometry)

        };

        // This information is now stored in the main data structure.

        //console.log(mergedGeometry)

        this.data[name]['graphics'] = {
            'geom': BufferGeometryUtils.mergeBufferGeometries(mergedGeometry, true),
            'material': materials
        }


        //mergedGeometry.dispose();
        for (let geo of mergedGeometry) {
            geo.dispose();
        }

        for (let mat of materials) {
            mat.dispose();
        }
    }

    add_molecule(name) {
        // This will turn into a many molecule method
        if (name == null) {
            name = 'Reactant'
        }

        let temp = new Molecule(this.data[name].coords,
            this.data[name].graphics.geom,
            this.data[name].graphics.material,
            this.chamber_edge_length);


        this.data[name].instances.push(temp);
        this.scene.add(temp.mesh);
        //add to simulation
        this.physicsWorld.addRigidBody(temp.mesh.userData.physicsBody);
        //add to update list
        this.rigidBodies.push(temp.mesh);
        // add to glow list
        this.selectedObjects.push(temp.mesh)
    }

    add_grid() {
        // Set up local
        let mass = 0;
        let pos = new THREE.Vector3();
        let dim = new THREE.Vector3();
        let size = this.chamber_edge_length;
        let divisions = this.chamber_edge_length;
        let gridHelper = null;

        // ADD GRIDS

        //Top and bottom   - along Y axis
        gridHelper = new THREE.GridHelper(size, divisions, 'grey', 'grey');
        gridHelper.geometry.rotateY(Math.PI / 2);
        pos.set(0, -this.chamber_edge_length / 2, 0);
        dim.set(this.chamber_edge_length, .1, this.chamber_edge_length);
        gridHelper.position.copy(pos);
        this.scene.add(gridHelper);
        this.createRigidBody(dim, mass, pos);

        gridHelper = new THREE.GridHelper(size, divisions, 'grey', 'grey');
        gridHelper.geometry.rotateY(Math.PI / 2);
        pos.set(0, this.chamber_edge_length / 2, 0);
        dim.set(this.chamber_edge_length, .1, this.chamber_edge_length);
        gridHelper.position.copy(pos);
        this.scene.add(gridHelper);
        this.createRigidBody(dim, mass, pos);

        // Front and back - along X
        gridHelper = new THREE.GridHelper(size, divisions, 'grey', 'grey');
        gridHelper.geometry.rotateZ(Math.PI / 2);
        pos.set(-this.chamber_edge_length / 2, 0, 0);
        dim.set(.1, this.chamber_edge_length, this.chamber_edge_length);
        gridHelper.position.copy(pos);
        this.scene.add(gridHelper);
        this.createRigidBody(dim, mass, pos);

        gridHelper = new THREE.GridHelper(size, divisions, 'grey', 'grey');
        gridHelper.geometry.rotateZ(Math.PI / 2);
        pos.set(this.chamber_edge_length / 2, 0, 0);
        dim.set(.1, this.chamber_edge_length, this.chamber_edge_length);
        gridHelper.position.copy(pos);
        this.scene.add(gridHelper);
        this.createRigidBody(dim, mass, pos);

        // Front and back - along Z
        gridHelper = new THREE.GridHelper(size, divisions, 'grey', 'grey');
        gridHelper.geometry.rotateX(Math.PI / 2);
        pos.set(0, 0, -this.chamber_edge_length / 2);
        dim.set(this.chamber_edge_length, this.chamber_edge_length, .1);
        gridHelper.position.copy(pos);
        this.scene.add(gridHelper);
        this.createRigidBody(dim, mass, pos);

        gridHelper = new THREE.GridHelper(size, divisions, 'grey', 'grey');
        gridHelper.geometry.rotateX(Math.PI / 2);
        pos.set(0, 0, this.chamber_edge_length / 2);
        dim.set(this.chamber_edge_length, this.chamber_edge_length, .1);
        gridHelper.position.copy(pos);
        this.scene.add(gridHelper);
        this.createRigidBody(dim, mass, pos);

        // END ADD GRIDS
    }

    createRigidBody(dim, mass, pos) {
        // for visualizaton purposes:
        // let material = new THREE.MeshPhysicalMaterial({
        //     color: 'grey',
        //     emissive: 'grey',
        //     reflectivity: 0,
        //     metalness: .9,
        //     roughness: 1
        // });
        // let geometry = new THREE.BoxBufferGeometry(dim.x, dim.y, dim.z);
        // this.chamber = new THREE.Mesh(geometry, material);
        // this.chamber.position.set(pos.x, pos.y, pos.z);
        // this.scene.add(this.chamber);
        // End geometry helper block

        // Actual ammo code
        let transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
        let motionState = new Ammo.btDefaultMotionState(transform);

        let colShape = new Ammo.btBoxShape(new Ammo.btVector3(dim.x, dim.y, dim.z));
        colShape.setMargin(0.05);

        let localInertia = new Ammo.btVector3(0, 0, 0);
        colShape.calculateLocalInertia(mass, localInertia);

        let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, colShape, localInertia);
        let body = new Ammo.btRigidBody(rbInfo);
        body.setRestitution(1.0);
        //body.setDamping(0.8, 0);

        this.physicsWorld.addRigidBody(body);
    }

    tick(incoming_data) {

    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        //console.log(this.clock.getDelta());
        this.delta_t = this.clock.getDelta();

        // Step world
        this.physicsWorld.stepSimulation(this.delta_t, 10);

        // Update rigid bodies
        for (let i = 0; i < this.rigidBodies.length; i++) {
            let objThree = this.rigidBodies[i];
            let objAmmo = objThree.userData.physicsBody;

            let ms = objAmmo.getMotionState();
            if (ms) {
                ms.getWorldTransform(this.tmpTrans);
                let p = this.tmpTrans.getOrigin();
                let q = this.tmpTrans.getRotation();
                objThree.position.set(p.x(), p.y(), p.z());
                objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
            }
        }

        // for (var i = 0; i < this.rigidBodies.length; i++) {
        //     var contactManifold = this.physicsWorld.getDispatcher().getManifoldByIndexInternal(i);
        //     var obA = contactManifold.getBody0();
        //     var obB = contactManifold.getBody1();
        //     //contactManifold.refreshContactPoints(obA.getWorldTransform(), obB.getWorldTransform());
        //     var numContacts = contactManifold.getNumContacts();

        //     // For each contact point in that manifold 
        //     for (var j = 0; j < numContacts; j++) {

        //         // Get the contact information
        //         var pt = contactManifold.getContactPoint(j);
        //         var ptA = pt.getPositionWorldOnA();
        //         var ptB = pt.getPositionWorldOnB();
        //         var ptdist = pt.getDistance();
        //         //console.log(ptdist)

        //         // Do whatever else you need with the information...
        //     }
        // }


        // for (name in this.data) {
        //     //console.log(this.data[name]);
        //     for (let i = 0; i < this.data[name].instances.length; i++) {
        //         //console.log(this.data[name].instances[i]);
        //         this.data[name].instances[i].update(this.data, this.delta_t, this.chamber_edge_length);
        //     }
        // }


        this.composer.render(this.scene, this.camera);
    };

    onWindowResize() {
        this.height_for_3d = document.getElementById("Visualization").clientHeight;
        this.width_for_3d = document.getElementById("Visualization").clientWidth;
        this.camera.aspect = this.width_for_3d / this.height_for_3d;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width_for_3d, this.height_for_3d);
    }


}

export default Visualization;