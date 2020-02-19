import Visualization from '/JS/Visualization.js'
import PercentVsTime from '/JS/PercentVsTime.js';
import CountVsTime from '/JS/CountVsTime.js';
import Barchart from '/JS/Barchart.js';
import SideView from '/JS/SideView.js';

let orders_of_magnitude = 1;
let amount_chaos = 50;
let starting_ratio = 1.0;
let chamber_edge_length = 15 // this should be in nm

let starting_amount = (Math.pow(chamber_edge_length / 5, 3) * 3.4).toFixed(0);

// reaction deets
// K = .005
// = k_fwd/k_rev
// https://kinetics.nist.gov/kinetics/ReactionSearch?r0=10102440&r1=10102440&r2=0&r3=0&r4=0&p0=10544726&p1=0&p2=0&p3=0&p4=0&expandResults=true&
//   k_fwd = 1.00E-12

let Keq = 0.005;
let scaling_factor = 29;
let k_fwd = 1.2 * Math.pow(10, -33 + scaling_factor); // 0.0000000000012 cm3/molecule s
let k_rev = k_fwd / Keq;
let stoich_coef = 2.0;
let t_step = 5.0 //* Math.pow(10, 29);
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





function start_simulation() {
    t = 0
    console.log(orders_of_magnitude)

    visualizer.clean_all();
    visualizer.init(chamber_edge_length);

    count_v_time.init(species);
    percent_v_time.init(species);

    sideview.init();
    percent_bar.init();

    setInterval(update_all, 1000);
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









function tick() {
    // Actually move the particles around.
    //simulation()



    // d[A]/dt= k_f[A] + k_b[B]
    // d[A]= k_f[A]*dt + k_b[B]*dt

    let A = species[0].count.slice(-1)[0];
    let B = species[1].count.slice(-1)[0];

    let delta_A = (-1 * k_fwd * Math.pow(A, 2) + k_rev * B) * t_step;
    console.log(delta_A);
    A = A + delta_A;
    B = B - (delta_A) / stoich_coef;

    let percent_product = B / (A + B);

    // let conc_reactants = starting_amount / (1 + k_fwd * starting_amount * t * t_step);
    // let conc_products = stoich_coef * (starting_amount - conc_reactants);
    // let percent_product = (conc_products / (conc_products + conc_reactants));

    species[0].percent.push(1 - percent_product);
    species[0].count.push(A);

    species[1].percent.push(percent_product);
    species[1].count.push(B);
    // for (name in species) {
    //     species[name].percent.push(1 - percent_product);
    //     species[name].count.push(A);
    // }
}




// Add monitors the the main.html page as needed


window.addEventListener('load', () => {
    console.log('Page is fully loaded');
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
    update_slider_value(this);

});

d3.select("#equilibrium_constant").on("input", function() {
    Keq = this.value;
    update_slider_value(this);

});

d3.select("#backward_rate").on("input", function() {
    k_rev = this.value;
    update_slider_value(this);

});

d3.select("#amount_chaos").on("input", function() {
    amount_chaos = this.value;
    update_slider_value(this);

});