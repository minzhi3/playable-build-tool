function gameStart() {
  start()
  if (window.gameReady){
    window.gameReady()
  }
  console.log("start")
}

function gameClose() {
  console.log("close")
}