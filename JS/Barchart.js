class Barchart {
    constructor(incoming_data, blank_target, t_step, steps, element_id, title) {
        this.data = incoming_data;
        this.title = title;
        this.blank_target = blank_target;
        this.t_step = t_step;
        this.steps = steps;


        this.w = document.getElementById("floating_bar_chart").clientWidth;
        this.h = document.getElementById("floating_bar_chart").clientHeight;
        this.margin = { top: 10, right: 10, bottom: 20, left: 40 };
        this.width = this.w - this.margin.left - this.margin.right;
        this.height = this.h - this.margin.top - this.margin.bottom;

        // MAIN
        this.svg = d3.select("#floating_bar_chart").append("svg")
            .attr("width", this.w)
            .attr("height", this.h)
            .append("g")

        // SCALES
        this.x = d3.scaleBand()
            .domain(this.data.map(d => { return d.name; }))
            .range([this.margin.left, this.width])
            .padding(.1)

        this.y = d3.scaleLinear()
            .domain([d3.max(this.data, (d) => { return d[this.blank_target]; })[0], 0])
            .range([this.margin.top, this.height])


        this.z = d3.scaleOrdinal().domain(this.data)
            .range(d3.schemeCategory10);

        // Lines Plots Bars etc.
        this.bars = this.svg.append('g').selectAll(".bar")
            .data(this.data).enter().append("rect")
            .attr('class', 'bar')
            .attr("x", (d) => this.x(d.name))
            .attr("y", (d) => this.y(d.count.slice(-1)[0]))
            .attr("width", this.x.bandwidth())
            .attr("height", (d) => { return (this.y(0) - this.y(d.count.slice(-1)[0])) })
            .attr("fill", (d) => { return this.z(d.name); });



        // AXES 
        this.xAxes = this.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(" + 0 + "," + this.height + ")")
            .call(d3.axisBottom().scale(this.x))

        this.yAxes = this.svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + this.margin.left + ",0 )")
            .call(d3.axisLeft().scale(this.y));


    }

    init() {
        console.log("Barchart populating")

        this.xAxes.attr("class", "x axis")
            .attr("transform", "translate(" + 0 + "," + this.height + ")")
            .transition().duration(100).call(d3.axisBottom().scale(this.x))


        //this.svg.selectAll(".bar").remove();

        this.x.domain(this.data.map(d => { return d.name; }))

        this.y.domain([d3.max(this.data, (d) => { return d[this.blank_target]; })[0], 0])



    }


    tick(incoming_data) {
        this.data = incoming_data;

        let num1 = d3.max(this.data[0][this.blank_target]);

        let num2 = d3.max(this.data[1][this.blank_target]);
        //console.log(num1)
        this.y.domain([d3.max([num1, num2]), 0])

        this.yAxes.attr("class", "y axis")
            .attr("transform", "translate(" + this.margin.left + ",0 )")
            .transition().duration(100).call(d3.axisLeft().scale(this.y));

        // generate line paths
        this.bars = this.svg.selectAll(".bar").data(this.data).attr("class", "bar");

        // transition from previous paths to new paths
        this.bars.transition().duration(1000)
            .ease(d3.easeLinear)
            .attr("y", (d) => this.y(d.count.slice(-1)[0]))
            .attr("height", (d) => { return (this.y(0) - this.y(d.count.slice(-1)[0])) })

        // enter any new data
        this.bars.enter()
            .append("path")
            .attr("class", "bar")
            .attr("x", (d) => this.x(d.name))
            .attr("y", (d) => this.y(d.count.slice(-1)[0]))
            .attr("width", this.x.bandwidth())
            .attr("height", (d) => { return (this.y(0) - this.y(d.count.slice(-1)[0])) })
            .attr("fill", (d) => { return this.z(d.name); });

        // exit
        this.bars.exit()
            .remove();
    }
}

export default Barchart;