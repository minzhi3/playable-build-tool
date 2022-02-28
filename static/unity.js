var isRunning = false;
function onReadyCallback() {
  mraid.addEventListener("viewableChange", viewableChangeHandler);
  // Wait for the ad to become viewable for the first time
  if (mraid.isViewable()) {
    start();
    isRunning = true;
  }
}
function viewableChangeHandler(viewable){
  // start/pause/resume gameplay, stop/play sounds
  if (viewable) {
    if (!isRunning){
      start();
      isRunning = true;
    }
  } else {
    // pause
  }
}
window.onload = function () {
  if (mraid.getState() === "loading") {
    mraid.addEventListener("ready", onReadyCallback);
  } else {
    onReadyCallback();
  }
}