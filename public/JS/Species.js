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

let envMap = new THREE.TextureLoader().load('Images/envMap.png');
envMap.mapping = THREE.SphericalReflectionMapping;



let structures = {};


//should be NOO
structures['Reactant'] = [
    ['N', new THREE.Vector3(0, 0, 0)],
    ['H', new THREE.Vector3(-.07, .12, 0)],
    ['H', new THREE.Vector3(-.07, -.12, 0)]
];

//should be NOONOO
structures['Product'] = [
    ['O', new THREE.Vector3(0, 0, 0)],
    ['H', new THREE.Vector3(-0.07, 0.12, 0)],
    ['H', new THREE.Vector3(-0.07, -0.12, 0)],
    ['O', new THREE.Vector3(0.3, 0, 0)],
    ['H', new THREE.Vector3(0.37, 0.12, 0)],
    ['H', new THREE.Vector3(0.37, -0.1, 0)]
]



class Species {
    constructor() {
        this.geometry = structures['Reactant']; // Setting up to import different geometries


        let materials = [];
        let mergedGeometry = new THREE.Geometry();

        // basic monochromatic energy preservation
        let roughness = .1;
        let diffuseColor = new THREE.Color().setHSL(0.0, 0.0, .9);

        for (let i = 0; i < this.geometry.length; i++) {
            let material = new THREE.MeshPhysicalMaterial({
                color: COLORS[this.geometry[i][0]],
                emissive: COLORS[this.geometry[i][0]],
                reflectivity: 1.0,
                color: diffuseColor,
                metalness: .9,
                roughness: roughness,
                envMap: envMap,
            });


        }
    }