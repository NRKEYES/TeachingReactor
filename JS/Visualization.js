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

    constructor(incoming_data, chamber_edge_length) {

        this.chamber_edge_length = chamber_edge_length;

        this.camera_displacement = chamber_edge_length * 2;


        //Engine Variables
        this.height_for_3d = document.getElementById("Visualization").clientHeight;
        this.width_for_3d = document.getElementById("Visualization").clientWidth;
        this.background_and_emis = 0x00fffa;
        this.clock = new THREE.Clock();


        this.selectedObjects = []
        this.outline_params = {
            edgeStrength: 3,
            edgeGlow: 1,
            edgeThickness: 3.0,
            pulsePeriod: 0,
            usePatternTexture: false
        };


        // Graphics Variables
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
            //this.renderer.domElement.style.position = 'absolute';
        this.renderer.setSize(this.width_for_3d, this.height_for_3d);

        // Add rendering to everything that needs it
        this.container = document.getElementById('Visualization');
        this.container.appendChild(this.renderer.domElement);
        this.composer = new EffectComposer(this.renderer);

        // Setup scene, camera, lighting
        this.scene = new THREE.Scene();
        this.scene.position.x = 0;
        this.scene.position.y = 0;
        this.scene.position.z = 0;
        //this.scene.overrideMaterial = { color: 0xffff00 };




        this.camera = new THREE.PerspectiveCamera(30, this.width_for_3d / this.height_for_3d, 1, 1000);
        // this.camera.position.z = this.camera_displacement; //camera.lookAt(scene.position)
        // this.camera.position.x = this.camera_displacement; //camera.lookAt(scene.position)
        // this.camera.position.y = this.camera_displacement; //camera.lookAt(scene.position)

        //this.camera.position.x = this.camera_displacement; //camera.lookAt(scene.position)
        this.camera.position.y = this.camera_displacement / 2; //camera.lookAt(scene.position)
        this.camera.position.z = this.camera_displacement; //camera.lookAt(scene.position)





        this.renderPass = new RenderPass(this.scene, this.camera);

        this.composer.addPass(this.renderPass);

        // Configure outline shader
        this.outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), this.scene, this.camera);
        this.outlinePass.selectedObjects = this.selectedObjects;
        this.outlinePass.renderToScreen = true;

        this.outlinePass.edgeStrength = this.outline_params.edgeStrength;
        this.outlinePass.edgeGlow = this.outline_params.edgeGlow;
        this.outlinePass.visibleEdgeColor.set(0xffffff);
        this.outlinePass.hiddenEdgeColor.set(0xffffff);

        this.composer.addPass(this.outlinePass);
        //console.log(this.composer)


        // Setup all the controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
        this.controls.dampingFactor = 0.25;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 1;
        this.controls.maxDistance = this.camera_displacement * 4;
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
        this.selectedObjects = [];

        this.chamber_edge_length = chamber_edge_length;


        this.composer = new EffectComposer(this.renderer);

        // Setup scene, camera, lighting
        this.scene = new THREE.Scene();
        this.scene.position.x = 0;
        this.scene.position.y = 0;
        this.scene.position.z = 0;




        //this.scene.fog = new THREE.FogExp2(0xefd1b5, .035);
        //this.scene.fog = new THREE.Fog(0xefd1b5, 1, 1000);

        this.createLights();

        this.renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(this.renderPass);

        // Configure outline shader
        this.outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), this.scene, this.camera);
        //
        this.outlinePass.selectedObjects = this.selectedObjects;
        this.outlinePass.renderToScreen = true;

        this.outlinePass.edgeStrength = this.outline_params.edgeStrength;
        this.outlinePass.edgeGlow = this.outline_params.edgeGlow;
        this.outlinePass.visibleEdgeColor.set(0xffffff);
        this.outlinePass.hiddenEdgeColor.set(0xffffff);

        this.composer.addPass(this.outlinePass);

        this.bokehPass = new BokehPass(this.scene, this.camera, {
            focus: 5,
            aperture: 0.000005,
            maxblur: 1.0,
            width: this.width,
            height: this.height
        });
        //this.composer.addPass(this.bokehPass);






        // Setup all the controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
        this.controls.dampingFactor = 0.25;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 1;
        this.controls.maxDistance = this.camera_displacement * 4;
        this.controls.maxPolarAngle = Math.PI;

        this.chamber = null;
        this.chamber_edge_length = chamber_edge_length;

        for (name in this.data) {
            this.generate_species(name)
            for (let i = 0; i < this.data[name].count.slice(-1)[0]; i++) {
                this.add_molecule(name);
            }
        }
        //this.add_reaction_chamber()
        this.add_floor()


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

        console.log(mergedGeometry)

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

        let temp = new Molecule(this.data[name].coords, this.data[name].graphics.geom, this.data[name].graphics.material, this.chamber_edge_length);
        //        console.log(temp)

        this.data[name].instances.push(temp);

        //console.log(this.data[name].instances);
        // this.scene.add(this.data[name].instances.slice(-1)[0].mesh);
        this.scene.add(temp.mesh);
        this.selectedObjects.push(temp.mesh)
    }

    add_floor() {
        // Reaction Chamber

        let texture1 = new THREE.TextureLoader().load('Images/steel.jpg');
        let texture2 = new THREE.TextureLoader().load('Images/glass1.gif');
        let envMap = new THREE.TextureLoader().load('Images/envMap.png');
        envMap.mapping = THREE.SphericalReflectionMapping;

        let material = new THREE.MeshPhysicalMaterial({
            color: 'yellow',
            emissive: 'grey',
            reflectivity: 0,
            metalness: .9,
            roughness: 1,
            //envMap: envMap,
            side: THREE.BackSide

        });


        let geometry = new THREE.SphereBufferGeometry(
            this.chamber_edge_length * 10, 4, 4, 4);

        // this.chamber = new THREE.Mesh(geometry, material);
        // this.chamber.receiveShadow = false;
        // this.chamber.castShadow = false;
        // this.chamber.position.set(0, 0, 0);
        // this.scene.add(this.chamber);




        let chamber_spacing = .3


        material = new THREE.MeshPhysicalMaterial({
            color: 'grey',
            emissive: 'grey',
            reflectivity: 0,
            metalness: .9,
            roughness: 1,
            envMap: envMap,
            polygonOffset: true,
            polygonOffsetFactor: 1, // positive value pushes polygon further away
            polygonOffsetUnits: 1,
            side: THREE.DoubleSide

        });

        geometry = new THREE.BoxBufferGeometry(.2, this.chamber_edge_length, this.chamber_edge_length);
        this.chamber = new THREE.Mesh(geometry, material);
        this.chamber.receiveShadow = true;
        this.chamber.position.set(-this.chamber_edge_length / 2 - chamber_spacing, 0, 0);
        this.scene.add(this.chamber);

        // material = new THREE.MeshPhysicalMaterial({
        //     color: 'grey',
        //     emissive: 'grey',
        //     reflectivity: 0,
        //     roughness: 1,
        //     envMap: envMap,
        // });

        geometry = new THREE.BoxBufferGeometry(this.chamber_edge_length, .2, this.chamber_edge_length);
        this.chamber = new THREE.Mesh(geometry, material);
        this.chamber.receiveShadow = true;
        this.chamber.position.set(0, -this.chamber_edge_length / 2 - chamber_spacing, 0);
        this.scene.add(this.chamber);

        geometry = new THREE.BoxGeometry(
            this.chamber_edge_length, this.chamber_edge_length, .2, // size
            this.chamber_edge_length, this.chamber_edge_length, 1); // divisions
        this.chamber = new THREE.Mesh(geometry, material);
        this.chamber.receiveShadow = true;
        this.chamber.position.set(0, 0, -this.chamber_edge_length / 2 - chamber_spacing);
        this.scene.add(this.chamber);



        // ADD GRIDS
        var size = this.chamber_edge_length;
        var divisions = this.chamber_edge_length;

        var gridHelper = new THREE.GridHelper(size, divisions, 'black', 'black');
        gridHelper.position.set(0, -this.chamber_edge_length / 2, 0);
        this.scene.add(gridHelper);


        gridHelper = new THREE.GridHelper(size, divisions, 'black', 'black');
        gridHelper.position.set(0, 0, -this.chamber_edge_length / 2);
        gridHelper.geometry.rotateX(Math.PI / 2);
        this.scene.add(gridHelper);

        gridHelper = new THREE.GridHelper(size, divisions, 'black', 'black');
        gridHelper.position.set(-this.chamber_edge_length / 2, 0, 0);
        gridHelper.geometry.rotateZ(Math.PI / 2);
        this.scene.add(gridHelper);

        var gridHelper = new THREE.GridHelper(size, divisions);
        gridHelper.position.set(0, this.chamber_edge_length / 2, 0);
        this.scene.add(gridHelper);


        gridHelper = new THREE.GridHelper(size, divisions);
        gridHelper.position.set(0, 0, this.chamber_edge_length / 2);
        gridHelper.geometry.rotateX(Math.PI / 2);
        this.scene.add(gridHelper);

        gridHelper = new THREE.GridHelper(size, divisions);
        gridHelper.position.set(this.chamber_edge_length / 2, 0, 0);
        gridHelper.geometry.rotateZ(Math.PI / 2);
        this.scene.add(gridHelper);
        // END ADD GRIDS









        //Set of transparent walls towards the initial camera
        // material = new THREE.MeshPhysicalMaterial({
        //     color: 'lightblue',
        //     metalness: 1.0,
        //     roughness: .1,
        //     //alphaMap: texture2,
        //     //alphaTest: 0.33,
        //     envMap: texture1,
        //     envMapIntensity: .9,
        //     depthTest: true,
        //     transparency: .8,
        //     transparent: true,
        //     side: THREE.DoubleSide,
        // });
        // geometry = new THREE.BoxBufferGeometry(.2, this.chamber_edge_length, this.chamber_edge_length);
        // this.chamber = new THREE.Mesh(geometry, material);

        // this.chamber.position.set(this.chamber_edge_length / 2, 0, 0);
        // //console.log(this.chamber)
        // this.scene.add(this.chamber);

        // geometry = new THREE.BoxBufferGeometry(this.chamber_edge_length, .2, this.chamber_edge_length);
        // this.chamber = new THREE.Mesh(geometry, material);

        // this.chamber.position.set(0, this.chamber_edge_length / 2, 0);
        // //console.log(this.chamber)
        // this.scene.add(this.chamber);

        // geometry = new THREE.BoxBufferGeometry(this.chamber_edge_length, this.chamber_edge_length, .2);
        // this.chamber = new THREE.Mesh(geometry, material);

        // this.chamber.position.set(0, 0, this.chamber_edge_length / 2);
        // //console.log(this.chamber)
        // this.scene.add(this.chamber);



        // geometry.dispose();
        // material.dispose();
        //selectedObjects.push(chamber)
    }

    add_reaction_chamber() {
        // Reaction Chamber

        let texture1 = new THREE.TextureLoader().load('Images/steel.jpg');
        let texture2 = new THREE.TextureLoader().load('Images/glass1.gif');

        let material = new THREE.MeshPhysicalMaterial({
            color: 'lightblue',
            metalness: 1.0,
            roughness: .1,
            //alphaMap: texture2,
            //alphaTest: 0.33,
            envMap: texture1,
            envMapIntensity: .9,
            depthTest: true,
            transparency: .8,
            transparent: true,
            side: THREE.DoubleSide,
        });

        let geometry = new THREE.BoxBufferGeometry(this.chamber_edge_length, this.chamber_edge_length, this.chamber_edge_length);
        this.chamber = new THREE.Mesh(geometry, material);
        this.chamber.castShadow = true;
        this.chamber.receiveShadow = true;
        this.chamber.position.set(0, 0, 0);
        //console.log(this.chamber)
        this.scene.add(this.chamber);

        // geometry.dispose();
        // material.dispose();
        //selectedObjects.push(chamber)
    }

    tick(incoming_data) {

    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        //console.log(this.clock.getDelta());
        let delta_t = this.clock.getDelta();

        for (name in this.data) {
            //console.log(this.data[name]);
            for (let i = 0; i < this.data[name].instances.length; i++) {
                //console.log(this.data[name].instances[i]);
                this.data[name].instances[i].update(this.data, delta_t, this.chamber_edge_length);
            }
        }


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