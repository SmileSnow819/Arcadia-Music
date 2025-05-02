# Arcadia
一个使用electron + vue3 + vueftiy编写的本地播放器+第三方网易云客户端，适配linux和windows平台
- (注意！本项目仍在早期开发阶段，功能尚未开发完全 
- 目前全部由个人独立开发，同时也是我的第一个项目。由于技术能力有限，同时很多地方还仍在学习中，同时欢迎有志之士一起合作交流

# 主要特色
## 精简网易云功能
- 只保留了网易云最核心功能，包括日推、fm、私人雷达、推荐歌单等，丢弃一切非必要部分。
- 右侧歌词小面板，切换和看歌词两不误
- 加强本地播放功能
## 高度可定制的主题
### 基于 Material UI六种主要颜色均可自定义
- 如果你喜欢纯色风格，你可以自己选择自己喜欢的颜色搭配。同时，提供主题的六种颜色调色板，让你搭配自己喜欢的颜色
![image](https://github.com/user-attachments/assets/6d7e924e-8789-49a4-a62b-aac87918a848)

### 图片背景
- 支持选喜欢的图像当作背景，但注意此时背景色将失效
- 注意！设置后请不要删除本地图片
![image](https://github.com/user-attachments/assets/c737402e-8842-4595-aa07-2fa70f8b57cf)
![image](https://github.com/user-attachments/assets/3149caee-4729-42c0-be23-8ccaf8c3e910)
![image](https://github.com/user-attachments/assets/1e75fd67-1e88-4e2e-87e5-cf37dd8b1614)

### 美观的播放页
- 歌词页面边框色和主颜色根据专辑封面自动取色
- 当歌曲名、歌手不含字母时，文字将会竖版排版
- 简洁美观的音频可视化功能
- 网易云评论功能
![image](https://github.com/user-attachments/assets/95f0c9f7-fe79-4767-a2c1-871b00063f16)
![image](https://github.com/user-attachments/assets/52f90169-b8dd-4c4c-884a-6ecdebab294b)
![image](https://github.com/user-attachments/assets/2244de00-8980-412a-955a-703833af9c12)

## 桌面歌词
- 注意，在linux上由于桌面限制，锁定歌词后只能在主页面内解锁，在windows上没有此问题
![image](https://github.com/user-attachments/assets/2fe17da7-ebf1-425d-a6e5-1eed9359247f)
### 桌面歌词自动取色/自定义颜色/自定义字体大小
## 本地化播放
### 内置下载和读取歌曲功能
- 可从本地读取现有数据，并将下载数据与其自动合并。
- 应用内下载歌曲将会嵌入歌词，在歌词页面将会显示歌词来自本地
![image](https://github.com/user-attachments/assets/62576f2b-8edc-40ed-bc38-32efb5bc16c7)

### 自动化分类并构建本地歌手与专辑界面
- 自动化根据本地歌曲的信息分类并合并到同一专辑和艺术家，使用本地歌曲也能给你带来和网易云一样的体验
![image](https://github.com/user-attachments/assets/e18d59d3-f7f0-4e2d-a141-87a13114f440)


## 其他
- 点击歌曲名即可进入专辑页面，点击歌手即可进入歌手页面，快速查看你喜欢的专辑和歌手
- 右键歌曲名、专辑名、歌手名将直接复制，右键搜索框自动粘贴并搜索
- 在本地歌单和网易云歌单中直接拖动歌曲到你想要的位置，即可重新排序
- 在右侧小面板中直接拖动歌曲到你想要的位置，即可重新排序
- 对本地歌曲点喜欢，将会收藏到本地的我喜欢中
# 一些问题
- 会开发移动端吗？
目前没有这个打算（或许以后会有
- 为什么没有mac端？
本人没有mac设备，无法针对mac进行调整，请尝试自己修改源代码并编译
# 最后
- 在windows11和ubuntu22.04上测试通过，其他系统请自行测试
- 感谢我的朋友们对我的支持，你们的肯定是我努力的最大动力
