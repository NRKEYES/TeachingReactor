// External Dependancies

import { OrbitControls } from '/JS/three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from '/JS/three/examples/jsm/loaders/OBJLoader.js';
import { EffectComposer } from '/JS/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '/JS/three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from '/JS/three/examples/jsm/postprocessing/ShaderPass.js';
import { OutlinePass } from '/JS/three/examples/jsm/postprocessing/OutlinePass.js';
import { FXAAShader } from '/JS/three/examples/jsm/shaders/FXAAShader.js';

// Internal Dependancies
import Molecule from '/JS/Molecule.js'





var scale_for_angs = 1;

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

var atom_radius = { // Van der walls from wiki https://en.wikipedia.org/wiki/Van_der_Waals_radius
    "H": .12,
    "C": .17,
    "Au": .166,
    "Al": .184,
    "V": .152,
    "O": .152,
    "N": .155
};



let structures = {};

structures['Reactant'] = [
    ['N', new THREE.Vector3(0, 0, 0)],
    ['O', new THREE.Vector3(-.07, .12, 0)],
    ['O', new THREE.Vector3(-.07, -.12, 0)]
];

structures['Product'] = [
    ['N', new THREE.Vector3(0, 0, 0)],
    ['O', new THREE.Vector3(-0.07, 0.12, 0)],
    ['O', new THREE.Vector3(-0.07, -0.12, 0)],
    ['N', new THREE.Vector3(0.3, 0, 0)],
    ['O', new THREE.Vector3(0.37, 0.12, 0)],
    ['O', new THREE.Vector3(0.37, -0.1, 0)]
]



class Visualization {

    constructor(incoming_data) {
        this.data = incoming_data;

        //Engine Variables
        this.height_for_3d = document.getElementById("Visualization").clientHeight;
        this.width_for_3d = document.getElementById("Visualization").clientWidth;
        this.background_and_emis = 0x00fffa;
        this.clock = new THREE.Clock();

        this.renderer;
        this.container;
        this.composer;
        this.scene;
        this.camera;

        this.outlinePass;
        this.selectedObjects = []
        this.outline_params = {
            edgeStrength: 3,
            edgeGlow: 1,
            edgeThickness: 3.0,
            pulsePeriod: 0,
            usePatternTexture: false
        };

        // Simulation variables  -- PROBABLY need to move
        this.molecules = [];
        this.chamber = null;
        this.chamber_edge_length = 100 // Planning on this being equivalent to ---1 nm---



        // Graphics Variables
        this.species = []
        this.line = [];




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

        this.camera = new THREE.PerspectiveCamera(30, this.width_for_3d / this.height_for_3d, 1, 2000);
        this.camera.position.z = 50; //camera.lookAt(scene.position)
        this.camera.position.x = 50; //camera.lookAt(scene.position)
        this.camera.position.y = 50; //camera.lookAt(scene.position)

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
        this.controls.minDistance = 10;
        this.controls.maxDistance = 500;
        this.controls.maxPolarAngle = Math.PI;

    }

    init(starting_number) {

        for (name in structures) {
            this.genererate_species(name)
        }

        for (let i = 0; i < starting_number; i++) {
            this.add_molecule();
        }

        // Create Reaction Chamber element
        if (this.chamber == null) {
            this.add_reaction_chamber();

        }

        this.animate();
    }

    clean_all() {
        // Clean up old scene molecules and chamber

        while (this.molecules.length > 0) {
            let temp = this.molecules.pop();
            //console.log(temp)

            let object = this.scene.getObjectByProperty('uuid', temp.mesh.uuid);
            //console.log(object)
            object.geometry.dispose();
            for (let mat in object.materials) {
                mat.dispose();
            }

            this.scene.remove(object);

        }


        // Currently no changes to chamber are meaningful, so just gonna let it remain.
        //console.log(this.chamber)
        // this.chamber.geometry.dispose()
        // this.chamber.material.dispose();
        // this.scene.remove(this.chamber);

        // this.chamber = null;

        //this.renderer.renderLists.dispose();

    }

    genererate_species(name) {

        let envMap = new THREE.TextureLoader().load('Images/envMap.png');
        envMap.mapping = THREE.SphericalReflectionMapping;

        let geometry = structures[name]; // Setting up to import different geometries

        let materials = [];
        let mergedGeometry = new THREE.Geometry();

        // basic monochromatic energy preservation
        let roughness = .1;
        let diffuseColor = new THREE.Color().setHSL(0.0, 0.0, .9);

        for (let i = 0; i < geometry.length; i++) {
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

            let sphereGeometry = new THREE.SphereGeometry(atom_radius[geometry[i][0]], sphere_quality, sphere_quality);
            let sphereMesh = new THREE.Mesh(sphereGeometry);
            sphereMesh.castShadow = true;
            sphereMesh.receiveShadow = true;

            sphereMesh.updateMatrix();
            sphereMesh.geometry.faces.forEach(function(face) {
                face.materialIndex = 0;
            });

            sphereGeometry.translate(geometry[i][1].x, geometry[i][1].y, geometry[i][1].z);
            mergedGeometry.merge(sphereGeometry, sphereGeometry.matrix, i);
        };


        this.species[name] = { 'geom': mergedGeometry, 'material': materials }

        mergedGeometry.dispose();
        for (let mat of materials) {
            mat.dispose();
        }



    }

    add_molecule() {
        // This will turn into a many molecule method

        let temp = new Molecule('Reactant', this.species['Reactant'].geom, this.species['Reactant'].material);
        this.molecules.push(temp);
        this.scene.add(temp.mesh)
        this.selectedObjects.push(temp.mesh)
    }

    add_reaction_chamber() {
        // Reaction Chamber

        let texture1 = new THREE.TextureLoader().load('Images/steel.jpg');
        let texture2 = new THREE.TextureLoader().load('Images/glass1.gif');

        let material = new THREE.MeshPhysicalMaterial({
            color: 'lightblue',
            metalness: 1.0,
            roughness: .1,
            alphaMap: texture2,
            alphaTest: 0.33,
            envMap: texture2,
            envMapIntensity: .9,
            depthTest: true,
            transparency: .75,
            transparent: true,
            side: THREE.DoubleSide,
        });

        let geometry = new THREE.BoxBufferGeometry(this.chamber_edge_length, this.chamber_edge_length, this.chamber_edge_length);
        this.chamber = new THREE.Mesh(geometry, material);
        this.scene.add(this.chamber);

        geometry.dispose();
        material.dispose();
        //selectedObjects.push(chamber)
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));


        for (let i = 0; i < this.molecules.length; i++) {
            this.molecules[i].update();
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