var metricName = [["Importance value (tf-idf ratio) "],["Compactness "],["All Words Area/Stream Area"],
    ["Weighted Display Rate"],["Average Normalized Frequency "]];

var metric = d3.select("body").append("svg")
    .attr("width",360)
    .attr("height", 250)
    .attr("class","metricSVG")
    .attr("id","metricSVG");

metric.append("text").attr("y", 15).attr("font-weight",600).text("Metrics");

d3.select("body")
// .append("div")
    .append("table")
    .attr("class","metTable")
    .style("border-collapse", "collapse")
    .style("border", "2px black solid")

    .selectAll("tr")
    .data(metricName)
    .enter().append("tr")

    .selectAll("td")
    .data(function(d){return d;})
    .enter().append("td")
    .style("border", "1px black solid")
    .style("padding", "10px")
    .on("mouseover", function(){d3.select(this).style("background-color", "aliceblue")})
    .on("mouseout", function(){d3.select(this).style("background-color", "white")})
    .text(function(d){return d;})
    .style("font-size", "13px");

var metric2 = d3.select("body").append("svg")
    .attr("width",100)
    .attr("height", 300)
    .attr("class","metricSVG2")
    .attr("id","metricSVG2");
