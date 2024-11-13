# Arcadia
一个使用electron + vue3 + vueftiy编写的本地播放器+第三方网易云客户端，适配linux和windows平台
- (注意！本项目仍在早期开发阶段，功能尚未开发完全 
- 个人独立开发，耗时两个月，同时欢迎有志之士一起合作

# 主要特色
## 精简网易云功能
- 只保留了网易云最核心功能，包括日推、fm、私人雷达、推荐歌单等，丢弃一切非必要部分。
## 高度可定制的主题
### 基于 Material UI六种主要颜色均可自定义
- 如果你喜欢纯色风格，你可以自己选择自己喜欢的颜色搭配
![24410cd0-a294-49e0-8f38-fdc9f94e2e17](https://github.com/user-attachments/assets/921ea4ca-87bf-4bb4-a3fb-03d783a8c93a)![image](https://github.com/user-attachments/assets/89823c48-88b9-4cab-b44b-564f750fd82e)
![image](https://github.com/user-attachments/assets/e92ee33e-2d05-4f6a-9595-2672d0bd36ea)![image](https://github.com/user-attachments/assets/2a6b367e-ef40-41b0-9670-530dcd839c44)
### 图片背景
- 如果你喜欢使用自己喜爱的图像当作背景，直接上传即可，但注意此时背景色将失效
- 注意！设置后请不要删除本地图片
![image](https://github.com/user-attachments/assets/b3cce87d-2f73-4756-8536-53b3008e3acf)
![image](https://github.com/user-attachments/assets/0ab79bb0-665c-44aa-abcf-14c5180b095e)
### 美观的播放页
- 歌词页面边框色和主颜色根据专辑封面自动取色
- 当歌曲名、歌手不含字母时，文字将会竖版排版
- 简洁美观的音频可视化功能
![image](https://github.com/user-attachments/assets/e3bf226d-154a-4469-be8e-ccf61643a129)
![image](https://github.com/user-attachments/assets/4b1bb743-a6b4-4d68-8153-f94dafe8cbb5)
![image](https://github.com/user-attachments/assets/5d4f14fc-0f37-4ac8-9705-dc588101b9e3)
## 桌面歌词
- 注意，在linux上由于桌面限制，锁定歌词后只能在主页面内解锁，在windows上没有此问题
![image](https://github.com/user-attachments/assets/46d6a055-37b1-4119-8e15-d065792be69d)
### 桌面歌词自动取色/自定义颜色/自定义字体大小
## 本地化播放
### 内置下载和读取歌曲功能
- 可从本地读取现有数据，并将下载数据与其自动合并。
- 应用内下载歌曲将会嵌入歌词，在歌词页面将会显示歌词来自本地
![image](https://github.com/user-attachments/assets/88d0c621-032b-446d-af06-ec390604667f)
### 自动化分类并构建本地歌手与专辑界面
- 自动化根据本地歌曲的信息分类并合并到同一专辑和艺术家，使用本地歌曲也能给你带来和网易云一样的体验
![image](https://github.com/user-attachments/assets/32e30c30-3f62-47ab-a195-44dd6a8f4533)
![image](https://github.com/user-attachments/assets/9a29e83c-ac5a-4bcc-9f8e-7ab9a69b4135)
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
