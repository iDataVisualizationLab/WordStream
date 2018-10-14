function spriteToScreen(c, word){
    var imageData = c.getImageData(word.x, word.y, word.width, word.height);
    for(var i=0; i<<2 < imageData.data.length; i++){
        if(word.sprite[i]!=0){
            imageData.data[i<<2] = word.sprite[i];
            imageData.data[(i<<2)+1] = 0;
            imageData.data[(i<<2)+2] = 0;
            //Set alpha to 1
            imageData.data[(i<<2)+3] = 255;
        }
    }
    c.putImageData(imageData, word.x, word.y);
}
function buildSprite(width, height){
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    var c = canvas.getContext("2d");
    c.fillStyle = 'red';
    c.fillRect(0, 0, width, height);
    var pixels = c.getImageData(0, 0, width, height).data;
    var sprite = [];
    for(var i =0; i < width*height; i++){
        sprite[i] = 0;
    }
    for(var i = 0; i< width*height; i++){
        sprite[i] = pixels[i<<2];
    }
    return sprite;
}
function getDummyData(){
    var data = [
        {
            date: 'Jan 2010',
            words:
            {
                    location: [{text: "one", frequency: 1}, {text: "one", frequency: 2}],
                    person: [{text: "Three", frequency: 3}, {text: "Four", frequency: 1}]
            }
        },
        {
            date: 'Feb 2010',
            words: 
            {
                location: [{text: "Five", frequency: 5}, {text: "one", frequency: 2}],
                person: [{text: "Three", frequency: 3}, {text: "Four", frequency: 6}]
            }
        },
        {
            date: 'Mar 2010',
            words: 
            {
                location: [{text: "Five", frequency: 1}, {text: "one", frequency: 1}],
                person: [{text: "Three", frequency: 1}, {text: "Four", frequency: 1}]
            }
        }
    ];
    return data;
}