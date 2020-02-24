class BlankVsTime {
    constructor(incoming_data, blank_target, t_step, steps, element_id, title) {
        this.data = incoming_data;
        this.title = title;
        this.blank_target = blank_target;
        this.t_step = t_step;
        this.steps = steps

        this.w = document.getElementById(element_id).clientWidth;
        this.h = document.getElementById(element_id).clientHeight;
        this.margin = { top: 40, right: 40, bottom: 40, left: 100 };
        this.width = this.w - this.margin.left - this.margin.right;
        this.height = this.h - this.margin.top - this.margin.bottom;

        // MAIN element here
        this.svg = d3.select("#" + element_id).append("svg")
            .attr("width", this.w)
            .attr("height", this.h)
            .append("g")

        // SCALES
        this.x = d3.scaleLinear()
            .domain([0, this.steps])
            .range([this.margin.left, this.width])

        this.y = d3.scaleLinear()
            .domain([d3.max(this.data, (d) => { return d[this.blank_target]; })[0], 0])
            .range([this.margin.top, this.height])

        this.z = d3.scaleOrdinal().domain(this.data)
            .range(d3.schemeSet3);

        // AXES 
        this.xAxes = this.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(" + 0 + "," + this.height + ")")
            .call(d3.axisBottom().scale(this.x))

        this.yAxes = this.svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + this.margin.left + ",0 )")
            .call(d3.axisLeft().scale(this.y));

        // AXES LABELS
        this.xAxes.append("text")
            .text("Time ->")
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


    init(incoming_data, t_step, steps) {
        console.log(this.blank_target + " VsTime populating")

        this.data = incoming_data;
        this.steps = steps
        this.t_step = t_step;

        this.x.domain([0, this.steps]);

        this.xAxes.attr("class", "x axis")
            .attr("transform", "translate(" + 0 + "," + this.height + ")")
            .transition().duration(100).call(d3.axisBottom().scale(this.x))


        //this.svg.selectAll(".line").remove();

        this.y.domain([d3.max(this.data, (d) => { return d[this.blank_target]; })[0], 0])

    }


    tick(incoming_data) {
        this.data = incoming_data;


        let num1 = d3.max(this.data[0][this.blank_target]);
        let num2 = d3.max(this.data[1][this.blank_target]);
        this.y.domain([d3.max([num1, num2]), 0])

        this.yAxes.attr("class", "y axis")
            .attr("transform", "translate(" + this.margin.left + ",0 )")
            .transition().duration(100).call(d3.axisLeft().scale(this.y));

        this.line = d3.line()
            .x((d, i) => this.x(i)) // set the x values for the line generator
            .y((d) => this.y(d)) // set the y values for the line generator 

        // generate line paths
        var lines = this.svg.selectAll(".line").data(this.data).attr("class", "line");

        // transition from previous paths to new paths
        lines.transition().duration(100)
            .attr("d", (d) => this.line(d[this.blank_target]))
            .style("stroke", (d) => { return this.z(d.name); });

        // enter any new data
        lines.enter()
            .append("path")
            .attr("class", "line")
            .attr("d", (d) => this.line(d[this.blank_target]))
            .style("stroke", (d) => { return this.z(d.name); });

        // exit
        lines.exit()
            .remove();

    }
}

export default BlankVsTime;