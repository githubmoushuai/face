var recoURL='https://10.108.167.182:5000/face';


var video = null;
var canvas = document.createElement('canvas');
var photo = document.createElement('img');
var capTimer = null;
var width = 300;
var height = 400;
var data = null;
var winWidth = window.screen.width;
var winHeight = window.screen.height;
var scanFrame = document.getElementsByClassName('container-frame')[0];

var frameWidth = scanFrame.offsetWidth;

function getVideo() {
    if (!navigator.getUserMedia)
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia || navigator.msGetUserMedia;


    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        console.log("enumerateDevices() not supported.");
        return;
    }

    var exArray = []; 
    navigator.mediaDevices.enumerateDevices()
        .then(function (devices) {
            devices.forEach(function (device) {
                if (device.kind === 'videoinput') {
                    exArray.push(device.deviceId);
                }
            });
            if (navigator.getUserMedia) {
                navigator.getUserMedia({video: {deviceId: exArray[1]}}, captureVideo, function (e) {
                    alert('Error capturing audio.');
                });
            } else {
                alert('getUserMedia not supported in this browser.');
            }
        })
        .catch(function (err) {
            console.log(err.name + ": " + err.message);
        });

}

function captureVideo(stream) {
    video = document.getElementById('video');
    width = window.screen.width;
    height = window.screen.height;
    video.setAttribute('width', width);
    video.setAttribute('height', height);


    if (window.URL) {
        video.src = window.URL.createObjectURL(stream);
    } else {
        video.src = stream;
    }

    video.autoplay = true;
}


function takePicture() {
 var size=video.videoHeight;
    canvas.width = size;
    canvas.height = size;    
var context = canvas.getContext('2d');
    if (width && height) {
        var sx = Math.floor((video.videoWidth - size) / 2);
        var sy = 0;
        var w = size;
        var h = size;
        context.drawImage(video, sx, sy, w, h, 0, 0, w, h);
        var data2 = canvas.toDataURL('image/jpeg');

        if (data === data2) {
        } else {
            data = data2;
            $.ajax({
                type: 'POST',
                contentType: false,
                url: recoURL,
                data: data,
                error: function (err) {
                    alert(err);
                },
                success: scanSuccess
            });
        }
    } else {
        clearPhoto();
    }
}

function scanSuccess(mes) {
    alert(mes);
}

function clearPhoto() {
    var context = canvas.getContext('2d');
    context.fillStyle = "#AAA";
    context.fillRect(0, 0, canvas.width, canvas.height);
}

function scanLineMove() {
    var height = document.getElementsByClassName('container-frame')[0].offsetHeight;
    height = height - 20;
    $('#scan-line').css("top", "0px");
    $('#scan-line').animate({top: height}, 2000, "linear", scanLineMove);
}

function startScan() {
    $('#scan-btn').hide();
    $('#scan-line').show();
    scanLineMove();
    setTimeout(function () {
        capTimer = setInterval(takePicture, 1000);
        clearPhoto();
    }, 3000);
}

function doPostBack(url, backFunc, queryParam, errFunc) {
    $.ajax({
        type: 'POST',
        contentType: 'application/json; charset=UTF-8',
        dataType: 'json', 
        url: url,
        data: JSON.stringify(queryParam),
        error: errFunc,
        success: backFunc
    });
}


function intoScan(id) {
    $('#scan-line').css("top", "0px");
    jump('scan', id);
    jump('scan-btn');
    if (id == 'index') {
        getVideo();
        if (firstInto == 'yes') {
            setTimeout(function () {
                jump('strategy');
                firstInto = 'no';
            }, 500);
        }
    }
    $("#animate").children('div').css('display', 'none');
    $('#animate').hide();
    $('#control_tip').hide();
}


getVideo();



