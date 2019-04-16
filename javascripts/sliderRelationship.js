
//===============================================
var brush;
var slider;
var handle;
var xScaleSlider;
var xSlider = 3;
var ySlider = 125;
var valueSlider = 1;
var valueMax = 30;
function setupSliderScale(svg) {
    xScaleSlider = d3.scale.linear()
        .domain([0, valueMax])
        .range([xSlider, 120]);

    brush = d3.svg.brush()
        .x(xScaleSlider)
        .extent([valueSlider, valueSlider])
        .on("brush", brushed)
        .on("brushend", brushend);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + ySlider + ")")
        .attr("font-family", "sans-serif")
        .attr("font-size", "10px")

        .call(d3.svg.axis()
            .scale(xScaleSlider)
            .ticks(5)
            .orient("bottom")
            .tickFormat(function(d) { return d; })
            .tickSize(0)
            .tickPadding(5))
        .select(".domain")
        .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "halo");

    svg.append("text")
        .attr("class", "sliderText")
        .attr("x", xSlider)
        .attr("y", ySlider-12)
        .attr("dy", ".21em")
        .attr("font-family", "sans-serif")
        .attr("font-size", "10px")
        .text("Mentioned together")
        .style("text-anchor","start");

    slider = svg.append("g")
        .attr("class", "slider")
        .call(brush);

    slider.selectAll(".extent,.resize")
        .remove();

    slider.select(".background")
        .attr("y",ySlider-5)
        .attr("height", 10);

    handle = slider.append("circle")
        .attr("class", "handle")
        .attr("transform", "translate(0," + ySlider + ")")
        .attr("r", 5)
        .attr("cx", xScaleSlider(valueSlider));
}

function brushed() {
    //console.log("Slider brushed ************** valueSlider="+valueSlider);
    valueSlider = brush.extent()[0];
    if (d3.event.sourceEvent) { // not a programmatic event
        valueSlider = Math.max(xScaleSlider.invert(d3.mouse(this)[0]),0.5);
        valueSlider = Math.min(valueSlider, valueMax);
        brush.extent([valueSlider, valueSlider]);
    }
    handle.attr("cx", xScaleSlider(valueSlider));

}
function brushend() {
    // console.log("Slider brushed ************** valueSlider="+valueSlider);
    recompute();
}

