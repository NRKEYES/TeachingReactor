class PercentVsTime {
    constructor(incoming_data) {
        this.data = incoming_data;

        this.w = document.getElementById("PercentVsTime").clientWidth;
        this.h = document.getElementById("PercentVsTime").clientHeight;
        this.margin = { top: 40, right: 100, bottom: 40, left: 100 };
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
            .domain([1, 0])
            .range([this.margin.top, this.height - this.margin.bottom]);

        this.z = d3.scaleOrdinal().domain(this.data)
            .range(d3.schemeSet3);


        // LINES PATHS etc.
        this.line = d3.line()
            .x((d, i) => this.x(i)) // set the x values for the line generator
            .y((d) => this.y(d)) // set the y values for the line generator 
            .curve(d3.curveMonotoneX) // apply smoothing to the line


        this.paths = this.svg.append("g").selectAll('.path')
            .data(this.data).enter().append("path") // for each population in data add a line
            .attr("class", "line")
            .style("stroke", 'orange')
            .style("fill", "none")
            .style("stroke-width", 4)
            .attr("d", (d) => this.line(d.percent)); // call line function on the value element - should be an array



        // AXES 
        this.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + this.height + ")")
            .call(d3.axisBottom().scale(this.x));

        this.svg.append("text")
            .style("text-anchor", "middle")
            .attr("y", this.height + this.margin.top)
            .attr("x", this.w / 2)
            .text("Time ->");

        this.svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + this.margin.left + ",0 )")
            .call(d3.axisLeft().scale(this.y));

        this.svg.append("text")
            .attr("x", this.margin.left / 2)
            .attr("y", (this.height / 2))
            //.attr("transform", "rotate(-90)")
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Percent %");



        this.legendEnter = this.svg.append("g")
            .attr("class", "legend")
            .attr("transform", "translate(" + (this.width - this.margin.right - this.margin.left - 75) + ",25)").append("rect")
            .attr("width", 50)
            .attr("height", 75)
            .attr("fill", "#ffffff")
            .attr("fill-opacity", 0.7);


        this.legendEnter.selectAll("text")
            .data(this.data).enter().append("text")
            .attr("y", function(d, i) { return (i * 20) + 25; })
            .attr("x", 5)
            .text((d) => { return d.name })
            .attr("stroke", (d) => { return this.z(d.name); });
    }

    init() {
        console.log("PercentVsTime populating")
    }

    tick() {
        this.paths.transition().duration(1000)
            .ease(d3.easeLinear)
            .attr("d", (d) => this.line(d.percent))
            .style("stroke", () =>
                '#' + Math.floor(Math.random() * 16777215).toString(16)
            );

    }
}

export default PercentVsTime