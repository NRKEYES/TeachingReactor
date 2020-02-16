class PhysicsManager {
    constructor(incoming_data, scaling_factor) {

        this.data = incoming_data;

        // reaction deets
        // K = .005
        // = k_fwd/k_rev
        // https://kinetics.nist.gov/kinetics/ReactionSearch?r0=10102440&r1=10102440&r2=0&r3=0&r4=0&p0=10544726&p1=0&p2=0&p3=0&p4=0&expandResults=true&
        //   k_fwd = 1.00E-12

        this.K = 0.005;
        this.k_fwd = 0.0000000000012 / scaling_factor; // cm3/molecule s
        this.k_rev = this.k_fwd / this.K;
        this.stoich_coef = .5;
        this.t_step = 100;
    }

    init() {
        console.log("Physics Spinning up.")
    }

    tick() {

        // Actually move the particles around.
        //simulation()

        // d[A]/dt= k_f[A] + k_b[B]
        // d[A]= k_f[A]*dt + k_b[B]*dt

        let A = this.data[0].count.slice(-1)[0];
        let B = this.data[1].count.slice(-1)[0];

        let delta_A = (-1 * d3.randomNormal(1.0)(0.1) * this.k_fwd * A * A + this.k_rev * B) * this.t_step;

        A = A + delta_A;
        B = B - this.stoich_coef * (delta_A);
        let percent_product = B / (A + B);


        // let conc_reactants = starting_amount / (1 + k_fwd * starting_amount * t * t_step);
        // let conc_products = stoich_coef * (starting_amount - conc_reactants);
        // let percent_product = (conc_products / (conc_products + conc_reactants));

        //let current_pop = species[0].value.slice(-1)[0]

        this.data[0].value.push(1 - percent_product);
        this.data[1].value.push(percent_product);
        this.data[0].count.push(A);
        this.data[1].count.push(B);

        //console.log(this.data)
    }

}

export default PhysicsManager;