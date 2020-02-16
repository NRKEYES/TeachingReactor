import Visualization from '/JS/Visualization.js'
import PercentVsTime from '/JS/PercentVsTime.js';
import CountVsTime from '/JS/CountVsTime.js';
import Barchart from '/JS/Barchart.js';
import SideView from '/JS/SideView.js';
import PhysicsManager from '/JS/PhysicsManager.js'





let population_1 = [75];
let population_2 = [25];
let orders_of_magnitude = 1;
let starting_amount = Math.pow(10, orders_of_magnitude);
let scaling_factor = .0000001
let species = [{
        'name': 'Reactants',
        'value': population_1,
        'count': [starting_amount]
    },
    {
        'name': 'Products',
        'value': population_2,
        'count': [0]
    }
];




let physics = new PhysicsManager(species, scaling_factor);
let visualizer = new Visualization(species);
let sideview = new SideView();
let count_v_time = new CountVsTime(species);
let percent_v_time = new PercentVsTime(species);
let percent_bar = new Barchart(species);






function start_simulation(orders_of_magnitude) {
    console.log(orders_of_magnitude)
    starting_amount = Math.pow(10, orders_of_magnitude);
    scaling_factor = .0000001

    physics.init();
    visualizer.init(starting_amount);
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
        physics.tick();
        //visualizer.tick(); // Will add after render look?
        count_v_time.tick();
        percent_v_time.tick();
        percent_bar.tick();

    }
}



// document.addEventListener("DOMContentLoaded", function() {
//     console.log("in load event")
//     window.setInterval(pop_v_time.tick(), 500);
// });

d3.select("#orders_of_magnitude").on("input", function() {
    orders_of_magnitude = this.value;
    console.log(this.value)
});


window.addEventListener('load', () => {
    console.log('Page is fully loaded');
    start_simulation(orders_of_magnitude);
});

document.querySelector('#run_simulation').addEventListener('click', () => {
    starting_amount = Math.pow(10, orders_of_magnitude);
    visualizer.clean_all();

    visualizer.init(starting_amount);
});

window.addEventListener('resize', () => visualizer.onWindowResize(), false);