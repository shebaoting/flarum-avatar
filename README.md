# Flarum Avatar

[中文说明](README.zh-Hans.md)

Flarum Avatar is a Reddit-style avatar builder for Flarum 2. It replaces the default avatar upload flow with a layered SVG editor where users can style a full character, preview every item on the base avatar, pick outfits, tune colors, choose a background, and display the finished avatar in forum UI.

The editor is designed for communities that want a playful identity system instead of simple uploaded profile pictures. It keeps the experience inside Flarum, uses the active forum language, and stores each user's selections as structured avatar decoration data.

## Screenshots

Screenshots captured from `http://bbs.test/avatar/edit`.

![Avatar editor outfit tab](docs/avatar-editor-1.png)

![Avatar editor item tab](docs/avatar-editor-2.png)

## Features

- Reddit-style avatar editor page at `/avatar/edit`.
- Layered SVG rendering with correct ordering for body, head, eyes, hair, accessories, left hand, right hand, and outfit parts.
- Replacement-mode support for core body parts such as head, eyes, upper body, and lower body.
- Outfit support with grouped SVG parts and preview images.
- Item cards preview each asset on the default avatar, without showing file names or titles.
- Color controls for body, hair, eyes, and avatar background.
- Built-in solid, gradient, radial, conic, and striped background presets.
- Decorated avatars are shown in forum UI with a portrait crop so the character is readable at small sizes.
- Default Flarum avatar upload/remove UI is hidden while the extension is enabled.
- Clicking the user avatar in settings or on the user's profile opens the avatar editor.
- English and Simplified Chinese locale files are included.

## Requirements

- Flarum `^2.0.0-beta`
- PHP `^8.3`
- Composer
- Node.js and Yarn only when rebuilding frontend assets

## Installation

Install the extension with Composer:

```bash
composer require shebaoting/flarum-avatar:^2.0
php flarum migrate
php flarum cache:clear
php flarum assets:publish
```

For local development in this repository, the package can be loaded through a Composer path repository from the Flarum app:

```json
{
  "repositories": {
    "shebaoting-flarum-avatar": {
      "type": "path",
      "url": "../packages/flarum-avatar"
    }
  }
}
```

Then require the package from the Flarum root:

```bash
composer require shebaoting/flarum-avatar:^2.0
php flarum migrate
php flarum cache:clear
php flarum assets:publish
```

## Usage

After enabling the extension, users edit their avatar by clicking their avatar in:

- `/settings`
- their own user profile header

The editor opens at:

```text
/avatar/edit
```

The default avatar upload and remove controls are intentionally hidden so the decoration editor becomes the only avatar-management entry point.

## Asset Structure

Avatar assets are bundled in:

```text
assets/avatars
```

The extension scans tab folders such as:

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

Normal tabs contain SVG files or item folders. The `Outfits` tab supports section folders, and every outfit item can be a folder containing multiple child SVG parts plus a preview image such as:

```text
preview.png
preview.svg
preview.webp
preview.jpg
preview.jpeg
```

The default avatar is rendered from layered SVG files under:

```text
assets/avatars/reddit-default-avatar-white-layers
```

This layered base allows items to replace or overlay specific body parts instead of simply stacking everything on top.

## Frontend Development

When changing forum or admin JavaScript, rebuild the bundled assets:

```bash
cd js
yarn install
yarn build
```

Then publish Flarum assets:

```bash
php flarum cache:clear
php flarum assets:publish
```

## Localization

The extension includes:

```text
locale/en.yml
locale/zh-Hans.yml
```

Flarum automatically selects the matching language according to the forum's current locale.

## License

MIT

## Community & Contact

Community: https://wyz.xyz

Email: th9th@th9th.com
