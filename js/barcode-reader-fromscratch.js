navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { exact: "environment" } } })
.then(function(stream) {
  var video = document.querySelector('video');
  // Older browsers may not have srcObject
  if ("srcObject" in video) {
    video.srcObject = stream;

  } else {
    // Avoid using this in new browsers, as it is going away.
    video.src = window.URL.createObjectURL(stream);
  }
  video.onloadedmetadata = function(e) {
    video.play();
  };

  if (!('BarcodeDetector' in window)) {
    alert('Barcode Detector is not supported by this browser.');
  } else {
    alert('Barcode Detector supported!');
     var barcodeDetector = new BarcodeDetector({formats: ['code_39', 'codabar', 'ean_13', 'pdf417']});
  }
  barcodeDetector.detect(video)
  .then(barcodes => {
    barcodes.forEach(barcode => {
      console.log(barcode.rawData);
      $('#result').text(barcode.rawData);

    });
  })
  .catch(err => {
    console.log(err);
  })
})
.catch(function(err) {
  console.log(err.name + ": " + err.message);
});
