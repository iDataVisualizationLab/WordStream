function computeMetric() {
    var metValue = [getTfidf().toFixed(2),
        getCompactness(allW, layerPath)[0].toFixed(2),
        getCompactness(allW, layerPath)[1].toFixed(2),
        getDisplayRate(allW, maxFreq)[0].toFixed(2),
        getDisplayRate(allW, maxFreq)[1].toFixed(2)];

    metric2.selectAll(".metricValue").remove();
    metric2.selectAll(".metricValue")
        .data(metValue)
        .enter()
        .append("text")
        .text(d => d)
        .attr("class","metricValue metricDisplay")
        .attr("x","0")
        .attr("y",(d,i) =>43+ 36*i)
        .attr("font-weight", "bold");
}

function getTfidf(){
    let tfidfed = tfidf(globalData);
    let all = [];
    d3.map(tfidfed, function (row) {
        categories.forEach(topic => {
            all = all.concat(row.words[topic]);
        });
    });
    let sumTfidfDisplayed = 0;
    let sumTfidf = 0;

    all.forEach(function (d,i) {
        sumTfidf += d.tf_idf;
        if (allW[i].placed){
            sumTfidfDisplayed += d.tf_idf;
        }
    });
    return sumTfidfDisplayed/sumTfidf;
}

function getCompactness(allW, layerPath){

    var usedArea = 0, allWArea = 0,
        totalArea, compactness,
        ratio;

    var threshold = 1;        // ignore this size of area

    allW.forEach(function (d) {
        allWArea += (d.height * d.width);
        if (d.placed){
            usedArea += (d.height * d.width);
        }
    });

    var poly = pathToPolygonViaSubdivision(layerPath,threshold);

    totalArea = polyArea(poly);         // area of stream
    compactness = usedArea/totalArea;
    ratio = allWArea/totalArea;

    return [compactness, ratio];
}
function getDisplayRate(allW, maxFreq){
    // ======== DISPLAY RATES ===========
    var displayFreq_1 = 0,        // sum of Display Freqs
        totalFreq_1 = 0;          // total of freq for top 30

    var displayNormFreq_2 = 0,    // sum of Normalized Display Freqs
        numbers_2 = 0;       // number of words displayed

    var norm = d3.scale.linear().domain([0, maxFreq]).range([0,1]);
    allW.forEach(function (d) {
        totalFreq_1 += d.frequency;
        if (d.placed){
            displayFreq_1 += d.frequency;

            numbers_2 += 1;
            displayNormFreq_2 += norm(d.frequency);

        }
    });

    var weightedRate = displayFreq_1 / totalFreq_1;
    var averageNormFreq = displayNormFreq_2 / numbers_2;

    return [weightedRate, averageNormFreq]
}
// path:      an SVG <path> element
// threshold: a 'close-enough' limit (ignore subdivisions with area less than this)
// segments:  (optional) how many segments to subdivisions to create at each level
// returns:   a new SVG <polygon> element
function pathToPolygonViaSubdivision(path,threshold,segments){
    if (!threshold) threshold = 0.0001; // Get really, really close
    if (!segments)  segments = 3;       // 2 segments creates 0-area triangles

    var points = subdivide( ptWithLength(0), ptWithLength( path.node().getTotalLength() ) );
    for (var i=points.length;i--;) points[i] = [points[i].x,points[i].y];

    var poly = document.createElementNS('http://www.w3.org/2000/svg','polygon');
    poly.setAttribute('points',points.join(' '));
    return poly;

    // Record the distance along the path with the point for later reference
    function ptWithLength(d) {
        var pt = path.node().getPointAtLength(d); pt.d = d; return pt;
    }

    // Create segments evenly spaced between two points on the path.
    // If the area of the result is less than the threshold return the endpoints.
    // Otherwise, keep the intermediary points and subdivide each consecutive pair.
    function subdivide(p1,p2){
        var pts=[p1];
        for (var i=1,step=(p2.d-p1.d)/segments;i<segments;i++){
            pts[i] = ptWithLength(p1.d + step*i);
        }
        pts.push(p2);
        if (polyArea(pts)<=threshold) return [p1,p2];
        else {
            var result = [];
            for (var j=1;j<pts.length;++j){
                var mids = subdivide(pts[j-1], pts[j]);
                mids.pop(); // We'll get the last point as the start of the next pair
                result = result.concat(mids)
            }
            result.push(p2);
            return result;
        }
    }

    // Calculate the area of an polygon represented by an array of points
    function polyArea(points){
        var p1,p2;
        for(var area=0,len=points.length,i=0;i<len;++i){
            p1 = points[i];
            p2 = points[(i-1+len)%len]; // Previous point, with wraparound
            area += (p2.x+p1.x) * (p2.y-p1.y);
        }
        return Math.abs(area/2);
    }
}


// Return the area for an SVG <polygon> or <polyline>
// Self-crossing polys reduce the effective 'area'
function polyArea(poly){
    var area=0,pts=poly.points,len=pts.numberOfItems;
    for(var i=0;i<len;++i){
        var p1 = pts.getItem(i), p2=pts.getItem((i+len-1)%len);
        area += (p2.x+p1.x) * (p2.y-p1.y);
    }
    return Math.abs(area/2);
}
