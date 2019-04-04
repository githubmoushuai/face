var recoURL='https://10.108.167.182:5000/register';
var iD=parseInt(Math.random()*10000000000+1);
var registerCount = 0;
var LIMIT = 10;
var video = null;
var canvas = document.createElement('canvas');
var capTimer = null;
var width = 300;
var height = 400;
var data = null;
var requestCount = 0;
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
        width = frameWidth;
        height = frameWidth;
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
	     id=("0000000000"+iD).toString().substr(-10);
	    console.log(id);
            $.ajax({
		type: 'POST',
                contentType: false,
                url: recoURL,
                data: id+data,
                error: function (err) {
                    alert(err);
                },
                success: function (data) {
                    if (data == 'registered') {
                        registerCount++;
                    }
                    if (capTimer == null) {
                        var text = '注册失败'
                        if (registerCount > LIMIT) {
                            text='注册成功,id: '+id
                        }
                        registerResult(text)
                    }

                }
            });
            clearPhoto();
        }
    } else {
        clearPhoto();
    }
}

function registerResult(text) {
    clearInterval(capTimer);
    var tip = document.getElementsByClassName('container-tip')[0];
    tip.innerText = text;
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
    var tips = ['请将镜头对准脸部', '请向左转头', '请向右转头', '请抬头', '请低头', '请耐心等待...'];
    var text = document.getElementsByClassName('container-tip')[0];
    var index = 0;

    function updateTip() {
        text.innerText = tips[index++];
    }

    text.innerText = '请将镜头对准脸部';

    setTimeout(function () {
        
	capTimer = setInterval(takePicture, 1000);
        var tipTimer = setInterval(function () {
            if (index == tips.length) {
                clearInterval(tipTimer);
                clearInterval(capTimer);
		capTimer=null;
            } else {
                updateTip(index);
            }
        }, 3000);


        clearPhoto();
        
    }, 3000);
}


getVideo();



