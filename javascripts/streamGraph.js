 // Stream graph******************************************
   

function drawStreamTerm(svg, data_, ymin, ymax) {
    var x = d3.time.scale()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([ymax, ymin]);

    
    var stack = d3.layout.stack()
        .offset("silhouette")
        .order("inside-out")
        .values(function(d) { return d.values; })
        .x(function(d) { return d.date; })
        .y(function(d) { return d.value; });

    var nest = d3.nest()
        .key(function(d) { return d.key; });

   var layers = stack(nest.entries(data_));
      x.domain(d3.extent(data_, function(d) { return d.monthId; }));
  //    y.domain([0, d3.max(data_, function(d) { return d.yNode+d.y/2; })]);
   y.domain([0, d3.max(data_, function(d) { return d.y0 + d.y; })]);

    var area = d3.svg.area()
        .interpolate("cardinal")
        .x(function(d) { return x(d.monthId); })
        .y0(function(d) { return y(d.yNode-d.y/2); })
    //    .y1(function(d) { return y(d.yNode+d.y/2); });
          .y0(function(d) { return y(d.y0); })
          .y1(function(d) { return y(d.y0+d.y); });

      svg.selectAll(".layer2")
          .data(layers)
        .enter().append("path")
          .attr("class", "layer2")
          .attr("d", function(d) { return area(d.values); })
          .style("fill-opacity",1)
          .style("fill", function(d, i) { 
            return getColor(d.values[0].category);
        });    
}          

function drawStreamSource(svg, data_, colorScale, ymin, ymax) {
    if (colorScale == "blue") {
      colorrange = ["#045A8D", "#2B8CBE", "#74A9CF", "#A6BDDB", "#D0D1E6", "#F1EEF6"];
    }
    else if (colorScale == "pink") {
      colorrange = ["#980043", "#DD1C77", "#DF65B0", "#C994C7", "#D4B9DA", "#F1EEF6"];
    }
    else if (colorScale == "orange") {
      colorrange = ["#B30000", "#E34A33", "#FC8D59", "#FDBB84", "#FDD49E", "#FEF0D9"];
    }
    var z = d3.scale.ordinal()
        .range(colorrange);

    var x = d3.time.scale()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([ymax, ymin]);

    
    var stack = d3.layout.stack()
        .offset("silhouette")
        .order("inside-out")
        .values(function(d) { return d.values; })
        .x(function(d) { return d.date; })
        .y(function(d) { return d.value; });

    var nest = d3.nest()
        .key(function(d) { return d.key; });

    var area = d3.svg.area()
        .interpolate("cardinal")
        .x(function(d) { return x(d.monthId); })
        .y0(function(d) { return y(d.y0); })
        .y1(function(d) { return y(d.y0+d.y); });

      var layers = stack(nest.entries(data_));
     // debugger;
      x.domain(d3.extent(data_, function(d) { return d.monthId; }));
      y.domain([0, d3.max(data_, function(d) { return d.y0 + d.y; })]);

      svg.selectAll(".layer")
          .data(layers)
        .enter().append("path")
          .attr("class", "layer")
          .attr("d", function(d) { return area(d.values); })
          .style("fill-opacity",1)
          .style("fill", function(d, i) { return z(i); });    
}          