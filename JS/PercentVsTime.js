class PercentVsTime {
    constructor(incoming_data) {
        this.data = incoming_data;

        this.w = document.getElementById("PercentVsTime").clientWidth;
        this.h = document.getElementById("PercentVsTime").clientHeight;
        this.margin = { top: 40, right: 40, bottom: 40, left: 100 };
        this.width = this.w - this.margin.left - this.margin.right;
        this.height = this.h - this.margin.top - this.margin.bottom;

        // MAIN element here
        this.svg = d3.select("#PercentVsTime").append("svg")
            .attr("width", this.w)
            .attr("height", this.h)
            .append("g")

        // SCALES
        this.x = d3.scaleLinear()
            .domain([0, 100])
            .range([this.margin.left, this.width])

        this.y = d3.scaleLinear()
            .domain([d3.max(this.data, (d) => { return d.percent; })[0], 0])
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
            .text("Proportion")
            .attr('position', 'absolute')
            .style("text-anchor", "middle")
            .style("stroke", 'black')
            .attr("x", -this.height / 2).attr("y", -this.margin.left / 2)
            .attr("transform", "rotate(-90)")

        // LINES PATHS etc.
        this.line = d3.line()
            .x((d, i) => this.x(i)) // set the x values for the line generator
            .y((d) => this.y(d)) // set the y values for the line generator 
            .curve(d3.curveStep) // apply smoothing to the line





        // this.legendEnter = this.svg.append("g")
        //     .attr("class", "legend")
        //     .attr("transform", "translate(" + (this.width - this.margin.right - this.margin.left - 75) + ",25)").append("rect")
        //     .attr("width", 50)
        //     .attr("height", 75)
        //     .attr("fill", "#ffffff")
        //     .attr("fill-opacity", 0.7);


        // this.legendEnter.selectAll("text")
        //     .data(this.data).enter().append("text")
        //     .attr("y", function(d, i) { return (i * 20) + 25; })
        //     .attr("x", 5)
        //     .text((d) => { return d.name })
        //     .attr("stroke", (d) => { return this.z(d.name); });
    }


    init(incoming_data) {
        this.data = incoming_data;
        console.log("ProportionVsTime populating")
        this.svg.selectAll(".line").remove();

    }

    tick(incoming_data) {
        this.data = incoming_data;

        let num1 = d3.max(this.data[0].percent);
        let num2 = d3.max(this.data[1].percent);
        this.y.domain([d3.max([num1, num2]), 0])

        this.yAxes.attr("class", "y axis")
            .attr("transform", "translate(" + this.margin.left + ",0 )")
            .transition().duration(1000).call(d3.axisLeft().scale(this.y));

        // generate line paths
        var lines = this.svg.selectAll(".line").data(incoming_data).attr("class", "line");

        // transition from previous paths to new paths
        lines.transition().duration(1000)
            .attr("d", (d) => this.line(d.percent))
            .style("stroke", (d) => { return this.z(d.name); });

        // enter any new data
        lines.enter()
            .append("path")
            .attr("class", "line")
            .attr("d", (d) => this.line(d.percent))
            .style("stroke", (d) => { return this.z(d.name); });

        // exit
        lines.exit()
            .remove();

    }
}

export default PercentVsTime