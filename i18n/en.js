module.exports = {
  title: "Playable Ads build tool",
  description: "Generate HTML5 playable ads",
  isPlayable: {
    label: "Output to playable format",
    description: "Build playable ads for an Ad networks"
  },
  adNetwork:{
    label: "Ad network",
    description: "Bind to SDK for an Ad network"
  },
  splitJs: {
    label: "Split large javascript file",
    description: "Do not use inline long javascript to reduce size of index.html"
  },
  gzip: {
    label: "Compress model files",
    description: "Compress base64 of .bin and .cconb files with Gzip"
  },
  loading: {
    label: "Loading screen",
    description: "Show loading screen"
  }
};