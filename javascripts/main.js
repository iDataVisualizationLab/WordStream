let svg = d3.select("body").append('svg').attr({
    width: globalWidth,
    height: globalHeight,
    id: "mainsvg"
});
// let fileList = ["WikiNews","Huffington","CrooksAndLiars","EmptyWheel","Esquire","FactCheck"
//                 ,"VIS_papers","IMDB","PopCha","Cards_PC","Cards_Fries"]

let fileList = ["WikiNews", "Huffington", "CrooksAndLiars", "EmptyWheel", "Esquire", "FactCheck", "VIS_papers", "IMDB", "PopCha", "Cards_PC", "Cards_Fries", "QuantumComputing"]

let initialDataset = "EmptyWheel";
let categories = ["person", "location", "organization", "miscellaneous"];

var fileName;


addDatasetsOptions();

function addDatasetsOptions() {
    let select = document.getElementById("datasetsSelect");
    for (let i = 0; i < fileList.length; i++) {
        let opt = fileList[i];
        let el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        el["data-image"] = "images2/datasetThumnails/" + fileList[i] + ".png";
        select.appendChild(el);
    }
    document.getElementById('datasetsSelect').value = initialDataset;  //************************************************
    fileName = document.getElementById("datasetsSelect").value;
    loadData();
}

var spinner;

function loadData() {
    // START: loader spinner settings ****************************
    let opts = {
        lines: 25, // The number of lines to draw
        length: 15, // The length of each line
        width: 5, // The line thickness
        radius: 25, // The radius of the inner circle
        color: '#000', // #rgb or #rrggbb or array of colors
        speed: 2, // Rounds per second
        trail: 50, // Afterglow percentage
        className: 'spinner', // The CSS class to assign to the spinner
    };
    let target = document.getElementById('loadingSpinner');
    spinner = new Spinner(opts).spin(target);
    // END: loader spinner settings ****************************
    fileName = "data/" + fileName + ".tsv"; // Add data folder path
    if (fileName.indexOf("Cards_Fries") >= 0) {
        categories = ["increases_activity", "decreases_activity"];
        loadAuthorData(draw, initTop);
    }
    else if (fileName.indexOf("Cards_PC") >= 0) {
        categories = ["adds_modification", "removes_modification", "increases", "decreases", "binds", "translocation"];
        loadAuthorData(draw, initTop);
    }
    else if (fileName.indexOf("PopCha") >= 0) {
        categories = ["Comedy", "Drama", "Action", "Fantasy", "Horror"];
        loadAuthorData(draw, initTop);
    }
    else if (fileName.indexOf("IMDB") >= 0) {
        categories = ["Comedy", "Drama", "Action", "Family"];
        loadAuthorData(draw, initTop);
    }
    else if (fileName.indexOf("VIS") >= 0) {
        categories = categories = ["Vis", "VAST", "InfoVis", "SciVis"];
        loadAuthorData(draw, initTop);
    }
    else if (fileName.indexOf("QuantumComputing") >= 0) {
        fileName = "data/" + fileName + ".tsv"; // Add data folder path
        categories = ["Unknown citation", "Have citation", "Affiliations", "Author"];
        initTop = 15;
        loadQuantumComputing(draw, initTop);
    }
    else {
        categories = ["person", "location", "organization", "miscellaneous"];
        loadBlogPostData(draw, initTop);
    }
}

function loadNewData(event) {
    svg.selectAll("*").remove();
    fileName = this.options[this.selectedIndex].text;
    loadData();
}

function draw(data) {
    //Layout data
    let width = globalWidth, height = globalHeight;
    let font = "Arial";
    let interpolation = "cardinal";
    let axisPadding = 10;
    let margins = {left: 20, top: 20, right: 10, bottom: 30};
    let ws = d3.layout.wordStream()
        .size([width, height])
        .interpolate(interpolation)
        .fontScale(d3.scale.linear())
        .minFontSize(initMinFont)
        .maxFontSize(initMaxFont)
        .data(data)
        .font(font);
    let boxes = ws.boxes();
    let minSud = ws.minSud();
    let maxSud = ws.maxSud();
    maxFreq = ws.maxFreq();

    //Display data
    let legendFontSize = 12;
    let legendHeight = boxes.topics.length * legendFontSize;
    //set svg data.
    svg.attr({
        width: width + margins.left + margins.top,
        height: height + margins.top + margins.bottom + axisPadding + legendHeight
    });

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

    //Display time axes
    let dates = [];
    boxes.data.forEach(row => {
        dates.push(row.date);
    });

    let xAxisScale = d3.scale.ordinal().domain(dates).rangeBands([0, width]);
    let xAxis = d3.svg.axis().orient('bottom').scale(xAxisScale);
    axisGroup = svg.append('g').attr('transform', 'translate(' + (margins.left) + ',' + (height + margins.top + axisPadding + legendHeight) + ')');
    let axisNodes = axisGroup.call(xAxis);
    styleAxis(axisNodes);
    //Display the vertical gridline
    let xGridlineScale = d3.scale.ordinal().domain(d3.range(0, dates.length + 1)).rangeBands([0, width + width / boxes.data.length]);
    let xGridlinesAxis = d3.svg.axis().orient('bottom').scale(xGridlineScale);
    xGridlinesGroup = svg.append('g').attr('transform', 'translate(' + (margins.left - width / boxes.data.length / 2) + ',' + (height + margins.top + axisPadding + legendHeight + margins.bottom) + ')');
    let gridlineNodes = xGridlinesGroup.call(xGridlinesAxis.tickSize(-height - axisPadding - legendHeight - margins.bottom, 0, 0).tickFormat(''));
    styleGridlineNodes(gridlineNodes);
    //Main group
    mainGroup = svg.append('g').attr("id", "main").attr('transform', 'translate(' + margins.left + ',' + margins.top + ')');
    let wordStreamG = mainGroup.append('g').attr("id", "wordStreamG");

// =============== Get BOUNDARY and LAYERPATH ===============
    const lineCardinal = d3.svg.line()
        .x(function (d) {
            return d.x;
        })
        .y(function (d) {
            return d.y;
        })
        .interpolate("cardinal");

    let boundary = [];
    for (let i = 0; i < boxes.layers[0].length; i++) {
        let tempPoint = Object.assign({}, boxes.layers[0][i]);
        tempPoint.y = tempPoint.y0;
        boundary.push(tempPoint);
    }

    for (let i = boxes.layers[boxes.layers.length - 1].length - 1; i >= 0; i--) {
        let tempPoint2 = Object.assign({}, boxes.layers[boxes.layers.length - 1][i]);
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
    let topics = boxes.topics;
    mainGroup.selectAll('path')
        .data(boxes.layers)
        .enter()
        .append('path')
        .attr('d', area)
        .style('fill', function (d, i) {
            return color(i);
        })
        .attr({
            "class": "curve",
            'fill-opacity': 0,
            stroke: 'black',
            'stroke-width': 0,
            topic: function (d, i) {
                return topics[i];
            }
        });

    // ============= Get LAYER PATH ==============

    layerPath = mainGroup.selectAll("path").append("path")
        .attr("d", combined)
        .attr({
            'fill-opacity': 0,
            'stroke-opacity': 0,
        });

    let allWords = [];
    d3.map(boxes.data, function (row) {
        boxes.topics.forEach(topic => {
            allWords = allWords.concat(row.words[topic]);
        });
    });
    allW = JSON.parse(JSON.stringify(allWords));
    let c20 = d3.scale.category20b();
    //Color based on the topic
    let topicColorMap = d3.scale.ordinal().domain(topics).range(c20.range());
    //Color based on term
    let terms = [];
    for (i = 0; i < allWords.length; i++) {
        terms.concat(allWords[i].text);
    }
    let uniqueTerms = d3.set(terms).values();
    let termColorMap = d3.scale.ordinal()
        .domain(uniqueTerms)
        .range(c20.range());
    opacity = d3.scale.log()
        .domain([minSud, maxSud])
        .range([0.4, 1]);

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
                let s = allWords.find(w => (w.id === d.sourceID) && (w.placed === true));
                let t = allWords.find(w => (w.id === d.targetID) && (w.placed === true));
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

            mainGroup.selectAll(".connection")
                .data(visibleLinks)
                .enter()
                .append("line")
                .attr("class", "connection")
                .attr("opacity", 1)
                .attr({
                    "x1": d => d.sourceX,
                    "y1": d => d.sourceY,
                    "x2": d => d.targetX,
                    "y2": d => d.targetY,
                    "stroke": "#444444",
                    "stroke-opacity": d => opacScale(d.weight),
                    "stroke-width": d => lineScale(d.weight)
                });

            drawWords();
        });
    }
    else drawWords();

    function drawWords() {

        let placed = true;
        mainGroup.selectAll('.word').data(allWords).enter().append('g')
            .attr({
                transform: function (d) {
                    return 'translate(' + d.x + ', ' + d.y + ')rotate(' + d.rotate + ')';
                }
            })
            .attr("class", "word")
            .append('text')
            .text(function (d) {
                return d.text;
            })
            .attr({
                "class": "textData",
                'font-family': font,
                'font-size': function (d) {
                    return d.fontSize;
                },
                fill: function (d, i) {
                    return color(categories.indexOf(d.topic));
                },
                "opacity": function (d) {
                    return opacity(d.sudden);
                },
                'text-anchor': 'middle',
                'alignment-baseline': 'middle',
                topic: function (d) {
                    return d.topic;
                },
                visibility: function (d) {
                    return d.placed ? (placed ? "visible" : "hidden") : (placed ? "hidden" : "visible");
                }
            });

        mainGroup.selectAll(".connection").on("mouseover", function () {
            var thisLink = d3.select(this);
            thisLink.style('cursor', 'crosshair');
            // in order to select by byid, the id must not have space
            // var sourceText = mainGroup.select("#" + thisLink.data()[0].sourceID);
            // var prevSourceColor = sourceText.attr("fill");
            // var targetText = mainGroup.select("#" + thisLink.data()[0].targetID);
            // var prevTargetColor = targetText.attr("fill");
            //
            // thisLink.attr("stroke-width", 4);
            //
            // sourceText.attr({
            //     stroke: prevSourceColor,
            //     fill: prevSourceColor,
            //     'stroke-width': 1.5
            // });
            //
            // targetText.attr({
            //     stroke: prevTargetColor,
            //     fill: prevTargetColor,
            //     'stroke-width': 1.5
            // });
        });

        // mainGroup.selectAll(".connection").on("mouseout", function () {
        //     var thisLink = d3.select(this);
        //     thisLink.style('cursor', 'crosshair');
        //
        //     var sourceText = mainGroup.select("#" + thisLink.data()[0].sourceID);
        //     var targetText = mainGroup.select("#" + thisLink.data()[0].targetID);
        //
        //     thisLink.attr("stroke-width", d => opacScale(d.weight));
        //
        //     sourceText.attr({
        //         stroke: 'none',
        //         'stroke-width': 0
        //     });
        //
        //     targetText.attr({
        //         stroke: 'none',
        //         'stroke-width':0
        //     });
        // });

        //Try
        let prevColor;
        //Highlight
        mainGroup.selectAll('text').on('mouseenter', function () {
            let thisText = d3.select(this);
            thisText.style('cursor', 'pointer');
            prevColor = thisText.attr('fill');
            let text = thisText.text();
            let topic = thisText.attr('topic');
            let allTexts = mainGroup.selectAll('text').filter(t => {
                return t && t.text === text && t.topic === topic;
            });
            allTexts.attr({
                stroke: prevColor,
                'stroke-width': 1
            });
        });
        mainGroup.selectAll('text').on('mouseout', function () {
            let thisText = d3.select(this);
            thisText.style('cursor', 'default');
            let text = thisText.text();
            let topic = thisText.attr('topic');
            let allTexts = mainGroup.selectAll('text').filter(t => {
                return t && !t.cloned && t.text === text && t.topic === topic;
            });
            allTexts.attr({
                stroke: 'none',
                'stroke-width': '0'
            });
        });
        //Click
        mainGroup.selectAll('text').on('click', function () {
            let thisText = d3.select(this);
            let text = thisText.text();
            let topic = thisText.attr('topic');
            let allTexts = mainGroup.selectAll('text').filter(t => {
                return t && t.text === text && t.topic === topic;
            });
            //Select the data for the stream layers
            let streamLayer = d3.select("path[topic='" + topic + "']")[0][0].__data__;
            //Push all points
            let points = Array();
            //Initialize all points
            streamLayer.forEach(elm => {
                points.push({
                    x: elm.x,
                    y0: elm.y0 + elm.y,
                    y: 0//zero as default
                });
            });
            allTexts[0].forEach(t => {
                let data = t.__data__;
                let fontSize = data.fontSize;
                //The point
                let thePoint = points[data.timeStep + 1];
                ;//+1 since we added 1 to the first point and 1 to the last point.
                thePoint.y = -data.streamHeight;
                //Set it to visible.
                //Clone the nodes.
                let clonedNode = t.cloneNode(true);
                d3.select(clonedNode).attr({
                    visibility: "visible",
                    stroke: 'none',
                    'stroke-size': 0,
                });
                let clonedParentNode = t.parentNode.cloneNode(false);
                clonedParentNode.appendChild(clonedNode);

                t.parentNode.parentNode.appendChild(clonedParentNode);
                d3.select(clonedParentNode).attr({
                    cloned: true,
                    topic: topic
                }).transition().duration(300).attr({
                    transform: function (d, i) {
                        return 'translate(' + thePoint.x + ',' + (thePoint.y0 + thePoint.y - fontSize / 2) + ')';
                    },
                });
            });
            //Add the first and the last points
            points[0].y = points[1].y;//First point
            points[points.length - 1].y = points[points.length - 2].y;//Last point
            //Append stream
            wordStreamG.append('path')
                .datum(points)
                .attr('d', area)
                .style('fill', prevColor)
                .attr({
                    'fill-opacity': prevColor,
                    stroke: 'black',
                    'stroke-width': 0.3,
                    topic: topic,
                    wordStream: true
                });
            //Hide all other texts
            let allOtherTexts = mainGroup.selectAll('text').filter(t => {
                return t && !t.cloned && t.topic === topic;
            });
            allOtherTexts.attr('visibility', 'hidden');
        });
        topics.forEach(topic => {
            d3.select("path[topic='" + topic + "']").on('click', function () {
                mainGroup.selectAll('text').filter(t => {
                    return t && !t.cloned && t.placed && t.topic === topic;
                }).attr({
                    visibility: 'visible'
                });
                //Remove the cloned element
                document.querySelectorAll("g[cloned='true'][topic='" + topic + "']").forEach(node => {
                    node.parentNode.removeChild(node);
                });
                //Remove the added path for it
                document.querySelectorAll("path[wordStream='true'][topic='" + topic + "']").forEach(node => {
                    node.parentNode.removeChild(node);
                });
            });

        });

        //Build the legends
        legendGroup = svg.append('g').attr('transform', 'translate(' + margins.left + ',' + (height + margins.top) + ')');
        let legendNodes = legendGroup.selectAll('g').data(boxes.topics).enter().append('g')
            .attr('transform', function (d, i) {
                return 'translate(' + 10 + ',' + (i * legendFontSize) + ')';
            });
        legendNodes.append('circle').attr({
            r: 5,
            fill: function (d, i) {
                return color(i);
            },
            'fill-opacity': 1,
            stroke: 'black',
            'stroke-width': .5,
        });
        legendNodes.append('text').text(function (d) {
            return d;
        }).attr({
            'font-size': legendFontSize,
            'alignment-baseline': 'middle',
            dx: 8
        });
        spinner.stop();
    };
}

function styleAxis(axisNodes) {
    axisNodes.selectAll('.domain').attr({
        fill: 'none'
    });
    axisNodes.selectAll('.tick line').attr({
        fill: 'none',
    });
    axisNodes.selectAll('.tick text').attr({
        'font-family': 'serif',
        'font-size': 10
    });
}

function styleGridlineNodes(gridlineNodes) {
    gridlineNodes.selectAll('.domain').attr({
        fill: 'none',
        stroke: 'none'
    });
    gridlineNodes.selectAll('.tick line').attr({
        fill: 'none',
        'stroke-width': 0.7,
        stroke: 'lightgray'
    });
}
