module.exports = {
  title: "HTML5广告构建器",
  description: "生成HTML5可玩广告格式",
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
  },
  gzip: {
    label: "Gzip压缩",
    description: "使用Gzip压缩模型文件（.bin和.cconb）"
  },
  loading: {
    label: "Loading画面",
    description: "游戏开始时显示加载进度"
  }
};