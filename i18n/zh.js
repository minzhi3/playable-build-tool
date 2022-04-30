module.exports = {
  description: "HTML5可玩广告构建",
  isPlayable: {
    label: "输出为可玩广告格式",
    description: "是否输出可玩广告"
  },
  adNetwork: {
    label: "广告网络",
    description: "绑定广告网络SDK"
  },
  splitJs: {
    label: "分离保存较大的javascript文件",
    description: "不在index.html中内联较大的javascript文件，以减小index.html的体积"
  }
};