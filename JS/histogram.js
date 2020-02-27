class Histogram {
    constructor(incoming_data, blank_target, t_step, steps, element_id, title) {
        this.data = incoming_data;

        this.title = title;
        this.blank_target = blank_target;
        this.t_step = t_step;
        this.steps = steps;


        this.w = document.getElementById(element_id).clientWidth;
        this.h = document.getElementById(element_id).clientHeight;
        this.margin = { top: 10, right: 10, bottom: 20, left: 40 };
        this.width = this.w - this.margin.left - this.margin.right;
        this.height = this.h - this.margin.top - this.margin.bottom;

        // MAIN
        this.svg = d3.select("#" + element_id).append("svg")
            .attr("width", this.w)
            .attr("height", this.h)
            .append("g")

        // SCALES
        // this.x = d3.scaleLinear()
        //     .domain(this.data.map(d => { return d.count; }))
        //     .range([this.margin.left, this.width])
        let velocities = [];

        this.x = d3.scaleLinear()
            .domain([0, 1])
            .range([this.margin.left, this.width]);

        this.y = d3.scaleLinear()
            .domain([d3.max(velocities), 0])
            .range([this.margin.top, this.height]);

        this.z = d3.scaleOrdinal().domain(this.data)
            .range(d3.schemeSet3);


        // AXES 
        this.xAxes = this.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(" + 0 + "," + this.height + ")")
            .call(d3.axisBottom().scale(this.x));

        this.yAxes = this.svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + this.margin.left + ",0 )")
            .call(d3.axisLeft().scale(this.y));
    }

    init(incoming_data) {
        //console.log('In tick')
        this.data = incoming_data;
        console.log("Histogram populating")
        this.svg.selectAll("rect").remove();

        this.svg.selectAll(".bar").remove();

    }


    tick(incoming_data) {
        this.svg.selectAll(".bar").remove();
        //console.log('In tick')
        this.data = incoming_data;

        //let objAmmo = objThree.userData.physicsBody;
        //incoming_data[0].instances[0].mesh.userData.physicsBody.setLinearVelocity(new Ammo.btVector3(1, 1, 1))
        //console.log(incoming_data[0].instances[0].mesh.userData.physicsBody.getLinearVelocity());
        //console.log(incoming_data[0].instances[0].mesh.userData.physicsBody.getLinearVelocity().x());



        let velocities = [];
        // console.log(this.data[0]);
        // console.log(this.data[0].instances);

        for (let i = 0; i < this.data.length; i++) {
            for (let j = 0; j < this.data[i].instances.length; j++) {

                console.log(incoming_data[i].instances[j]);
                let vec = incoming_data[i].instances[j].mesh.userData.physicsBody.getLinearVelocity();
                let magnitude = Math.sqrt(Math.pow(vec.x(), 2) + Math.pow(vec.y(), 2) + Math.pow(vec.z(), 2));
                //let magnitude = vec.x;
                velocities.push(magnitude);
            }
        }
        console.log(velocities);


        console.log(d3.min(velocities));
        this.x
            .domain([d3.min(velocities), d3.max(velocities)])
            .range([this.margin.left, this.width]);;

        this.xAxes.attr("class", "x axis")
            .transition().duration(1000)
            .call(d3.axisBottom().scale(this.x))

        // set the parameters for the histogram
        this.histogram = d3.histogram()
            .value(function(d) { return +d; }) // I need to give the vector of value
            .domain(this.x.domain()) // then the domain of the graphic
            .thresholds(this.x.ticks(5)); // then the numbers of bins

        let bins1 = this.histogram(velocities);
        let bins2 = this.histogram(velocities);


        console.log(bins1[0]);
        console.log(bins1);


        this.y = d3.scaleLinear()
            .domain([d3.max(bins1, function(d) { return d.length; }), 0])
            .range([this.margin.top, this.height]);

        this.yAxes.attr("class", "y axis")
            .attr("transform", "translate(" + this.margin.left + ",0 )")
            .transition().duration(1000)
            .call(d3.axisLeft().scale(this.y));


        // // generate line paths
        this.bars = this.svg.selectAll(".bar").data(bins1).attr("class", "bar");

        // // transition from previous paths to new paths
        this.bars.transition().duration(1000)
            .ease(d3.easeLinear)
            .attr('class', 'bar')
            .attr("x", 1)
            .attr("transform", (d) => { return "translate(" + this.x(d.x0) + "," + this.y(d.length) + ")"; })
            .attr("width", (d) => { return this.x(d.x1) - this.x(d.x0) - 4 }) //return this.x(d.x1) - this.x(d.x0)
            .attr("height", (d) => { return this.y(0) - this.y(d.length); })



        // // enter any new data
        this.bars.enter()
            .append("rect")
            .attr('class', 'bar')
            .style("fill", (d) => { return this.z(this.data.name); })
            .attr("x", 1)
            .attr("transform", (d) => { return "translate(" + this.x(d.x0) + "," + this.y(d.length) + ")"; })
            .attr("width", (d) => { return this.x(d.x1) - this.x(d.x0) - 4 }) //return this.x(d.x1) - this.x(d.x0)
            .attr("height", (d) => { return this.y(0) - this.y(d.length); })



        // exit
        this.bars.exit()
            .remove();


    }
}

export default Histogram;