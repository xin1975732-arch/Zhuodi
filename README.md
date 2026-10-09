# 浊堤

中篇小说《浊堤》的网页阅读版：嘉靖四十年，浙西小县，户房书办沈默。二十章。

## 文件

| 文件 | 作用 |
| --- | --- |
| `index.html` | 书封与目录 |
| `ch01.html` … `ch20.html` | 每章一页 |
| `reader.css` | 版式与配色（浅绿羊皮纸 / 黄羊皮纸 / 夜灯） |
| `reader.js` | 落雨、听雨、字号、底色、续读、翻章 |
| `fonts.css`、`fonts/` | 思源宋体（Noto Serif SC）子集，只含书里用到的字 |
| `favicon.svg` | 浏览器标签上的小印 |

全部是静态文件，不需要编译，也不连任何外部服务。

## 发布到 GitHub Pages

1. 在 GitHub 新建一个公开仓库（例如 `zhuodi`）。
2. 把这个文件夹里的所有文件上传到仓库根目录（`.nojekyll` 也要传）。
3. 仓库 Settings → Pages → Build and deployment：Source 选 “Deploy from a branch”，Branch 选 `main`、目录 `/ (root)`，保存。
4. 等一两分钟，网址是 `https://<你的用户名>.github.io/zhuodi/`。

## 改配色

`reader.css` 开头三段：`:root`（浅绿羊皮纸，默认）、`[data-read="yang"]`（黄羊皮纸）、`[data-read="ye"]`（夜灯）。改里面的色值即可。

## 字体授权

`fonts/` 里的字体子集来自 Noto Serif CJK（思源宋体），按 SIL Open Font License 1.1 使用。
