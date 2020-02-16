class Barchart {
    constructor(incoming_data) {
        this.data = incoming_data;
        console.log(this.data)

        this.w = document.getElementById("Barchart").clientWidth;
        this.h = document.getElementById("Barchart").clientHeight;
        this.margin = { top: 40, right: 100, bottom: 40, left: 100 };
        this.width = this.w - this.margin.left - this.margin.right;
        this.height = this.h - this.margin.top - this.margin.bottom;

        // MAIN
        this.svg = d3.select("#Barchart").append("svg")
            .attr("width", this.w)
            .attr("height", this.h)
            .append("g")

        // SCALES        
        this.x = d3.scaleLinear()
            .domain([0, 1])
            .range([this.margin.left, this.width])


        this.y = d3.scaleBand()
            .domain(this.data.map(d => { return d.name; }))
            .range([0, this.height])
            .padding(.4)

        // Lines Plots Bars etc.
        this.bars = this.svg.append('g').selectAll(".bar")
            .data(this.data).enter().append("rect")
            .attr('class', 'bar')
            .attr("x", this.x(0))
            .attr("height", this.y.bandwidth())
            .attr("fill", "steelblue")
            .attr("y", (d) => this.y(d.name))
            .attr("width", (d) => this.x(d.count.slice(-1)[0]) - this.margin.left)


        // AXES 
        this.svg.append("g")
            .call(d3.axisBottom().scale(this.x))
            .attr("class", "x axis")
            .attr("transform", "translate(0," + this.height + ")")


        this.svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + this.margin.left + ",0 )")
            .call(d3.axisLeft().scale(this.y));

        // this.svg.append("g")
        //     .attr("fill", "white")
        //     .attr("text-anchor", "end")
        //     .style("font", "12px sans-serif")
        //     .selectAll("text")
        //     .data(this.data)
        //     .attr("x", d => this.x(d.value[0]) - 4)
        //     .attr("y", (d, i) => this.y(i) + y.bandwidth() / 2)
        //     .attr("dy", "0.35em")
        //     .text(d => format(d.value));
    }

    init() {
        console.log("Barchart populating")
    }


    tick() {

        this.bars.transition().duration(1000)
            .ease(d3.easeLinear)
            .attr("fill", "red")
            .attr("width", (d) => this.x(d.count.slice(-1)[0]) - this.margin.left);

    }
}

export default Barchart;