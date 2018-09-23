// Algorithm due to Jonathan Feinberg, http://static.mrfeinberg.com/bv_ch03.pdf
// Also referenced to the implementation: by Jason Davies, https://www.jasondavies.com/wordcloud/
d3.layout.wordStream = function(){
    let data = [],
        size = [1200, 500],
        maxFontSize = 24,
        minFontSize = 4,
        rotateCorner = 15,
        font = "Arial",
        fontScale = d3.scale.linear(),
        frequencyScale = d3.scale.linear(),
        spiral = achemedeanSpiral,
        canvas = cloudCanvas,
        interpolation = "linear";
    let wordStream = {};

    let cloudRadians = Math.PI / 180,
        cw = 1 << 11,
        ch = 1 << 11;

    wordStream.boxes = function(){
        let boxWidth = size[0]/data.length;
        buildFontScale(data);
        buildFrequencyScale(data);
        let boxes = buildBoxes(data);
        //Get the sprite for each word
        getImageData(boxes);
        //Set for each stream
        for(let tc = 0; tc< boxes.topics.length; tc++){
            let topic = boxes.topics[tc];
            let board = buildBoard(boxes, topic);
            let innerBoxes = boxes.innerBoxes[topic];
            let layer = boxes.layers[tc];
            //Place
            for(let bc = 0; bc < boxes.data.length; bc++){
                let words = boxes.data[bc].words[topic];
                let n = words.length;
                let innerBox = innerBoxes[bc];
                board.boxWidth = innerBox.width;
                board.boxHeight = innerBox.height;
                board.boxX = innerBox.x;
                board.boxY = innerBox.y;
                for(let i = 0; i < n; i++){
                    place(words[i], board);
                }
            }
        }
        return boxes;
    };

    //#region helper functions
    function buildFontScale(data){

        let topics = d3.keys(data[0].words);
        //#region scale for the font size.
        let maxFrequency = 0;
        let minFrequency = Number.MAX_SAFE_INTEGER;
        d3.map(data, function(box){
            d3.map(topics, function(topic){
                let max = d3.max(box.words[topic], function(d){
                    return d.frequency;
                });
                let min = d3.min(box.words[topic], function(d){
                    return d.frequency;
                });
                if(maxFrequency < max) maxFrequency = max;
                if(minFrequency > min) minFrequency = min;
            })
        });
        fontScale.domain([minFrequency, maxFrequency]).range([minFontSize, maxFontSize]);
    }
    function buildFrequencyScale(data){
        let totalFrequencies  = calculateTotalFrequenciesABox(data);
        let max = 0;
        d3.map(totalFrequencies, function(d){
            let keys = d3.keys(totalFrequencies[0]);
            let total = 0;
            keys.forEach(key=>{
                total += d[key];
            });
            if(total > max) max = total;
        });
        frequencyScale.domain([0, max]).range([0, size[1]]);
    }
    //Convert from data to box
    function buildBoxes(data){
        //Build settings based on frequencies
        let totalFrequencies  = calculateTotalFrequenciesABox(data);
        let topics = d3.keys(data[0].words);
        //#region creating boxes
        let numberOfBoxes = data.length;
        let boxes = {};
        let boxWidth =  ~~(size[0]/numberOfBoxes);
        //Create the stacked data
        let allPoints = [];
        topics.forEach(topic=>{
            let dataPerTopic = [];
            //Push the first point
            dataPerTopic.push({x: 0, y:frequencyScale(totalFrequencies[0][topic])});
            totalFrequencies.forEach((frq, i) =>{
                dataPerTopic.push({x: (i*boxWidth) + (boxWidth>>1), y: frequencyScale(frq[topic])});
            });
            //Push the last point
            dataPerTopic.push({x: size[0], y:frequencyScale(totalFrequencies[totalFrequencies.length-1][topic])});//TODO:
            allPoints.push(dataPerTopic);
        });
        var layers = d3.layout.stack().offset('silhouette')(allPoints);

        var innerBoxes = {};
        topics.forEach((topic, i)=>{
            innerBoxes[topic] = [];
            for(let j = 1; j< layers[i].length-1; j++){
                innerBoxes[topic].push({
                    x: layers[i][j].x - (boxWidth>>1),
                    y: layers[i][j].y0,
                    width: boxWidth,
                    height: layers[i][j].y
                });
            }
        });
        boxes = {
            topics: topics,
            data: data,
            layers: layers,
            innerBoxes: innerBoxes
        };
        return boxes;
    }
    function place(word, board){
        let bw = board.width,
            bh = board.height,
            maxDelta = ~~Math.sqrt((board.boxWidth*board.boxWidth) + (board.boxHeight*board.boxHeight)),
            startX =  ~~(board.boxX + (board.boxWidth*( Math.random() + .5) >> 1)),
            startY =  ~~(board.boxY + (board.boxHeight*( Math.random() + .5) >> 1)),
            s = spiral([board.boxWidth, board.boxHeight]),
            dt = Math.random() < .5 ? 1 : -1,
            t = -dt,
            dxdy, dx, dy;
        word.x = startX;
        word.y = startY;
        word.placed = false;
        while (dxdy = s(t += dt)) {
            dx = ~~dxdy[0];
            dy = ~~dxdy[1];

            if (Math.max(Math.abs(dx), Math.abs(dy)) >= (maxDelta))
                break;

            word.x = startX + dx;
            word.y = startY + dy;

            if (word.x + word.x0 < 0 || word.y + word.y0 < 0 || word.x + word.x1 > size[0] || word.y + word.y1 > size[1])
                continue;
            if(!cloudCollide(word, board)){
                placeWordToBoard(word, board);
                word.placed = true;
                break;
            }
        }
    }
    //board has current bound + which is placed at the center
    //x, y of the word is placed at the center
    function cloudCollide(word, board) {
        let wh = word.height,
            ww = word.width,
            bw = board.width;
        //For each pixel in word
        for(let j = 0; j < wh; j++){
            for(let i = 0; i < ww; i++){
                let wsi = j*ww + i; //word sprite index;
                let wordPixel = word.sprite[wsi];

                let bsi = (j+word.y+word.y0)*bw + i+(word.x + word.x0);//board sprite index
                let boardPixel = board.sprite[bsi];

                if(boardPixel!=0 && wordPixel!=0){
                    return true;
                }
            }
        }
        return false;
    }
    function placeWordToBoard(word, board){
        //Add the sprite
        let y0 = word.y + word.y0,
            x0 = word.x + word.x0,
            bw = board.width,
            ww = word.width,
            wh = word.height;
        for(let j=0; j< wh; j++){
            for(let i = 0; i< ww; i++){
                let wsi = j*ww + i;
                let bsi = (j+y0)*bw + i + x0;
                if(word.sprite[wsi]!=0) board.sprite[bsi] = word.sprite[wsi];
            }
        }
    }

    function buildSvg(boxes, topic){
        streamPath1 = Array(),
            streamPath2 = Array();
        let width = size[0],
            height = size[1];
        let svg = d3.select(document.createElement('svg')).attr({
            width: width,
            height: height
        });
        let graphGroup = svg.append('g');
        let n = boxes.length;

        let catIndex = boxes.topics.indexOf(topic);

        let area1 = d3.svg.area()
            .interpolate(interpolation)
            .x(function(d){return d.x; })
            .y0(0)
            .y1(function(d){return d.y0; });


        let area2 = d3.svg.area()
            .interpolate(interpolation)
            .x(function(d){return d.x; })
            .y0(function(d){return (d.y + d.y0); })
            .y1(height);

        graphGroup.append('path').datum(boxes.layers[catIndex])
            .attr({
                d: area1,
                stroke: 'red',
                'stroke-width': 2,
                fill :'red',
                id: 'path1'
            });
        graphGroup.append('path').datum(boxes.layers[catIndex])
            .attr({
                d: area2,
                stroke: 'red',
                'stroke-width': 2,
                fill :'red',
                id: 'path2'
            });
        return svg;
    }
    function buildCanvas(boxes, topic){
        let svg = buildSvg(boxes, topic);
        let path1 = svg.select("#path1").attr('d');
        let p2d1 = new Path2D(path1);
        let path2 = svg.select("#path2").attr('d');
        let p2d2 = new Path2D(path2);
        let canvas = document.createElement("canvas");
        canvas.width = size[0];
        canvas.height = size[1];
        let ctx = canvas.getContext('2d');
        ctx.fillStyle = 'red';
        ctx.fill(p2d1);
        ctx.fill(p2d2);
        return canvas;
    }
    function buildBoard(boxes, topic){
        let canvas = buildCanvas(boxes,topic);
        let width = canvas.width,
            height = canvas.height;
        let board = {};
        board.x = 0;
        board.y = 0;
        board.width = width;
        board.height = height;
        let sprite = [];
        //initialization
        for(let i=0; i< width*height; i++) sprite[i] = 0;
        let c = canvas.getContext('2d');
        let pixels = c.getImageData(0, 0, width, height).data;
        for(let i=0; i< width*height; i++){
            sprite[i] = pixels[i<<2];
        }
        board.sprite = sprite;
        return board;
    }
    function getContext(canvas) {
        canvas.width = cw;
        canvas.height = ch;
        let context = canvas.getContext("2d");
        context.fillStyle = context.strokeStyle = "red";
        context.textAlign = "center";
        context.textBaseline = "middle";
        return context;
    }
    //Get image data for all words
    function getImageData(boxes){
        let data = boxes.data;
        let c = getContext(canvas());
        c.clearRect(0, 0, cw, ch);
        let x = 0,
            y = 0,
            maxh = 0;
        for(let i = 0; i < data.length; i++){
            boxes.topics.forEach(topic =>{
                let words = data[i].words[topic];
                let n = words.length;
                let di=-1;
                let d = {};
                while (++di < n) {
                    d = words[di];
                    c.save();
                    d.fontSize = ~~fontScale(d.frequency);
                    d.rotate = (~~(Math.random() * 6) - 3) * rotateCorner;
                    c.font = ~~(d.fontSize + 1) + "px " + font;

                    let w = ~~(c.measureText(d.text).width),
                        h = d.fontSize;
                    if (d.rotate) {
                        let sr = Math.sin(d.rotate * cloudRadians),
                            cr = Math.cos(d.rotate * cloudRadians),
                            wcr = w * cr,
                            wsr = w * sr,
                            hcr = h * cr,
                            hsr = h * sr;
                        w = ~~Math.max(Math.abs(wcr + hsr), Math.abs(wcr - hsr));
                        h = ~~Math.max(Math.abs(wsr + hcr), Math.abs(wsr - hcr));
                    }
                    if (h > maxh) maxh = h;
                    if (x + w >= cw) {
                        x = 0;
                        y += maxh;
                        maxh = 0;
                    }
                    if (y + h >= ch) break;
                    c.translate((x + (w >> 1)) , (y + (h >> 1)));
                    if (d.rotate) c.rotate(d.rotate * cloudRadians);
                    c.fillText(d.text, 0, 0);
                    if (d.padding) c.lineWidth = 2 * d.padding, c.strokeText(d.text, 0, 0);
                    c.restore();

                    d.width = w;
                    d.height = h;
                    d.x = x;
                    d.y = y;
                    d.x1 = w>>1;
                    d.y1 = h>>1;
                    d.x0 = -d.x1;
                    d.y0 = -d.y1;
                    d.timeStep = i;
                    d.streamHeight = frequencyScale(d.frequency);
                    x += w;
                }
            });
        }
        for(let bc = 0; bc < data.length; bc++){
            boxes.topics.forEach(topic=>{
                let words = data[bc].words[topic];
                let n = words.length;
                let di=-1;
                let d = {};
                while (++di < n) {
                    d = words[di];
                    let w = d.width,
                        h = d.height,
                        x = d.x,
                        y = d.y;

                    let pixels = c.getImageData(d.x, d.y, d.width, d.height).data;
                    d.sprite = Array();
                    for(let i = 0; i<<2 < pixels.length; i++){
                        d.sprite.push(pixels[i<<2]);
                    }
                }
            });
        }
        //Only return this to test if needed
        return c.getImageData(0, 0, cw, ch);
    }
    function calculateTotalFrequenciesABox(data){
        let topics = d3.keys(data[0].words);
        let totalFrequenciesABox = Array();
        d3.map(data, function(row){
            let aBox = {};
            topics.forEach(topic =>{
                let totalFrequency = 0;
                row.words[topic].forEach(element => {
                    totalFrequency += element.frequency;
                });
                aBox[topic] = totalFrequency;
            });
            totalFrequenciesABox.push(aBox);
        });
        return totalFrequenciesABox;
    }
    //#endregion
    //#region defining the spirals
    function achemedeanSpiral(size){
        let e = size[0]/size[1];
        return function(t){
            return [e*(t *= .1)*Math.cos(t), t*Math.sin(t)];
        }
    };
    function rectangularSpiral(size){
        let dy = 4,
            dx = dy *size[0]/size[1],
            x = 0,
            y = 0;
        return function(t){
            let sign = t < 0 ? -1 : 1;
            switch((Math.sqrt(1 + 4*sign*t) - sign) & 3){
                case 0: x += dx; break;
                case 1: y += dy; break;
                case 2: x -= dx; break;
                default: y -= dy; break;
            }
        }
    };
    let spirals = {
        achemedean: achemedeanSpiral,
        rectangular: rectangularSpiral
    }
    function cloudCanvas() {
        return document.createElement("canvas");
    }
    //#endregion
    //#region exposed methods to test, should be deleted
    wordStream.getImageData = getImageData;
    wordStream.cloudCollide = cloudCollide;
    wordStream.place = place;
    wordStream.buildSvg = buildSvg;
    wordStream.buildCanvas = buildCanvas;
    wordStream.buildBoard = buildBoard;
    wordStream.placeWordToBoard = placeWordToBoard;
    wordStream.buildBoxes = buildBoxes;
    wordStream.buildFontScale = buildFontScale;
    //#endregion
    //Exporting the functions to set configuration data
    //#region setter/getter functions
    wordStream.interpolate = function(_){
        return arguments.length ? (interpolation = _, wordStream) : interpolation;
    }
    wordStream.streamPath1 = function(_){
        return arguments.length ? (streamPath1 = _, wordStream) : streamPath1;
    }
    wordStream.streamPath2 = function(_){
        return arguments.length ? (streamPath1 = _, wordStream) : streamPath2;
    }
    wordStream.font = function(_){
        return arguments.length ? (font = _, wordStream): font;
    }
    wordStream.frequencyScale = function(_){
        return arguments.length ? (frequencyScale = _, wordStream) : frequencyScale;
    }
    wordStream.spiral = function(_){
        return arguments.length ? (spiral = spirals[_]|| _, wordStream) : spiral;
    }
    wordStream.data = function(_) {
        return arguments.length ? (data = _, wordStream) : data;
    };
    wordStream.size = function(_){
        return arguments.length ? (size = _, wordStream) : size;
    };
    wordStream.maxFontSize = function(_){
        return arguments.length ? (maxFontSize = _, wordStream) : maxFontSize;
    };
    wordStream.minFontSize = function(_){
        return arguments.length ? (minFontSize = _, wordStream) : minFontSize;
    };
    wordStream.fontScale = function(_){
        return arguments.length ? (fontScale = _, wordStream) : fontScale;
    };
    wordStream.font = function (_) {
        return arguments.length ? (font = _, wordStream) : font;
    }
    //#endregion
    return wordStream;
};