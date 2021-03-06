console.log("injected Loaded");

function fullCanvasRenderHandler(stream, textToDisplay) {
  // on-video-render:
  // called as soon as this video stream is drawn (painted or recorded) on canvas2d surface
    stream.onRender = function(context, x, y, width, height, idx) {
        context.font = '50px Georgia';
        var measuredTextWidth = parseInt(context.measureText(textToDisplay).width);
        x = x + (parseInt((width - measuredTextWidth)) - 40);
        y = y + 80;
        context.strokeStyle = 'rgb(255, 0, 0)';
        context.fillStyle = 'rgba(255, 255, 0, .5)';
        roundRect(context, x - 20, y - 55, measuredTextWidth + 40, 75, 20, true);
        var gradient = context.createLinearGradient(0, 0, width * 2, 0);
        gradient.addColorStop('0', 'magenta');
        gradient.addColorStop('0.5', 'blue');
        gradient.addColorStop('1.0', 'red');
        context.fillStyle = gradient;
        context.fillText(textToDisplay, x, y);
    };
}

function normalVideoRenderHandler(stream, textToDisplay, callback) {
  // on-video-render:
  // called as soon as this video stream is drawn (painted or recorded) on canvas2d surface
    stream.onRender = function(context, x, y, width, height, idx, ignoreCB) {
        if(!ignoreCB && callback) {
            callback(context, x, y, width, height, idx, textToDisplay);
            return;
        }

        context.font = '40px Georgia';
        var measuredTextWidth = parseInt(context.measureText(textToDisplay).width);
        //x = x + (parseInt((width - measuredTextWidth)) / 2);
        x = 0;
        y = (context.canvas.height - height) + 50;
        context.strokeStyle = 'rgb(255, 0, 0)';
        context.fillStyle = 'rgba(255, 255, 0, .5)';
        //roundRect(context, x - 20, y - 35, measuredTextWidth + 40, 45, 20, true);
        roundRect(context, x, y - 35, measuredTextWidth + 40, 45, 20, true);
        var gradient = context.createLinearGradient(0, 0, width * 2, 0);
        gradient.addColorStop('0', 'magenta');
        gradient.addColorStop('0.5', 'blue');
        gradient.addColorStop('1.0', 'red');
        context.fillStyle = gradient;
        //context.fillText(textToDisplay, x, y);
    };
}

/**
* Draws a rounded rectangle using the current state of the canvas.
* If you omit the last three params, it will draw a rectangle
* outline with a 5 pixel border radius
* @param {CanvasRenderingContext2D} ctx
* @param {Number} x The top left x coordinate
* @param {Number} y The top left y coordinate
* @param {Number} width The width of the rectangle
* @param {Number} height The height of the rectangle
* @param {Number} [radius = 5] The corner radius; It can also be an object 
*                 to specify different radii for corners
* @param {Number} [radius.tl = 0] Top left
* @param {Number} [radius.tr = 0] Top right
* @param {Number} [radius.br = 0] Bottom right
* @param {Number} [radius.bl = 0] Bottom left
* @param {Boolean} [fill = false] Whether to fill the rectangle.
* @param {Boolean} [stroke = true] Whether to stroke the rectangle.
*/
// via: http://stackoverflow.com/a/3368118/552182
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof stroke == 'undefined') {
        stroke = true;
    }
    if (typeof radius === 'undefined') {
        radius = 5;
    }
    if (typeof radius === 'number') {
        radius = {
            tl: radius,
            tr: radius,
            br: radius,
            bl: radius
        };
    } else {
        var defaultRadius = {
            tl: 0,
            tr: 0,
            br: 0,
            bl: 0
        };
        for (var side in defaultRadius) {
            radius[side] = radius[side] || defaultRadius[side];
        }
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    if (fill) {
        ctx.fill();
    }
    if (stroke) {
        ctx.stroke();
    }
}

var globalResolveForGetUserMedia;
var get_stream = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);

function doSomething(constraints) {

    var fullCanvasStream = new MediaStream();
    var clonedCamera2 = new MediaStream();
    var mixer;

    get_stream(constraints).
    catch(function(error) {
        console.log("!!smh failure");
    }).
    then(function(stream1){
        stream1.getTracks().forEach(function(track) {
        fullCanvasStream.addTrack(track);
        });

    fullCanvasStream.fullcanvas = true;
    fullCanvasStream.width = screen.width; // or 3840
    fullCanvasStream.height = screen.height; // or 2160 

    fullCanvasRenderHandler(fullCanvasStream, 'stream1');
    console.log("!!!first stream finish");
    console.log("!!smh success");

    get_stream(constraints).
    catch(function(error) {
        console.log("!!smh failure");
    }).
    then(function(stream2)
    {
      // phone
        stream2.getTracks().forEach(function(track) {
        clonedCamera2.addTrack(track);
    });

    clonedCamera2.width = parseInt((30 / 100) * fullCanvasStream.width);
    clonedCamera2.height = parseInt((30 / 100) * fullCanvasStream.height);
    clonedCamera2.top = fullCanvasStream.height - clonedCamera2.height;
    clonedCamera2.left = fullCanvasStream.width - (clonedCamera2.width * 2);

    normalVideoRenderHandler(clonedCamera2, 'Phone');

    console.log("!!!second stream finish");
    mixer = new MultiStreamsMixer([fullCanvasStream, clonedCamera2]);
    mixer.frameInterval = 1;
    mixer.startDrawingFrames();

    globalResolveForGetUserMedia(mixer.getMixedStream());
    });
    });
  //
}

/*
getUserMedia??? promise??? return??????.
??? Promise??? ??? ????????? ????????? ???????????????, ??????????????? ??? ???????????? ???????????? ???
??? ?????????????????? ???????????? ?????? ?????? ?????????
--- Javascript??? Single Thread????????? ???????????? ????????? ??? ?????? ?????? ????????? ????????????
??????????????? background?????? ???????????? ??????.
????????? thisPromise??? return?????? ?????????, ?????? pending ????????? ?????? ???????????? ?????? ?????????.

promise??? resolve??? ????????? ????????? ??? return??? ????????? ???????????????.
?????? getUserMedia??? ?????? resolve(stream)??????????????? ?????? ????????? ?????????.
?????????, ???????????? ?????? ????????? ??????
?????? globalResolveForGetUserMedia = resolve??? ????????? global resolve??? ????????? ??? (?????? ??????!)
??? ??????, ??? ????????? ????????? ??? ??? ???, globalResolveForgetUserMedia(stream)??? ?????????
pending -> fulfilled??? ??????????????? ???.
*/

// GetUserMedia ?????????
navigator.mediaDevices.getUserMedia = function(constraints) 
{
    console.log("my getUserMedia");
    let thisPromise = new Promise((resolve, reject) => {
        globalResolveForGetUserMedia = resolve;
    });

    // do something asynchronously
    doSomething(constraints); // do something ????????? stream??? ????????????, ???????????? globalResolveForGetUserMedia ??????
    return thisPromise;
}
console.log("hmm");

function foo()  {
    console.log("foo!!");
}

chrome.runtime.sendMessage({
    method: "contentScriptLoaded",
    params: {
        url: location.href
    }
}, function (response) {
    // blank
    return;
});