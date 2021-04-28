var theStream = null;
document.getElementById('detect').disabled = true;
var scale = 1.0;
$('.jumbotron').addClass('bg1');
$('.jumbotron').removeClass('bg2');
$('.navbar').addClass('bg1');
$('.navbar').removeClass('bg2');
$('#BCscan-complete-msg').hide();
$('#BCwait').hide()
function start() {
  $('#BCwait').show()

  // We want to select the environment-facing camera, but currently
  // that's not straightforward, instead, get the last enumerated one.
  navigator.mediaDevices.enumerateDevices()
  .then((devices) => {
    var videoSource = null;
    devices.forEach((device) => {
      if (device.kind == 'videoinput') {
        videoSource = device.deviceId;
      }
    });
    const constraints = { "video": { deviceId: {exact : videoSource}, width: { max: 750 } } };
    return navigator.mediaDevices.getUserMedia(constraints);
  })
  .then(stream => {
    document.getElementById('video').srcObject = stream;
    document.getElementById('start').disabled = true;
    document.getElementById('detect').disabled = false;
    theStream = stream;
  })
  .catch(e => { console.error('getUserMedia() failed: ', e); });
}

function detect() {
  if (window.BarcodeDetector == undefined) {
    var footer = document.getElementsByTagName('footer')[0];
    footer.innerHTML = "Barcode Detection not supported";
    console.error('Barcode Detection not supported');
    return;
  }

  var capturer = new ImageCapture(theStream.getVideoTracks()[0]);
  capturer.grabFrame()
    .then(bitmap => {
      var canvas = document.getElementById('canvas');
      canvas.width = canvas.height *
          document.getElementById('video').videoWidth /
          document.getElementById('video').videoHeight;
      scale = canvas.width / bitmap.width;
      var ctx = canvas.getContext("2d");
      ctx.drawImage(bitmap,
                    0, 0, bitmap.width, bitmap.height,
                    0, 0, canvas.width, canvas.height);

      var barcodeDetector = new BarcodeDetector();
      return barcodeDetector.detect(bitmap);
    })
    .then(barcodes => {
      var canvas = document.getElementById('canvas');
      var ctx = canvas.getContext("2d");
      ctx.lineWidth = 2;
      ctx.strokeStyle = "red";

      for(var i = 0; i < barcodes.length; i++) {
        const barcode = barcodes[i].boundingBox;
        ctx.rect(Math.floor(barcode.x * scale),
                 Math.floor(barcode.y * scale),
                 Math.floor(barcode.width * scale),
                 Math.floor(barcode.height * scale));
        ctx.stroke();
      }

      // Add the barcodes as strings to the <footer>
      // var footer = document.getElementsByTagName('footer')[0];
      // footer.innerHTML =
      //     '<p>Detected ' + barcodes.length + ' barcodes</p><ul>';
      $('#BCscan-complete-msg').show();
      $('#BCwait').hide();
      $('.jumbotron').removeClass('bg1');
      $('.jumbotron').addClass('bg2');
      $('.navbar').removeClass('bg1');
      $('.navbar').addClass('bg2');
      var BCVal = ""
      for(var i = 0; i < barcodes.length; i++) {
        BCVal += barcodes[i].rawValue;
      }
      $('#BCresult').text(BCVal)

    }).catch((e) => {
      var footer = document.getElementsByTagName('footer')[0];
      footer.innerHTML = "Boo, Barcode Detection failed: " + e;
      console.error("Boo, Barcode Detection failed: " + e);
    })
}
