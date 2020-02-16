class CountVsTime {
    constructor(incoming_data) {
        this.data = incoming_data;
        console.log(this.data)

        this.w = document.getElementById("CountVsTime").clientWidth;
        this.h = document.getElementById("CountVsTime").clientHeight;
        this.margin = { top: 40, right: 100, bottom: 40, left: 100 };
        this.width = this.w - this.margin.left - this.margin.right;
        this.height = this.h - this.margin.top - this.margin.bottom;
        // MAIN element here
        this.svg = d3.select("#CountVsTime").append("svg")
            .attr("width", this.w)
            .attr("height", this.h)
            .append("g")

        // SCALES
        this.x = d3.scaleLinear()
            .domain([0, 100])
            .range([this.margin.left, this.width])


        this.y = d3.scaleLinear()
            .domain([d3.max(this.data, (d) => { return d.count; }), 0])
            .range([this.margin.top, this.height - this.margin.bottom])

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
            .attr("d", (d) => this.line(d.count)); // call line function on the value element - should be an array



        // AXES 
        this.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + this.height + ")")
            .call(d3.axisBottom().scale(this.x))

        this.svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + this.margin.left + ",0 )")
            .call(d3.axisLeft().scale(this.y));




        // var legendEnter = svg.append("g")
        //     .attr("class", "legend")
        //     .attr("transform", "translate(" + (width - margin.right - margin.left - 75) + ",25)");
        // legendEnter.append("rect")
        //     .attr("width", 50)
        //     .attr("height", 75)
        //     .attr("fill", "#ffffff")
        //     .attr("fill-opacity", 0.7);
        // legendEnter.append("text")
        //     .datum(data[0].name)
        //     .attr("y", 25)
        //     .attr("x", 5)
        //     .attr("fill", "blue");
    }


    init() {
        console.log("CountVsTime populating")

    }


    tick() {
        this.paths.transition().duration(1000)
            .ease(d3.easeLinear)
            .attr("d", (d) => this.line(d.count))
            .style("stroke", () =>
                '#' + Math.floor(Math.random() * 16777215).toString(16)
            );

    }
}

export default CountVsTime