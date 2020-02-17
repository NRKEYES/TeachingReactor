// External Dependancies

import { OrbitControls } from '/JS/three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from '/JS/three/examples/jsm/loaders/OBJLoader.js';
import { EffectComposer } from '/JS/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '/JS/three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from '/JS/three/examples/jsm/postprocessing/ShaderPass.js';
import { OutlinePass } from '/JS/three/examples/jsm/postprocessing/OutlinePass.js';
import { FXAAShader } from '/JS/three/examples/jsm/shaders/FXAAShader.js';
import { BufferGeometryUtils } from '/JS/three/examples/jsm/utils/BufferGeometryUtils.js';

// Internal Dependancies
import Molecule from '/JS/Molecule.js'


let sphere_quality = 6;

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
        this.data = incoming_data;
        this.chamber_edge_length = chamber_edge_length * 2;

        this.camera_displacement = chamber_edge_length;

        console.log(this.data)

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

        this.camera = new THREE.PerspectiveCamera(30, this.width_for_3d / this.height_for_3d, 1, 2000);
        this.camera.position.z = this.camera_displacement; //camera.lookAt(scene.position)
        this.camera.position.x = this.camera_displacement; //camera.lookAt(scene.position)
        this.camera.position.y = this.camera_displacement; //camera.lookAt(scene.position)

        this.directionalLight = new THREE.DirectionalLight(0xffffff, .5);
        this.directionalLight.position.set(100, -100, 0);
        this.directionalLight.castShadow = true;
        this.scene.add(this.directionalLight);
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

        // Setup all the controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
        this.controls.dampingFactor = 0.25;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 1;
        this.controls.maxDistance = this.camera_displacement * 4;
        this.controls.maxPolarAngle = Math.PI;

    }

    init(chamber_edge_length, ) {

        this.chamber_edge_length = chamber_edge_length;
        // Create Reaction Chamber element
        if (this.chamber == null) {
            this.add_reaction_chamber(this.chamber_edge_length); // in nm
        }

        this.chamber.position.set(0, 0, 0)


        for (name in this.data) {
            this.generate_species(name)
            for (let i = 0; i < this.data[name].count.slice(-1)[0]; i++) {
                this.add_molecule(name);
            }
        }


        // Create Reaction Chamber element
        if (this.chamber == null) {
            this.add_reaction_chamber(this.chamber_edge_length); // in nm
        }

        this.chamber.position.set(0, 0, 0)
        console.log(this.scene);
        this.animate();
    }

    clean_all() {
        // Clean up old scene molecules and chamber

        for (name in this.data) {

            while (this.data[name].instances.length > 0) {

                let temp = this.data[name].instances.pop();
                //console.log(temp)

                let object = this.scene.getObjectByProperty('uuid', temp.mesh.uuid);
                //console.log(object)
                object.geometry.dispose();
                for (let mat in object.materials) {
                    mat.dispose();
                }

                this.scene.remove(object);

            }
        }


        // Currently no changes to chamber are meaningful, so just gonna let it remain.
        //console.log(this.chamber)
        // this.chamber.geometry.dispose()
        // this.chamber.material.dispose();
        // this.scene.remove(this.chamber);

        // this.chamber = null;

        //this.renderer.renderLists.dispose();

    }

    generate_species(name) {

        let envMap = new THREE.TextureLoader().load('Images/envMap.png');
        envMap.mapping = THREE.SphericalReflectionMapping;

        let geometry = this.data[name].coords; // Setting up to import different geometries

        let materials = [];
        let mergedGeometry = [];
        // basic monochromatic energy preservation
        let roughness = .1;
        let diffuseColor = new THREE.Color().setHSL(0.0, 0.0, .9);

        for (let i = 0; i < geometry.length; i++) {

            //For atom i set up correct material
            let material = new THREE.MeshPhysicalMaterial({
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

        this.data[name]['graphics'] = { 'geom': BufferGeometryUtils.mergeBufferGeometries(mergedGeometry, true), 'material': materials }


        // mergedGeometry.dispose();
        // for (let mat of materials) {
        //     mat.dispose();
        // }
    }

    add_molecule(name) {
        // This will turn into a many molecule method
        if (name == null) {
            name = 'Reactant'
        }
        let temp = new Molecule(name, this.data[name].graphics.geom, this.data[name].graphics.material);

        this.data[name].instances.push(temp);


        // console.log(this.data[name].instances.slice(-1)[0].mesh);
        // this.scene.add(this.data[name].instances.slice(-1)[0].mesh);
        this.scene.add(temp.mesh);


        //this.selectedObjects.push(temp.mesh)
    }

    add_reaction_chamber(chamber_edge_length) {
        // Reaction Chamber

        let texture1 = new THREE.TextureLoader().load('Images/steel.jpg');
        let texture2 = new THREE.TextureLoader().load('Images/glass1.gif');

        let material = new THREE.MeshPhysicalMaterial({
            color: 'lightblue',
            metalness: 1.0,
            roughness: .1,
            alphaMap: texture2,
            alphaTest: 0.33,
            envMap: texture1,
            envMapIntensity: .9,
            depthTest: true,
            transparency: .75,
            transparent: true,
            side: THREE.DoubleSide,
        });

        let geometry = new THREE.BoxBufferGeometry(chamber_edge_length, chamber_edge_length, chamber_edge_length);
        this.chamber = new THREE.Mesh(geometry, material);
        this.chamber.position.set(0, 0, 0);
        this.scene.add(this.chamber);

        geometry.dispose();
        material.dispose();
        //selectedObjects.push(chamber)
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        for (name in this.data) {
            //console.log(this.data[name]);
            for (let i = 0; i < this.data[name].instances.length; i++) {
                //console.log(this.data[name].instances[i]);
                this.data[name].instances[i].update();
            }
        }


        //this.renderer.render(this.scene, this.camera);

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




function make_line() {
    // adding a line
    this.points = [];
    points.push(new THREE.Vector3(0, 0, 0));
    points.push(new THREE.Vector3(0, 100, 0));
    points.push(new THREE.Vector3(10, 0, 0));

    geometry = new THREE.BufferGeometry().setFromPoints(points);
    material = new THREE.LineBasicMaterial({ color: 0x0000ff });

    line = new THREE.Line(geometry, material);

    scene.add(line);
}


export default Visualization;