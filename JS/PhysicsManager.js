import Visualization from '/JS/Visualization.js'
import PercentVsTime from '/JS/PercentVsTime.js';
import CountVsTime from '/JS/CountVsTime.js';
import Barchart from '/JS/Barchart.js';
import SideView from '/JS/SideView.js';


// raw starting numbers
let orders_of_magnitude = 1;
let chamber_edge_length = 15 // this should be in nm
let chamber_volume = Math.pow(chamber_edge_length, 3); // convert to nm3
let starting_amount = 100;
let starting_concentration = starting_amount / chamber_volume;
let starting_ratio = .95;
//let starting_amount = (Math.pow(chamber_edge_length / 5, 3) * 3.4).toFixed(0); // Scales to the chamber with STP values


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


k_fwd = k_fwd / Math.pow(chamber_volume, 1) // cancel out volume units.

let Keq = 5 * Math.pow(10, 0); // The ratio of k_fwd/k_rev

let k_rev = k_fwd / Keq; // will have coresponding units
let stoich_coef = 2.0;



let t_step = 0;
let t_step_target = .1;
let t = 0;


let species = [{
        'name': 'Reactants',
        'percent': [100],
        'count': [starting_amount],
        'instances': [],
        'coords': [
            ['N', new THREE.Vector3(0, 0, 0)],
            ['O', new THREE.Vector3(-.07, .12, 0)],
            ['O', new THREE.Vector3(-.07, -.12, 0)]
        ]
    },
    {
        'name': 'Products',
        'percent': [0],
        'count': [0],
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




let visualizer = new Visualization(species, chamber_edge_length);
let sideview = new SideView();
let count_v_time = new CountVsTime(species);
let percent_v_time = new PercentVsTime(species);
let percent_bar = new Barchart(species);





function print_info_block() {
    let block = document.getElementById('floating');
    block.innerHTML = "The time step is:" + t_step;

}


function find_time_step() {
    //console.log("Am I even being called?");
    let A = species[0].count.slice(-1)[0];
    t_step = Math.abs((Math.pow(10, t_step_target) / (-1 * k_fwd * Math.pow(A, 2) + k_rev)));
    return t_step;
}

function tick() {
    // Actually move the particles around.
    //simulation()



    // d[A]/dt= k_f[A] + k_b[B]
    // d[A]= k_f[A]*dt + k_b[B]*dt

    let A = species[0].count.slice(-1)[0];
    let B = species[1].count.slice(-1)[0];
    let percent_product = B / (A + B);
    let delta_A = (-1 * k_fwd * Math.pow(A, 2) + k_rev * B) * t_step;

    console.log('Terms');
    console.log(-1 * k_fwd * Math.pow(A, 2));
    console.log(k_rev * B);
    console.log(delta_A);

    //get delta_A to 2
    let time_until_next = Math.abs(Math.ceil(stoich_coef / delta_A)) + t;

    //stuff as needed
    // if (time_until_next > 100) {
    //     time_until_next = 100;
    // }
    for (t; t < time_until_next; t++) {
        species[0].percent.push(1 - percent_product);
        species[0].count.push(A);

        species[1].percent.push(percent_product);
        species[1].count.push(B);

    }
    //then subtract
    A = A + Math.sign(delta_A) * 2;
    B = B - Math.sign(delta_A) * 1;

    percent_product = B / (A + B);



    species[0].percent.push(1 - percent_product);
    species[0].count.push(A);

    species[1].percent.push(percent_product);
    species[1].count.push(B);
}


function update_all() {
    t++;
    if (t < 100) {
        tick();
        //visualizer.tick(); // Will add after render look?
        count_v_time.tick(species);
        percent_v_time.tick(species);
        percent_bar.tick();

    }
}

function start_simulation() {
    t_step = find_time_step();
    t = 0

    visualizer.clean_all();
    visualizer.init(chamber_edge_length);

    count_v_time.init(species);
    percent_v_time.init(species);

    sideview.init();
    percent_bar.init();

    setInterval(update_all, 1000);
}







// Add monitors the the main.html page as needed


window.addEventListener('load', () => {
    console.log('Page is fully loaded');
    document.getElementById("backward_rate").value = k_rev;
    document.getElementById("backward_rate").parentElement.lastElementChild.innerHTML = k_rev;

    document.getElementById("forward_rate").value = k_fwd;
    document.getElementById("forward_rate").parentElement.lastElementChild.innerHTML = k_fwd;
});

document.querySelector('#run_simulation').addEventListener('click', () => {
    starting_amount = 3 * Math.pow(10, orders_of_magnitude);


    species = [{
            'name': 'Reactants',
            'percent': [starting_ratio],
            'count': [starting_amount * starting_ratio],
            'instances': [],
            'coords': [
                ['N', new THREE.Vector3(0, 0, 0)],
                ['O', new THREE.Vector3(-.07, .12, 0)],
                ['O', new THREE.Vector3(-.07, -.12, 0)]
            ]
        },
        {
            'name': 'Products',
            'percent': [1 - starting_ratio],
            'count': [starting_amount * (1 - starting_ratio)],
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

    start_simulation();
});

window.addEventListener('resize', () => visualizer.onWindowResize(), false);



function update_slider_value(passed) {
    passed.parentElement.lastElementChild.innerHTML = passed.value;
    //console.log(this.parentElement.lastElementChild.innerHTML)
}
d3.select("#orders_of_magnitude").on("input", function() {
    orders_of_magnitude = this.value;
    console.log(starting_amount = 3 * Math.pow(10, orders_of_magnitude));
    update_slider_value(this);
});
d3.select("#time_step").on("input", function() {
    //t_step = this.value * k_rev;
    t_step_target = this.value;
    this.parentElement.lastElementChild.innerHTML = this.value;
});
d3.select("#initial_ratio").on("input", function() {
    starting_ratio = this.value / 100;

    this.parentElement.lastElementChild.innerHTML = this.value / 100;

});
d3.select("#edge_length").on("input", function() {
    chamber_edge_length = this.value;
    update_slider_value(this);

});

d3.select("#forward_rate").on("input", function() {
    k_fwd = this.value;
    k_fwd_updated();
    update_slider_value(this);

});
d3.select("#equilibrium_constant").on("input", function() {
    Keq = this.value;
    Keq_updated();
    update_slider_value(this);

});
d3.select("#backward_rate").on("input", function() {
    k_rev = this.value;
    K_rev_updated();
    update_slider_value(this);

});

function k_fwd_updated() {
    k_rev = k_fwd - Keq;
    //console.log(document.getElementById('backward_rate'))
    document.getElementById("backward_rate").value = k_rev;
    document.getElementById("equilibrium_constant").value = Keq;
    document.getElementById("equilibrium_constant").parentElement.lastElementChild.innerHTML = Keq;
    document.getElementById("backward_rate").parentElement.lastElementChild.innerHTML = k_rev;

}

function Keq_updated() {
    k_rev = k_fwd - Keq;
    document.getElementById("backward_rate").value = k_rev;
    document.getElementById("backward_rate").parentElement.lastElementChild.innerHTML = k_rev;
}

function K_rev_updated() {
    k_fwd = k_rev + Keq;
    document.getElementById("forward_rate").value = k_fwd;
    document.getElementById("equilibrium_constant").value = Keq;
    document.getElementById("equilibrium_constant").parentElement.lastElementChild.innerHTML = Keq;
    document.getElementById("forward_rate").parentElement.lastElementChild.innerHTML = k_fwd;

}



d3.select("#amount_chaos").on("input", function() {
    amount_chaos = this.value;
    update_slider_value(this);

});