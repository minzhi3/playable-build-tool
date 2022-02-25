window.onload = function(){
  (dapi.isReady()) ? onReadyCallback() : dapi.addEventListener("ready", onReadyCallback);    
  //here you can put other code that not related to dapi logic
};

function onReadyCallback(){
  //no need to listen to this event anymore
  dapi.removeEventListener("ready", onReadyCallback);
    let isAudioEnabled = !!dapi.getAudioVolume();

  if(dapi.isViewable()){
      adVisibleCallback({isViewable: true});
  }

  dapi.addEventListener("viewableChange", adVisibleCallback);
  dapi.addEventListener("adResized", adResizeCallback);
  dapi.addEventListener("audioVolumeChange", audioVolumeChangeCallback);
}

function adVisibleCallback(event){
  console.log("isViewable " + event.isViewable);
  if (event.isViewable){
      screenSize = dapi.getScreenSize();
      start()
  } else {
      //PAUSE the ad and MUTE sounds
  }
}

function adResizeCallback(event){
  screenSize = event;
  console.log("ad was resized width " + event.width + " height " + event.height);
}

//When user clicks on the download button - use openStoreUrl function
function userClickedDownloadButton(event){
  dapi.openStoreUrl();
}

function audioVolumeChangeCallback(volume){
  let isAudioEnabled = !!volume;
  if (isAudioEnabled){
      //START or turn on the sound
  } else {
      //PAUSE the turn off the sound
  }
}
