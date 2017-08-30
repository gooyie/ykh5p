# ykh5p

优酷官方`html5`播放器，目前处于测试阶段，功能不完善。

## 脚本管理器兼容
`Greasemonkey`用不了（沙箱限制），`Tampermonkey`和`Violentmonkey`可正常使用。

## 安装
* [GitHub](https://raw.githubusercontent.com/gooyie/ykh5p/master/ykh5p.user.js)（源码）
* [GreasyFork](https://greasyfork.org/zh-CN/scripts/30432-ykh5p)（已转码）

## 脚本实现的功能
* 启用html5播放器（禁用脚本后刷新页面可恢复原播放器）
* 和谐播放器广告与水印
* 解除会员画质限制
* 设置里优先画质增加1080P选项并对齐到当前画质
* 改善当前画质逻辑
* 改善控件与光标自动隐藏
* 快捷键

## 键盘快捷键
快捷键仿照`PotPlayer`和`youtube`

| 按键 | 功能 |
| ---- | ---- |
| 空格 | 播放 / 暂停 |
| 回车 | 进入全屏 / 退出全屏 |
| ↑ | 音量增加 5% |
| ↓ | 音量减少 5% |
| m | 静音 / 取消静音 |
| d | 上一帧 |
| f | 下一帧 |
| ← | 步退5秒 |
| → | 步进5秒 |
| ctrl + ← | 步退30秒 |
| ctrl + → | 步进30秒 |
| shift + ← | 步退1分钟 |
| shift + → | 步进1分钟 |
| ctrl + alt + ← | 步退5分钟 |
| ctrl + alt + → | 步进5分钟 |
| 0 ~ 9 | 定位到视频的 x0%|
| c | 播放速率提高 0.1 |
| x | 播放速率降低 0.1 |
| z | 恢复正常播放速率 |
| shift + p | 播放上一集 |
| shift + n | 播放下一集 |

## 鼠标快捷键
| 操作 | 功能 |
| ---- | ---- |
| 在播放区域单击左键 | 播放 / 暂停 |
| 在播放区域双击左键 | 全屏切换 |
| 全屏下滚动滚轮 | 音量调节 |

![screenshot](https://user-images.githubusercontent.com/25021141/26927128-1d4034ce-4c83-11e7-8fdb-845a0047aa3a.png)
