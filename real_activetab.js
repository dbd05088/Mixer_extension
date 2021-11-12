console.log("real_activetab.js loaded");

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
        x = x + (parseInt((width - measuredTextWidth)) / 2);
        y = (context.canvas.height - height) + 50;
        context.strokeStyle = 'rgb(255, 0, 0)';
        context.fillStyle = 'rgba(255, 255, 0, .5)';
        roundRect(context, x - 20, y - 35, measuredTextWidth + 40, 45, 20, true);
        var gradient = context.createLinearGradient(0, 0, width * 2, 0);
        gradient.addColorStop('0', 'magenta');
        gradient.addColorStop('0.5', 'blue');
        gradient.addColorStop('1.0', 'red');
        context.fillStyle = gradient;
        context.fillText(textToDisplay, x, y);
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

    normalVideoRenderHandler(clonedCamera2, 'Someone');

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
getUserMedia는 promise를 return한다.
이 Promise는 말 그대로 비동기 작업으로써, 진행되어야 할 일더미를 던져주는 것
다 실행될때까지 기다리고 없을 수는 없으니
--- Javascript는 Single Thread이므로 계속해서 기다릴 수 없고 저런 비동기 작업들은
브라우저의 background에서 돌아가게 된다.
우리는 thisPromise만 return해준 것이고, 현재 pending 상태인 채로 기다리고 있을 것이다.

promise의 resolve는 성공이 되었을 때 return할 부분을 지정해준다.
원래 getUserMedia의 경우 resolve(stream)이런식으로 되어 있었을 것이다.
하지만, 여기서는 다른 방식을 사용
먼저 globalResolveForGetUserMedia = resolve를 통해서 global resolve로 만들어 줌 (이게 핵심!)
그 다음, 쭉 원하는 작업을 다 한 후, globalResolveForgetUserMedia(stream)을 해주어
pending -> fulfilled로 만들어주는 것.
*/

// GetUserMedia 재정의
navigator.mediaDevices.getUserMedia = function(constraints) 
{
    let thisPromise = new Promise((resolve, reject) => {
        globalResolveForGetUserMedia = resolve;
    });

    // do something asynchronously
    doSomething(constraints); // do something 안에서 stream을 가져오고, 마지막에 globalResolveForGetUserMedia 실행
    return thisPromise;
}
