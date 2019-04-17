var diameter = 1000,
    radius = diameter / 2,
    innerRadius = radius - 120,
height = initHeight;

var color = d3.scale.category10();

var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// Add color legend
function drawColorLegend() {
    var xx = 6;
    var y1 = 20;
    var y2 = 34;
    var y3 = 48;
    var y4 = 62;
    var rr = 6;

    svg3.append("circle")
        .attr("class", "nodeLegend")
        .attr("cx", xx)
        .attr("cy", y1)
        .attr("r", rr)
        .style("fill", color(0));

    svg3.append("text")
        .attr("class", "nodeLegend")
        .attr("x", xx+10)
        .attr("y", y1+1)
        .text("Person")
        .attr("dy", ".21em")
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px")
        .style("text-anchor", "left")
        .style("fill", color(0));

    svg3.append("circle")
        .attr("class", "nodeLegend")
        .attr("cx", xx)
        .attr("cy", y2)
        .attr("r", rr)
        .style("fill", color(1));

    svg3.append("text")
        .attr("class", "nodeLegend")
        .attr("x", xx+10)
        .attr("y", y2+1)
        .text("Location")
        .attr("dy", ".21em")
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px")
        .style("text-anchor", "left")
        .style("fill", color(1));

    svg3.append("circle")
        .attr("class", "nodeLegend")
        .attr("cx", xx)
        .attr("cy", y3)
        .attr("r", rr)
        .style("fill", color(2));

    svg3.append("text")
        .attr("class", "nodeLegend")
        .attr("x", xx+10)
        .attr("y", y3+1)
        .text("Organization")
        .attr("dy", ".21em")
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px")
        .style("text-anchor", "left")
        .style("fill", color(2));

    svg3.append("circle")
        .attr("class", "nodeLegend")
        .attr("cx", xx)
        .attr("cy", y4)
        .attr("r", rr)
        .style("fill", color(3));

    svg3.append("text")
        .attr("class", "nodeLegend")
        .attr("x", xx+10)
        .attr("y", y4+1)
        .text("Miscellaneous")
        .attr("dy", ".21em")
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px")
        .style("text-anchor", "left")
        .style("fill", color(3));

    // number of input terms
    svg3.append("text")
        .attr("class", "nodeLegend")
        .attr("x", xx-6)
        .attr("y", y4+20)
        .text(numberInputTerms+" terms of "+ data1.length +" blogs" )
        .attr("dy", ".21em")
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px")
        .style("text-anchor", "left")
        .style("fill", "#000000");
}

function removeColorLegend() {
    svg3.selectAll(".nodeLegend").remove();
}

function drawTimeLegend() {
    var listX=[];
    for (var i=minYear; i<maxYear;i++){
        for (var j=0; j<12;j++){
            var xx = xStep+xScale((i-minYear)*12+j);
            var obj = {};
            obj.x = xx;
            obj.year = i;
            listX.push(obj);
        }
    }

    svg3.selectAll(".timeLegendLine").data(listX)
        .enter().append("line")
        .attr("class", "timeLegendLine")
        .style("stroke", "000")
        .style("stroke-dasharray", "1, 2")
        .style("stroke-opacity", 1)
        .style("stroke-width", 0.2)
        .attr("x1", function(d){ return d.x; })
        .attr("x2", function(d){ return d.x; })
        .attr("y1", function(d){ return 0; })
        .attr("y2", function(d){ return height; });
    svg3.selectAll(".timeLegendText").data(listX)
        .enter().append("text")
        .attr("class", "timeLegendText")
        .style("fill", "#000000")
        .style("text-anchor","start")
        .style("text-shadow", "1px 1px 0 rgba(255, 255, 255, 0.6")
        .attr("x", function(d){ return d.x; })
        .attr("y", function(d,i) {
            if (i%12==0)
                return height-7;
            else
                return height-15;
        })
        .attr("dy", ".21em")
        .attr("font-family", "sans-serif")
        .attr("font-size", "12px")
        .text(function(d,i) {
            if (i%12==0)
                return d.year;
            else
                return months[i%12];
        });
}

function updateTimeLegend() {
    // console.log("updateTimeLegend");
    var listX=[];
    for (var i=minYear; i<maxYear;i++){
        for (var j=0; j<12;j++){
            var xx = xStep+xScale((i-minYear)*12+j);
            var obj = {};
            obj.x = xx;
            obj.year = i;
            listX.push(obj);
        }
    }

    svg3.selectAll(".timeLegendLine").data(listX).transition().duration(250)
        .style("stroke-dasharray",  function(d,i){
            if (!isLensing)
                return "1, 2";
            else
                return i%12==0 ? "2, 1" : "1, 3"})
        .style("stroke-opacity", function(d,i){
            if (i%12==0)
                return 1;
            else {
                if (isLensing && lMonth-lensingMul<=i && i<=lMonth+lensingMul)
                    return 1;
                else
                    return 0;
            }
        })
        .attr("x1", function(d){return d.x; })
        .attr("x2", function(d){ return d.x; });
    svg3.selectAll(".timeLegendText").data(listX).transition().duration(250)
        .style("fill-opacity", function(d,i){
            if (i%12==0)
                return 1;
            else {
                if (isLensing && lMonth-lensingMul<=i && i<=lMonth+lensingMul)
                    return 1;
                else
                    return 0;
            }
        })
        .attr("x", function(d,i){
            return d.x; });
}


function drawTimeBox(){

    svg3.append("rect")
        .attr("class", "timeBox")
        .style("fill", "#aaa")
        .style("fill-opacity", 0.2)
        .attr("x", xStep)
        .attr("y", height-25)
        .attr("width", XGAP_*numMonth)
        .attr("height", 16)
        .on("mouseout", function(){
            isLensing = false;
            coordinate = d3.mouse(this);
            lMonth = Math.floor((coordinate[0]-xStep)/XGAP_);
            updateTransition(250);
        })
        .on("mousemove", function(){
            isLensing = true;
            coordinate = d3.mouse(this);
            lMonth = Math.floor((coordinate[0]-xStep)/XGAP_);
            updateTransition(250);
        });
}

function updateTimeBox(durationTime){
    var maxY=0;
    for (var i=0; i< nodes.length; i++) {
        if (nodes[i].y>maxY)
            maxY = nodes[i].y;
    }
    svg3.selectAll(".timeBox").transition().duration(durationTime)
        .attr("y", maxY+12);
    svg3.selectAll(".timeLegendText").transition().duration(durationTime)
        .style("fill-opacity", function(d,i){
            if (i%12==0)
                return 1;
            else {
                if (isLensing && lMonth-lensingMul<=i && i<=lMonth+lensingMul)
                    return 1;
                else
                    return 0;
            }
        })
        .attr("y", function(d,i) {
            if (i%12==0)
                return maxY+21;
            else
                return maxY+21;
        })
        .attr("x", function(d,i){
            return d.x; });
}

var buttonLensingWidth =80;
var buttonheight =15;
var roundConner = 4;
var colorHighlight = "#fc8";
var buttonColor = "#ddd";

function drawLensingButton(){
    svg3.append('rect')
        .attr("class", "lensingRect")
        .attr("x", 1)
        .attr("y", 170)
        .attr("rx", roundConner)
        .attr("ry", roundConner)
        .attr("width", buttonLensingWidth)
        .attr("height", buttonheight)
        .style("stroke", "#000")
        .style("stroke-width", 0.1)
        .style("fill", buttonColor)
        .on('mouseover', function(d2){
            svg3.selectAll(".lensingRect")
                .style("fill", colorHighlight);
        })
        .on('mouseout', function(d2){
            svg3.selectAll(".lensingRect")
                .style("fill", buttonColor);
        })
        .on('click', turnLensing);
    svg3.append('text')
        .attr("class", "lensingText")
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px")
        .attr("x", buttonLensingWidth/2)
        .attr("y", 181)
        .text("Lensing")
        .style("text-anchor", "middle")
        .style("fill", "#000")
        .on('mouseover', function(d2){
            svg3.selectAll(".lensingRect")
                .style("fill", colorHighlight);
        })
        .on('mouseout', function(d2){
            svg3.selectAll(".lensingRect")
                .style("fill", buttonColor);
        })
        .on('click', turnLensing);
}
function turnLensing() {
    isLensing = !isLensing;
    svg3.selectAll('.lensingRect')
        .style("stroke-width", function(){
            return isLensing ? 1 : 0.1;
        });
    svg3.selectAll('.lensingText')
        .style("font-weight", function() {
            return isLensing ? "bold" : "";
        });
    svg3.append('rect')
        .attr("class", "lensingRect")
        .style("fill-opacity", 0)
        .attr("x", xStep)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height)
        .on('mousemove', function(){
            coordinate = d3.mouse(this);
            lMonth = Math.floor((coordinate[0]-xStep)/XGAP_);
            updateTransition(250);
            updateTimeLegend();
        });
    updateTransition(250);
    updateTimeLegend();
}

function getColor(category) {   // param (count)
    // var minSat = 80;
    // var maxSat = 180;
    // var percent = count/maxCount[category];
    // var sat = minSat+Math.round(percent*(maxSat-minSat));

    if (category==="person"){
        return color(0) ;} // leaf node
    else if (category==="location"){
        return color(1) ;} // leaf node
    else if (category==="organization"){
        return color(2) ;} // leaf node
    else if (category==="miscellaneous"){
        return color(3) ;} // leaf node
    else
        return "#000000";

}

function colorFaded(d) {
    var minSat = 80;
    var maxSat = 230;
    var step = (maxSat-minSat)/maxDepth;
    var sat = Math.round(maxSat-d.depth*step);

    //console.log("maxDepth = "+maxDepth+"  sat="+sat+" d.depth = "+d.depth+" step="+step);
    return d._children ? "rgb("+sat+", "+sat+", "+sat+")"  // collapsed package
        : d.children ? "rgb("+sat+", "+sat+", "+sat+")" // expanded package
            : "#aaaacc"; // leaf node
}


function getBranchingAngle1(radius3, numChild) {
    if (numChild<=2){
        return Math.pow(radius3,2);
    }
    else
        return Math.pow(radius3,1);
}

function getRadius(d) {
    // console.log("scaleCircle = "+scaleCircle +" scaleRadius="+scaleRadius);
    return d._children ? scaleCircle*Math.pow(d.childCount1, scaleRadius)// collapsed package
        : d.children ? scaleCircle*Math.pow(d.childCount1, scaleRadius) // expanded package
            : scaleCircle;
    // : 1; // leaf node
}


function childCount1(level, n) {
    count = 0;
    if(n.children && n.children.length > 0) {
        count += n.children.length;
        n.children.forEach(function(d) {
            count += childCount1(level + 1, d);
        });
        n.childCount1 = count;
    }
    else{
        n.childCount1 = 0;
    }
    return count;
};

function childCount2(level, n) {
    var arr = [];
    if(n.children && n.children.length > 0) {
        n.children.forEach(function(d) {
            arr.push(d);
        });
    }
    arr.sort(function(a,b) { return parseFloat(a.childCount1) - parseFloat(b.childCount1) } );
    var arr2 = [];
    arr.forEach(function(d, i) {
        d.order1 = i;
        arr2.splice(arr2.length/2,0, d);
    });
    arr2.forEach(function(d, i) {
        d.order2 = i;
        childCount2(level + 1, d);
        d.idDFS = nodeDFSCount++;   // this set DFS id for nodes
    });

};

d3.select(self.frameElement).style("height", diameter + "px");

/*
function tick(event) {
  link_selection.attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; });
  var force_influence = 0.9;
  node_selection
    .each(function(d) {
      d.x += (d.treeX - d.x) * (force_influence); //*event.alpha;
      d.y += (d.treeY - d.y) * (force_influence); //*event.alpha;
    });
 // circles.attr("cx", function(d) { return d.x; })
  //    .attr("cy", function(d) { return d.y; });

}*/


// Toggle children on click.
function click(d) {

}

/*
function collide(alpha) {
  var quadtree = d3.geom.quadtree(tree_nodes);
  return function(d) {
    quadtree.visit(function(quad, x1, y1, x2, y2) {
    if (quad.point && (quad.point !== d) && (quad.point !== d.parent) && (quad.point.parent !== d)) {
         var rb = getRadius(d) + getRadius(quad.point),
        nx1 = d.x - rb,
        nx2 = d.x + rb,
        ny1 = d.y - rb,
        ny2 = d.y + rb;

        var x = d.x - quad.point.x,
            y = d.y - quad.point.y,
            l = Math.sqrt(x * x + y * y);
          if (l < rb) {
          l = (l - rb) / l * alpha;
          d.x -= x *= l;
          d.y -= y *= l;
          quad.point.x += x;
          quad.point.y += y;
        }
      }
      return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
    });
  };
}
*/
