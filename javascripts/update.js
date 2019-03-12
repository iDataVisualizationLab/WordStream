function showRelationship() {
    let isRel = document.getElementById("rel").checked;
    console.log(isRel);
    if (isRel) {
        d3.selectAll(".connection").transition().duration(200).attr("opacity", 1);
    }
    else d3.selectAll(".connection").transition().duration(200).attr("opacity", 0);
}
function getTfidf() {
    let tfidfed = tfidf(allW);
    var sumTfidfDisplayed = 0;
    var sumTfidf = 0;

    tfidfed.forEach(function (d) {
        sumTfidf += d.tf_idf;
        if (d.placed){
            sumTfidfDisplayed += d.tf_idf;
        }
    });
    return sumTfidfDisplayed/sumTfidf;
}
let allWordsUpdate;
function submitInput(updateData) {
    globalWidth = parseInt(document.getElementById("widthText").innerText);
    globalHeight = parseInt(document.getElementById("heightText").innerText);
    globalMinFont = parseInt(document.getElementById("fontMin").innerText);
    globalMaxFont = parseInt(document.getElementById("fontMax").innerText);
    globalTop = parseInt(document.getElementById("topRankText").innerText);
    let isFlow = document.getElementById("flow").checked;
    let isAv = document.getElementById("av").checked;
    if (isFlow && isAv) {
        console.log("Flow and Av");
        globalFlag = "fa";
    }
    else if (isFlow && !isAv) {
        console.log("Just Flow");
        globalFlag = "f";
    }

    else if (!isFlow && isAv) {
        console.log("Just AV");
        globalFlag = "a";
    }

    else if (!isFlow && !isAv) {
        console.log("None");
        globalFlag = "n";
    }

    // top rank
    let data = JSON.parse(JSON.stringify(totalData));
    globalData = getTop(data, categories, globalTop);
    updateData(globalData);
}

function updateData() {
    let font = "Arial";
    let interpolation = "cardinal";
    let axisPadding = 10;
    let margins = {left: 20, top: 20, right: 10, bottom: 30};
    let ws = d3.layout.wordStream()
        .size([globalWidth, globalHeight])
        .interpolate(interpolation)
        .fontScale(d3.scale.linear())
        .minFontSize(globalMinFont)
        .maxFontSize(globalMaxFont)
        .flag(globalFlag)
        .data(globalData)
        .font(font);
    const newboxes = ws.boxes();
    let minSud = ws.minSud();
    let maxSud = ws.maxSud();
    const legendFontSize = 20;
    let legendHeight = newboxes.topics.length * legendFontSize;

    mainGroup = d3.select("#mainsvg");

    d3.select("#mainsvg")
        .transition()
        .duration(300)
        .attr({
            width: globalWidth + margins.left + margins.top,
            height: globalHeight + +margins.top + margins.bottom + axisPadding + legendHeight
        });

    // d3.select("#mainsvg").selectAll("*").remove();
    var dates = [];
    newboxes.data.forEach(row => {
        dates.push(row.date);
    });

    var xAxisScale = d3.scale.ordinal().domain(dates).rangeBands([0, globalWidth]);
    var xAxis = d3.svg.axis().orient('bottom').scale(xAxisScale);

    axisGroup
        .attr('transform', 'translate(' + (margins.left) + ',' + (globalHeight + margins.top + axisPadding + legendHeight) + ')');

    var axisNodes = axisGroup.call(xAxis);
    styleAxis(axisNodes);

    //Display the vertical gridline
    var xGridlineScale = d3.scale.ordinal().domain(d3.range(0, dates.length + 1)).rangeBands([0, globalWidth + globalWidth / newboxes.data.length]);
    var xGridlinesAxis = d3.svg.axis().orient('bottom').scale(xGridlineScale);

    xGridlinesGroup.attr("id", "gridLines")
        .attr('transform', 'translate(' +
            (margins.left - globalWidth / newboxes.data.length / 2)
            + ',' + (globalHeight + margins.top + axisPadding + legendHeight + margins.bottom) + ')');

    var gridlineNodes = xGridlinesGroup.call(xGridlinesAxis.tickSize(-globalHeight - axisPadding - legendHeight - margins.bottom, 0, 0).tickFormat(''));
    styleGridlineNodes(gridlineNodes);

    // build legend
    legendGroup.attr('transform', 'translate(' + margins.left + ',' + (globalHeight + margins.top) + ')');

    let area = d3.svg.area()
        .interpolate(interpolation)
        .x(function (d) {
            return (d.x);
        })
        .y0(function (d) {
            return d.y0;
        })
        .y1(function (d) {
            return (d.y0 + d.y);
        });

    const lineCardinal = d3.svg.line()
        .x(function (d) {
            return d.x;
        })
        .y(function (d) {
            return d.y;
        })
        .interpolate("cardinal");

    let boundary = [];
    for (let i = 0; i < newboxes.layers[0].length; i++) {
        let tempPoint = Object.assign({}, newboxes.layers[0][i]);
        tempPoint.y = tempPoint.y0;
        boundary.push(tempPoint);
    }

    for (let i = newboxes.layers[newboxes.layers.length - 1].length - 1; i >= 0; i--) {
        let tempPoint2 = Object.assign({}, newboxes.layers[newboxes.layers.length - 1][i]);
        tempPoint2.y = tempPoint2.y + tempPoint2.y0;
        boundary.push(tempPoint2);
    }       // Add next (8) elements

    let lenb = boundary.length;

    // Get the string for path

    let combined = lineCardinal(boundary.slice(0, lenb / 2))
        + "L"
        + lineCardinal(boundary.slice(lenb / 2, lenb))
            .substring(1, lineCardinal(boundary.slice(lenb / 2, lenb)).length)
        + "Z";

    // draw curves
    let topics = newboxes.topics;
    mainGroup.selectAll(".curve")
        .data(newboxes.layers)
        .attr("d", area)
        .style('fill', function (d, i) {
            return color(i);
        })
        .attr({
            'fill-opacity': 0,
            stroke: 'black',
            'stroke-width': 0,
            topic: function (d, i) {
                return topics[i];
            }
        });

    layerPath = mainGroup.selectAll("path").append("path")
        .attr("d", combined)
        .attr({
            'fill-opacity': 0,
            'stroke-opacity': 0,
        });

    // ARRAY OF ALL WORDS
    allWordsUpdate = [];
    d3.map(newboxes.data, function (row) {
        newboxes.topics.forEach(topic => {
            allWordsUpdate = allWordsUpdate.concat(row.words[topic]);
        });
    });

    allW = JSON.parse(JSON.stringify(allWordsUpdate));
    if (fileName.indexOf("Huffington") >= 0) {
        d3.json("data/linksHuff2012.json", function (error, rawLinks) {
            const threshold = 5;
            const links = rawLinks.filter(d => d.weight > threshold);

            links.forEach(d => {
                d.sourceID = d.sourceID.split(".").join("_").split(" ").join("_");
                d.targetID = d.targetID.split(".").join("_").split(" ").join("_");
            });
            let visibleLinks = [];

            // select only links with: word place = true and have same id
            links.forEach(d => {
                let s = allWordsUpdate.find(w => (w.id === d.sourceID) && (w.placed === true));
                let t = allWordsUpdate.find(w => (w.id === d.targetID) && (w.placed === true));
                if ((s !== undefined) && (t !== undefined)) {
                    d.sourceX = s.x;
                    d.sourceY = s.y;
                    d.targetX = t.x;
                    d.targetY = t.y;
                    visibleLinks.push(d);
                }
            });

            const lineScale = d3.scale.linear()
                .domain(d3.extent(visibleLinks, d => d.weight))
                .range([0.5, 3]);

            opacScale = d3.scale.linear()
                .domain(d3.extent(visibleLinks, d => d.weight))
                .range([0.5, 1]);

            let conn = mainGroup.selectAll(".connection").data(visibleLinks);

            conn.exit().remove();
            conn.attr("class", "connection")
                .attr("opacity", 0)
                .attr({
                    "x1": d => d.sourceX,
                    "y1": d => d.sourceY,
                    "x2": d => d.targetX,
                    "y2": d => d.targetY,
                    "stroke": "#444444",
                    "stroke-opacity": d => opacScale(d.weight),
                    "stroke-width": d => lineScale(d.weight)
                });

            conn
                .enter()
                .append("line")
                .attr("class", "connection")
                .attr("opacity", 0)
                .attr({
                    "x1": d => d.sourceX,
                    "y1": d => d.sourceY,
                    "x2": d => d.targetX,
                    "y2": d => d.targetY,
                    "stroke": "#444444",
                    "stroke-opacity": d => opacScale(d.weight),
                    "stroke-width": d => lineScale(d.weight)
                });
            drawWordsUpdate();
        });
    }
    else drawWordsUpdate();

    function drawWordsUpdate() {
        let placed = true;
        let prevColor;
        // mainGroup.selectAll('.word').remove();
        var texts = mainGroup.select("#main").selectAll('.word').data(allWordsUpdate, d => d.id);

        texts.exit()
            .remove();

        texts.transition()
            .duration(1000)
            .attr({
                transform: function (d) {
                    return 'translate(' + d.x + ', ' + d.y + ')rotate(' + d.rotate + ')';
                }
            })
            .select("text")
            .style('font-size', d => d.fontSize)
            .attr({
                visibility: function (d) {
                    return d.placed ? (placed ? "visible" : "hidden") : (placed ? "hidden" : "visible");
                }
            });

        let t = texts.enter()
            .append("g")
            .attr({
                transform: function (d) {
                    return 'translate(' + d.x + ', ' + d.y + ')rotate(' + d.rotate + ')';
                }
            })
            .attr("class", "word");

            t.transition()
            .duration(1000)

            t
            .append("text")
            .text(function (d) {
                return d.text;
            })
                .style('cursor', 'pointer')
            .style('font-size', d => d.fontSize)
            .attr({
                "class": "textData",
                fill: function (d) {
                    return color(categories.indexOf(d.topic));
                },
                'fill-opacity': function (d) {
                    return opacity(d.sudden)
                },
                'text-anchor': 'middle',
                'alignment-baseline': 'middle',
                topic: function (d) {
                    return d.topic;
                },
                visibility: function (d) {
                    return d.placed ? (placed ? "visible" : "hidden") : (placed ? "hidden" : "visible");
                }
            })
                .on('mouseenter', function(){
                    let thisText = d3.select(this);
                    thisText.style('cursor', 'pointer');
                    prevColor = thisText.attr('fill');
                    thisText.attr({
                        stroke: prevColor,
                        'stroke-width': 1
                    });})

                .on('mouseout', function(){
                let thisText = d3.select(this);
                thisText.style('cursor', 'default');
                thisText.attr({
                        stroke: 'none',
                        'stroke-width': '0'
                    });
                });


    }
}

