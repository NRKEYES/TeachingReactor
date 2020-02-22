import Visualization from '/JS/Visualization.js'
import BlankVsTime from '/JS/BlankVsTime.js';
import Barchart from '/JS/Barchart.js';
import SideView from '/JS/SideView.js';


// raw starting numbers
let orders_of_magnitude = 1;
console.log(orders_of_magnitude)
let total_molecules = 5 * Math.pow(10, orders_of_magnitude);
console.log(total_molecules);

//chamber settings
let chamber_edge_length = 5; // this should be in nm
let chamber_volume = Math.pow(chamber_edge_length, 3); // convert to nm3

// molecule and species counts
let p_to_r_ratio = .1;
let r_to_p_ratio = 1 - p_to_r_ratio;

let reactant_initial = Math.trunc(total_molecules * r_to_p_ratio);
let product_initial = Math.trunc(total_molecules * p_to_r_ratio);
console.log(reactant_initial)

// unused info ATM
let starting_concentration = total_molecules / chamber_volume;
let amount_chaos = 1;


let species = [{
        'name': 'Reactants',
        'percent': [r_to_p_ratio],
        'count': [reactant_initial],
        'instances': [],
        'coords': [
            ['N', new THREE.Vector3(0, 0, 0)],
            ['O', new THREE.Vector3(-.07, .12, 0)],
            ['O', new THREE.Vector3(-.07, -.12, 0)]
        ]
    },
    {
        'name': 'Products',
        'percent': [p_to_r_ratio],
        'count': [product_initial],
        'instances': [],
        'coords': [
            ['N', new THREE.Vector3(0, 0, 0)],
            ['O', new THREE.Vector3(-0.07, 0.12, 0)],
            ['O', new THREE.Vector3(-0.07, -0.12, 0)],
            ['N', new THREE.Vector3(0.3, 0, 0)],
            ['O', new THREE.Vector3(0.37, 0.12, 0)],
            ['O', new THREE.Vector3(0.37, -0.12, 0)]
        ]
    }
];



let cm_to_nm = Math.pow(10, 21);
//Reaction Details
// https://kinetics.nist.gov/kinetics/ReactionSearch?r0=10102440&r1=10102440&r2=0&r3=0&r4=0&p0=10544726&p1=0&p2=0&p3=0&p4=0&expandResults=true&
//Many possible k_fwd units.
// let k_fwd = 1.2 * Math.pow(10, -12) // cm3/molecule s
// let k_fwd = 8.33 * Math.pow(10, 11) // molecule s/cm3
// let k_fwd = 8.33 * Math.pow(10, -10) // molecule s/nm3
let k_fwd = 1.2 * Math.pow(10, 9) // nm3/molecule s 


// The unit volume per molucule sec or volume per molecule  each second. 
// How can this be related back to physical measurements
// of the involved species.
k_fwd = k_fwd / chamber_volume // cancel out volume units. 1/(molecule sec)
console.log('k_fwd: ' + k_fwd);

//let Keq = 5 * Math.pow(10, 0); // The ratio of k_fwd/k_rev
let Keq = 5 //* 1.66

let k_rev = k_fwd / Keq; // will have coresponding units.   1/(molecule sec)
console.log('k_rev: ' + k_rev);

let stoich_coef = 2.0;

let t_step = 0;
let t_step_target = 1;
let t_eq = 1.0;
let t = 0;
let steps = 100


let visualizer = new Visualization(species, chamber_edge_length);
let sideview = new SideView();
let count_v_time = new BlankVsTime(species, 'count', t_step, steps, 'CountVsTime', '# of molecules present');
let percent_v_time = new BlankVsTime(species, 'percent', t_step, steps, 'PercentVsTime', 'Proportion of each species');
//let percent_bar = new Barchart(species);



function print_info_block() {
    let block = document.getElementById('floating').lastElementChild;
    block.innerHTML = '';
    let textnode = null;
    let node = null; // Create a <li> node

    textnode = document.createTextNode("The time step is: " + t_step + " seconds");
    node = document.createElement("li");
    node.appendChild(textnode);
    block.appendChild(node)

    textnode = document.createTextNode("There were initially " + reactant_initial + " Reactant Molecules.");
    node = document.createElement("li");
    node.appendChild(textnode);
    block.appendChild(node)

    textnode = document.createTextNode("There were initially " + product_initial + " Product Molecules.");
    node = document.createElement("li");
    node.appendChild(textnode);
    block.appendChild(node)

    textnode = document.createTextNode("The volume of the reactor is " + chamber_volume + " nm^3.");
    node = document.createElement("li");
    node.appendChild(textnode);
    block.appendChild(node)

    textnode = document.createTextNode("The molecular density is " + reactant_initial / chamber_volume + " molecules/nm^3.");
    node = document.createElement("li");
    node.appendChild(textnode);
    block.appendChild(node)


    let favor = 'Reactant'
    if (Keq > 1) {
        favor = 'Product'
    }
    if (Keq == 1) {
        favor = 'neither'
    }
    textnode = document.createTextNode("This reaction favors the " + favor + " side.");
    node = document.createElement("li");
    node.appendChild(textnode);
    block.appendChild(node)

}

function quadratic_solver(a, b, c) {

    var a2 = 2 * a;
    var ac4 = 4 * a * c;
    var dis = b * b;
    var dis = dis - ac4;

    if (dis < 0) {
        console.log('Quadratic Failure')
        return null;
    } else {
        var dis_sqrt = Math.sqrt(dis);
        var x1 = -b + dis_sqrt;
        var x1 = x1 / a2;
        var x2 = -b - dis_sqrt;
        var x2 = x2 / a2;
        console.log('x1: ' + x1);
        console.log('x2: ' + x2);
        return x2;
    }
}


function compute_delta_per_time(a, b) {
    // d[A]/dt= k_f[A] + k_b[B]
    // d[A]= k_f[A]*dt + k_b[B]*dt
    let forward_term = -1 * k_fwd * Math.pow(a, 2);
    let reverse_term = k_rev * b;
    let delta = forward_term + reverse_term;

    // console.log('forward: ' + forward_term + 'mol/sec');
    // console.log('reverse: ' + reverse_term + '/mol*sec');
    // console.log('delta: ' + delta + '/mol*sec');
    return delta;
}

function find_time_step() {
    let A = species[0].count.slice(-1)[0];
    let B = species[1].count.slice(-1)[0];

    // What should the eq concentration be:
    let pop_delta = quadratic_solver(
        4 * Keq,
        (-1 * (4 * A * Keq + 1)),
        (Math.pow(A, 2) * Keq) - B
    );


    let delta_to_eq = pop_delta * stoich_coef;

    t_eq = Math.abs(delta_to_eq / compute_delta_per_time(A, B));



    t_step = t_eq / steps;



    // console.log('eq prediction: ' + (compute_delta_per_time(A, B) * t_eq));

    // console.log("pop_delta: " + pop_delta);
    // console.log("delta_to_eq: " + delta_to_eq);
    // console.log(-1 * k_fwd * Math.pow(A, 2) + k_rev * B);


    // console.log("t_eq:" + t_eq);
    // console.log("reactant_initial: " + reactant_initial);
    // console.log("t_step_target: " + t_step_target);
    // console.log("A: " + A);
    // console.log("t_eq:" + t_eq);
    // console.log("t_step: " + t_step);
    // console.log('k_fwd: ' + k_fwd * t_step);
    // console.log('k_rev: ' + k_rev * t_step);

}

function simulation() {
    console.log("Agent Based Physics")
    console.log(species)



    //for (name in species) {
    //console.log(name)
    //console.log(species[name].instances[0])

    // for (mol of species[name].instances) {
    //     //console.log(instance)
    // }
}

function numerical_simulation() {
    let A = species[0].count.slice(-1)[0];
    let B = species[1].count.slice(-1)[0];
    let percent_product = Math.abs(B) / (Math.abs(A) + Math.abs(B));

    let counter = 1;
    let delta_A = compute_delta_per_time(A, B) * (t_step * counter);

    while (Math.abs(delta_A) < stoich_coef) {
        //console.log("loop: " + delta_A)
        species[0].percent.push(1 - percent_product);
        species[0].count.push(A);

        species[1].percent.push(percent_product);
        species[1].count.push(B);


        counter++;
        delta_A = compute_delta_per_time(A, B) * (t_step * counter);
        t++
        if (t > steps) {
            //console.log("boop:")
            break;
        }
    }
    //then subtract

    A = A + (Math.floor(delta_A / 2)) * stoich_coef;
    B = B - Math.floor(delta_A / 2);


    //percent_product = B / (A + B);
    percent_product = Math.abs(B) / (Math.abs(A) + Math.abs(B));

    species[0].percent.push(1 - percent_product);
    species[1].percent.push(percent_product);

    species[0].count.push(A);
    species[1].count.push(B);
}

function update_all_sliders() {

    document.getElementById("orders_of_magnitude").value = orders_of_magnitude;
    document.getElementById("orders_of_magnitude").parentElement.lastElementChild.innerHTML = orders_of_magnitude;

    document.getElementById("initial_ratio").value = p_to_r_ratio * 100;
    document.getElementById("initial_ratio").parentElement.lastElementChild.innerHTML = p_to_r_ratio;

    document.getElementById("edge_length").value = chamber_edge_length;
    document.getElementById("edge_length").parentElement.lastElementChild.innerHTML = chamber_edge_length;

    document.getElementById("forward_rate").value = k_fwd;
    document.getElementById("forward_rate").parentElement.lastElementChild.innerHTML = k_fwd;

    document.getElementById("equilibrium_constant").value = Keq;
    document.getElementById("equilibrium_constant").parentElement.lastElementChild.innerHTML = Keq;

    document.getElementById("backward_rate").value = k_rev;
    document.getElementById("backward_rate").parentElement.lastElementChild.innerHTML = k_rev;

    document.getElementById("time_step").value = t_step_target;
    document.getElementById("time_step").parentElement.lastElementChild.innerHTML = t_step_target;

    document.getElementById("amount_chaos").value = amount_chaos;
    document.getElementById("amount_chaos").parentElement.lastElementChild.innerHTML = amount_chaos;


    // TODO make more generic
    // let slides = document.getElementsByClassName('slidecontainer');
    // console.log(slides)
}

function update_all() {
    if (t < steps) {
        // Run the differential equations numerically with appropriate discrete modifications.
        numerical_simulation();
        // Actually move the particles around.
        //simulation();

        count_v_time.tick(species);
        percent_v_time.tick(species);
        //percent_bar.tick();
        visualizer.tick(); // Will add after render look?

    }
}

function start_simulation() {
    find_time_step();
    print_info_block();
    t = 0;

    visualizer.clean_all();
    visualizer.init(species, chamber_edge_length);

    count_v_time.init(species, t_step, steps);
    percent_v_time.init(species, t_step, steps);

    sideview.init();

    //percent_bar.init();

    setInterval(update_all, 1000);
}

// Add monitors the the main.html page as needed
window.addEventListener('load', () => {
    console.log('Page is fully loaded');

    update_all_sliders();
    print_info_block();
});

document.querySelector('#run_simulation').addEventListener('click', () => {
    species = [{
            'name': 'Reactants',
            'percent': [r_to_p_ratio],
            'count': [reactant_initial],
            'instances': [],
            'coords': [
                ['N', new THREE.Vector3(0, 0, 0)],
                ['O', new THREE.Vector3(-.07, .12, 0)],
                ['O', new THREE.Vector3(-.07, -.12, 0)]
            ]
        },
        {
            'name': 'Products',
            'percent': [p_to_r_ratio],
            'count': [product_initial],
            'instances': [],
            'coords': [
                ['N', new THREE.Vector3(0, 0, 0)],
                ['O', new THREE.Vector3(-0.07, 0.12, 0)],
                ['O', new THREE.Vector3(-0.07, -0.12, 0)],
                ['N', new THREE.Vector3(0.3, 0, 0)],
                ['O', new THREE.Vector3(0.37, 0.12, 0)],
                ['O', new THREE.Vector3(0.37, -0.12, 0)]
            ]
        }
    ];

    console.log(species)

    update_all_sliders();

    start_simulation();
});
document.querySelector('#clear_graphs').addEventListener('click', () => {

    count_v_time.init(species, t_step, steps);
    percent_v_time.init(species, t_step, steps);

});

window.addEventListener('resize', () => visualizer.onWindowResize(), false);

d3.select("#orders_of_magnitude").on("input", function() {
    orders_of_magnitude = this.value;
    // raw starting numbers
    total_molecules = 5 * Math.pow(10, orders_of_magnitude);
    console.log(total_molecules);

    reactant_initial = total_molecules * r_to_p_ratio
    product_initial = Math.trunc(total_molecules * p_to_r_ratio)
    console.log(reactant_initial)

    update_all_sliders();
});
d3.select("#time_step").on("input", function() {
    t_step_target = this.value;
    update_all_sliders();
});
d3.select("#initial_ratio").on("input", function() {
    p_to_r_ratio = this.value / 100;
    r_to_p_ratio = 1 - p_to_r_ratio;

    reactant_initial = Math.trunc(total_molecules * r_to_p_ratio);
    product_initial = Math.trunc(total_molecules * p_to_r_ratio);
    starting_concentration = total_molecules / chamber_volume;
    update_all_sliders();
});
d3.select("#edge_length").on("input", function() {
    chamber_edge_length = this.value;
    update_all_sliders();
});
d3.select("#forward_rate").on("input", function() {
    k_fwd = this.value;
    k_rev = k_fwd - Keq;

    update_all_sliders();
});
d3.select("#equilibrium_constant").on("input", function() {
    Keq = 5 * Math.pow(10, this.value);
    k_rev = k_fwd / Keq;

    update_all_sliders();
});
d3.select("#backward_rate").on("input", function() {
    k_rev = this.value;
    k_fwd = k_rev * Keq;

    update_all_sliders();
});
d3.select("#amount_chaos").on("input", function() {
    amount_chaos = this.value;
    update_all_sliders();
});