function gameStart() {
  console.log("start")
}

function gameClose() {
  console.log("close")
}

window.onload = function (){
  start()
  if (window.gameReady){
    window.gameReady()
  }
}