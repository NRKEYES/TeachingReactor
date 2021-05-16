// Starting point
let species = [{
        name: "Reactants",
        percent: [r_to_p_ratio],
        count: [reactant_initial],
        instances: [],
        coords: [
            ["N", new THREE.Vector3(0, 0, 0)],
            ["O", new THREE.Vector3(-0.07, 0.12, 0)],
            ["O", new THREE.Vector3(-0.07, -0.12, 0)]
        ],
        mass: 46.0055 // g/mol
    },
    {
        name: "Products",
        percent: [p_to_r_ratio],
        count: [product_initial],
        instances: [],
        coords: [
            ["N", new THREE.Vector3(0, 0, 0)],
            ["O", new THREE.Vector3(-0.07, 0.12, 0)],
            ["O", new THREE.Vector3(-0.07, -0.12, 0)],
            ["N", new THREE.Vector3(0.3, 0, 0)],
            ["O", new THREE.Vector3(0.37, 0.12, 0)],
            ["O", new THREE.Vector3(0.37, -0.12, 0)]
        ],
        mass: 92.011, // g/mol
    }
];

// Where I want to go
let simulation_data = {}; // dictionary because it's gonna contain lots of goodies
simulation_data.chamber_size = 10;
simulation_data.species = {};


compound = {
    name: 'a',
    coords: [
        ["N", new THREE.Vector3(0, 0, 0)],
        ["O", new THREE.Vector3(-0.07, 0.12, 0)],
        ["O", new THREE.Vector3(-0.07, -0.12, 0)],
        ["N", new THREE.Vector3(0.3, 0, 0)],
        ["O", new THREE.Vector3(0.37, 0.12, 0)],
        ["O", new THREE.Vector3(0.37, -0.12, 0)]
    ],
    mass: 92.011, // g/mol
}

all_species = ['a', 'b', 'c', 'd']
for (given of all_species) {}
simulation_data.species[given] = given;




console.log(simulation_data);