# 头像装饰

[English README](README.md)

头像装饰是一个为 Flarum 2 开发的 Reddit 风格头像编辑器。它会用分层 SVG 角色编辑器替代默认头像上传流程，让用户可以选择套装、上装、下装、发型、帽子、眼睛、面部、左右手装饰，并且可以调整身体、头发、眼睛和头像背景颜色。

这个扩展适合希望社区头像更具个性化的站点。用户不再只是上传一张图片，而是可以在 Flarum 内直接搭配完整形象。每个素材都会基于默认人物进行预览，最终头像会在论坛中以更适合小尺寸展示的半身裁切方式显示。

## 截图

以下截图来自 `http://bbs.test/avatar/edit`。

![头像编辑器套装页](docs/avatar-editor-1.png)

![头像编辑器素材页](docs/avatar-editor-2.png)

## 功能特性

- 提供 `/avatar/edit` 头像装扮页面。
- 使用分层 SVG 渲染头像，支持身体、头部、眼睛、发型、配饰、左右手、套装部件等层级。
- 支持替换模式，例如头部、眼睛、上半身、下半身等素材会替换默认部件，而不是简单叠加。
- 支持 `Outfits` 套装组合，组合内可以包含多个子 SVG。
- 支持套装预览图，优先使用素材目录内的 `preview.png` 等图片。
- 素材卡片不会显示文件名或标题，预览图直接显示默认人物加当前素材的效果。
- 支持身体、头发、眼睛、背景颜色选择。
- 内置多种纯色、线性渐变、径向渐变、彩色和条纹背景。
- 论坛内最终头像采用半身裁切显示，小头像里人物更清晰。
- 启用扩展后隐藏 Flarum 默认头像上传、删除和选择图片入口。
- 只允许在设置页或自己的用户页顶部点击头像进入装扮页面。
- 内置英文和简体中文语言包，会根据当前 BBS 语言自动显示。

## 环境要求

- Flarum `^2.0.0-beta`
- PHP `^8.3`
- Composer
- 只有在重新构建前端资源时才需要 Node.js 和 Yarn

## 安装

通过 Composer 安装：

```bash
composer require shebaoting/flarum-avatar:^2.0
php flarum migrate
php flarum cache:clear
php flarum assets:publish
```

如果是在本项目内本地开发，可以在 Flarum 根目录的 `composer.json` 中通过 path repository 加载：

```json
{
  "repositories": {
    "shebaoting-avatar": {
      "type": "path",
      "url": "../packages/flarum-avatar"
    }
  }
}
```

然后在 Flarum 根目录执行：

```bash
composer require shebaoting/flarum-avatar:^2.0
php flarum migrate
php flarum cache:clear
php flarum assets:publish
```

## 使用方式

启用扩展后，用户可以在以下位置点击自己的头像进入装扮页面：

- `/settings`
- 自己的用户主页顶部

头像装扮页面地址：

```text
/avatar/edit
```

扩展会隐藏 Flarum 默认头像上传和删除操作，让头像管理统一进入装扮编辑器。

## 素材目录

头像素材位于：

```text
assets/avatars
```

扩展会扫描以下 tab 文件夹：

```text
Outfits/
Tops/
Bottoms/
Hair/
Hats/
Eyes/
Face/
Left_Hand/
Right_Hand/
```

普通 tab 可以直接放 SVG 文件，也可以使用子文件夹组织素材。`Outfits` 套装支持分组目录，每个套装可以是一个文件夹，里面包含多个子 SVG，同时可以放置预览图：

```text
preview.png
preview.svg
preview.webp
preview.jpg
preview.jpeg
```

默认人物由以下目录中的多层 SVG 组成：

```text
assets/avatars/reddit-default-avatar-white-layers
```

这种分层结构可以让素材根据类型选择“替换默认部件”或“覆盖到指定层级”，避免所有素材都简单叠加导致显示错误。

## 前端开发

修改 forum 或 admin 前端代码后，需要重新构建：

```bash
cd js
yarn install
yarn build
```

然后重新发布 Flarum 资源：

```bash
php flarum cache:clear
php flarum assets:publish
```

## 语言包

扩展内置：

```text
locale/en.yml
locale/zh-Hans.yml
```

Flarum 会根据当前论坛语言自动选择对应翻译。

## 开源协议

MIT

## 社区与联系方式

社区地址：https://wyz.xyz

邮箱地址：th9th@th9th.com

承接各类 Flarum 扩展开发，以及各类软件开发。
