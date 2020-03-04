class Histogram {
    constructor(incoming_data, blank_target, t_step, steps, element_id, title) {
        this.data = incoming_data;

        this.title = title;
        this.blank_target = blank_target;
        this.t_step = t_step;
        this.steps = steps;


        this.w = document.getElementById(element_id).clientWidth;
        this.h = document.getElementById(element_id).clientHeight;
        this.margin = { top: 40, right: 40, bottom: 40, left: 100 };
        this.width = this.w - this.margin.left - this.margin.right;
        this.height = this.h - this.margin.top - this.margin.bottom;

        // MAIN
        this.svg = d3.select("#" + element_id).append("svg")
            .attr("width", this.w)
            .attr("height", this.h)
            .append("g")


        this.x = d3.scaleLinear()
            .domain([0, 1])
            .range([this.margin.left, this.width]);

        this.y = d3.scaleLinear()
            .domain([1, 0])
            .range([this.margin.top, this.height]);

        this.z = d3.scaleOrdinal().domain(this.data)
            .range(d3.schemeCategory10);


        // AXES 
        this.xAxes = this.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(" + 0 + "," + this.height + ")")
            .call(d3.axisBottom().scale(this.x));

        this.yAxes = this.svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + this.margin.left + ",0 )")
            .call(d3.axisLeft().scale(this.y));


        // AXES LABELS
        this.xAxes.append("text")
            .text("|V| nm/s? Check unit")
            .style("text-anchor", "middle")
            .style("stroke", 'black')
            .attr("x", this.w / 2).attr("y", this.margin.bottom)

        this.yAxes.append("text")
            .text(this.title)
            .attr('position', 'absolute')
            .style("text-anchor", "middle")
            .style("stroke", 'black')
            .attr("x", -this.height / 2).attr("y", -this.margin.left / 2)
            .attr("transform", "rotate(-90)")

    }

    init(incoming_data) {
        //console.log('In tick')
        this.data = incoming_data;
        console.log("Histogram populating")
        this.svg.selectAll("rect").remove();

        this.svg.selectAll(".bar").remove();

        this.max = 1;
    }


    tick(incoming_data) {
        // TODO clean this up more
        // TODO add KDE - density plots
        //TODO make sure this can take more than 2 categories??


        this.svg.selectAll(".bar").remove();

        this.data = incoming_data;

        // TODO
        // This can probably all be optimized out by just calling a function 
        // on each velocity vector stored in the incoming_data
        let velocities = [];

        for (let i = 0; i < this.data.length; i++) {
            let temp_data_set = { 'name': incoming_data[i].name, 'mag': [] };
            for (let j = 0; j < this.data[i].instances.length; j++) {
                let vec = incoming_data[i].instances[j].mesh.userData.physicsBody.getLinearVelocity();
                let magnitude = Math.sqrt(Math.pow(vec.x(), 2) + Math.pow(vec.y(), 2) + Math.pow(vec.z(), 2));
                temp_data_set.mag.push(magnitude);
            }
            velocities.push(temp_data_set);
        }


        let num1 = d3.max(velocities[0].mag);
        let num2 = d3.max(velocities[1].mag);
        let max_run = d3.max([num1, num2]);
        this.max = d3.max([this.max, max_run])

        this.x
            .domain([0, this.max])
            .range([this.margin.left, this.width]);;


        this.xAxes.attr("class", "x axis")
            .transition().duration(1000)
            .call(d3.axisBottom().scale(this.x))

        // -----           set the parameters for the histogram
        let num_bins = 10;


        // this.histogram = d3.histogram()
        //     .value((d) => { return +d; })
        //     .domain(this.x.domain()) // then the domain of the graphic
        //     .thresholds(this.x.ticks(num_bins)) // then the numbers of bins // I need to give the vector of value
        this.histogram = d3.histogram()
            .value((d) => { return +d; })
            .domain(this.x.domain()) // then the domain of the graphic
            .thresholds(d3.range(0, this.max, this.max / num_bins)) // then the numbers of bins // I need to give the vector of value



        let bins1 = this.histogram(velocities[0].mag);
        let bins2 = this.histogram(velocities[1].mag);

        let num3 = d3.max(bins1, function(d) { return d.length; });
        let num4 = d3.max(bins2, function(d) { return d.length; });;

        this.y = d3.scaleLinear()
            .domain([d3.max([num3, num4]), 0])
            .range([this.margin.top, this.height]);

        this.yAxes.attr("class", "y axis")
            .attr("transform", "translate(" + this.margin.left + ",0 )")
            .transition().duration(1000)
            .call(d3.axisLeft().scale(this.y));



        this.bars = this.svg.selectAll(".bar1").data(bins1).attr("class", "bar1");
        let bar_gap = 5;
        this.bars.enter()
            .append("rect")
            .attr('class', 'bar1')
            .attr("x", 1)
            .attr("transform", (d) => { return "translate(" + this.x(d.x0) + "," + this.y(d.length) + ")"; })
            .attr("width", (d) => { return this.x(d.x1) - this.x(d.x0) - bar_gap }) //return this.x(d.x1) - this.x(d.x0)
            .attr("height", (d) => { return this.y(0) - this.y(d.length); })
            .style("fill", (d) => { return this.z(velocities[0].name); })
            .style('opacity', .5);

        this.bars.transition().duration(1000)
            .ease(d3.easeLinear)
            .attr("transform", (d) => { return "translate(" + this.x(d.x0) + "," + this.y(d.length) + ")"; })
            .attr("width", (d) => { return this.x(d.x1) - this.x(d.x0) - bar_gap }) //return this.x(d.x1) - this.x(d.x0)
            .attr("height", (d) => { return this.y(0) - this.y(d.length); })

        this.bars.exit()
            .remove();



        this.bars2 = this.svg.selectAll(".bar2").data(bins2).attr("class", "bar2");
        this.bars2.enter()
            .append("rect")
            .attr('class', 'bar2')
            .attr("x", 1)
            .attr("transform", (d) => { return "translate(" + this.x(d.x0) + "," + this.y(d.length) + ")"; })
            .attr("width", (d) => { return this.x(d.x1) - this.x(d.x0) - bar_gap }) //return this.x(d.x1) - this.x(d.x0)
            .attr("height", (d) => { return this.y(0) - this.y(d.length); })
            .style("fill", (d) => { return this.z(velocities[1].name); })
            .style('opacity', .5);

        this.bars2.transition().duration(1000)
            .ease(d3.easeLinear)
            .attr("transform", (d) => { return "translate(" + this.x(d.x0) + "," + this.y(d.length) + ")"; })
            .attr("width", (d) => { return this.x(d.x1) - this.x(d.x0) - bar_gap }) //return this.x(d.x1) - this.x(d.x0)
            .attr("height", (d) => { return this.y(0) - this.y(d.length); })

        this.bars2.exit()
            .remove();


        //TODO Add this kind of thing to other classes as well
        let diag = false;
        if (diag == true) {
            console.log('In Histrogram Tick.------------------------------')
            console.log(velocities);
            console.log(velocities[0]);
            console.log(velocities[0].mag);

            console.log(d3.max(velocities[0].mag));
            console.log(d3.max(velocities[1].mag));

            console.log('num1 and num2');
            console.log(num1);
            console.log(num2);
            console.log(d3.max([num1, num2]));
            console.log(d3.range(0, biggest, biggest / num_bins))
            console.log('num3 and num4');
            console.log(num3);
            console.log(num4);
            console.log(bins1);
        }
    }
}

export default Histogram;