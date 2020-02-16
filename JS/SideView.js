class SideView {
    constructor(incoming_data) {


        this.data = incoming_data;

        this.w = document.getElementById("SideView").clientWidth;
        this.h = document.getElementById("SideView").clientHeight;
        this.margin = { top: 40, right: 100, bottom: 40, left: 100 };
        this.width = this.w - this.margin.left - this.margin.right;
        this.height = this.h - this.margin.top - this.margin.bottom;

        // MAIN element here
        this.svg = d3.select("#SideView").append("svg")
            .attr("width", this.w)
            .attr("height", this.h)
            .append("g")

        this.circle = this.svg.selectAll("circle")
            .data(d3.range(1000).map(() => {
                return {
                    x: this.w * Math.random(),
                    y: this.h * Math.random(),
                    dx: Math.random() - 0.5,
                    dy: Math.random() - 0.5
                };
            }))
            .enter().append("circle")
            .attr("r", 2.5);

        this.text = this.svg.append("text")
            .attr("x", 20)
            .attr("y", 20);

        this.start = Date.now();
        this.frames = 0;

        d3.timer(() => {

            // Update the FPS meter.
            let now = Date.now(),
                duration = now - this.start;
            this.text.text(~~(++this.frames * 1000 / duration));
            if (duration >= 1000) this.frames = 0, this.start = now;

            // Update the circle positions.
            this.circle
                .attr("cx", (d) => {
                    d.x += d.dx;
                    if (d.x > this.w) d.x -= this.w;
                    else if (d.x < 0) d.x += this.w;
                    return d.x;
                })
                .attr("cy", (d) => {
                    d.y += d.dy;
                    if (d.y > this.h) d.y -= this.h;
                    else if (d.y < 0) d.y += this.h;
                    return d.y;
                });

        });

    }


    init() {

        console.log("SideViews Spinning up.")

    }
}

export default SideView;