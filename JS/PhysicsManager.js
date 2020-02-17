import Visualization from '/JS/Visualization.js'
import PercentVsTime from '/JS/PercentVsTime.js';
import CountVsTime from '/JS/CountVsTime.js';
import Barchart from '/JS/Barchart.js';
import SideView from '/JS/SideView.js';


let population_1 = [75];
let population_2 = [25];
let orders_of_magnitude = 1;
let amount_chaos = 50;
let starting_ratio;
let chamber_edge_length = 5 // this should be in nm

let starting_amount = Math.pow(10, orders_of_magnitude);
let scaling_factor = .0000001

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
    console.log(orders_of_magnitude)

    starting_amount = Math.pow(10, orders_of_magnitude);

    visualizer.init(chamber_edge_length);

    sideview.init();
    count_v_time.init();
    percent_v_time.init();
    percent_bar.init();

    setInterval(update_all, 1000);
}

let t = 0;

function update_all() {
    t++;

    if (t < 100) {
        tick();
        //visualizer.tick(); // Will add after render look?
        count_v_time.tick();
        percent_v_time.tick();
        percent_bar.tick();

    }
}







// reaction deets
// K = .005
// = k_fwd/k_rev
// https://kinetics.nist.gov/kinetics/ReactionSearch?r0=10102440&r1=10102440&r2=0&r3=0&r4=0&p0=10544726&p1=0&p2=0&p3=0&p4=0&expandResults=true&
//   k_fwd = 1.00E-12

let K = 0.005;
let k_fwd = 0.0000000000012 / scaling_factor; // cm3/molecule s
let k_rev = k_fwd / K;
let stoich_coef = .5;
let t_step = 100;



function tick() {

    // Actually move the particles around.
    //simulation()

    // d[A]/dt= k_f[A] + k_b[B]
    // d[A]= k_f[A]*dt + k_b[B]*dt

    let A = species[0].count.slice(-1)[0];
    let B = species[1].count.slice(-1)[0];

    let delta_A = (-1 * d3.randomNormal(1.0)(0.1) * k_fwd * A * A + k_rev * B) * t_step;

    A = A + delta_A;
    B = B - stoich_coef * (delta_A);

    let percent_product = B / (A + B);


    // let conc_reactants = starting_amount / (1 + k_fwd * starting_amount * t * t_step);
    // let conc_products = stoich_coef * (starting_amount - conc_reactants);
    // let percent_product = (conc_products / (conc_products + conc_reactants));

    //let current_pop = species[0].value.slice(-1)[0]

    species[0].percent.push(1 - percent_product);
    species[1].percent.push(percent_product);
    species[0].count.push(A);
    species[1].count.push(B);
}




// Add monitors the the main.html page as needed


window.addEventListener('load', () => {
    console.log('Page is fully loaded');
    start_simulation();
});

document.querySelector('#run_simulation').addEventListener('click', () => {
    starting_amount = Math.pow(10, orders_of_magnitude);
    visualizer.clean_all();

    visualizer.init(starting_amount);
});

window.addEventListener('resize', () => visualizer.onWindowResize(), false);

d3.select("#orders_of_magnitude").on("input", function() {
    orders_of_magnitude = this.value;
    console.log(this.value)
});
d3.select("#amount_chaos").on("input", function() {
    amount_chaos = this.value;
    console.log(this.value)
});