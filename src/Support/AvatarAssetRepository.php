<?php

namespace Shebaoting\FlarumAvatar\Support;

use Flarum\Api\Context;
use Flarum\User\User;
use Illuminate\Support\Arr;

class AvatarAssetRepository
{
    public const VERSION = 1;

    public const DEFAULT_FILE = 'reddit-default-avatar-white.svg';

    public const DEFAULT_LAYERS = [
        [
            'path' => 'reddit-default-avatar-white-layers/01_body_lower.svg',
            'slot' => 'DEFAULT_BODY_LOWER',
            'layer' => 25,
        ],
        [
            'path' => 'reddit-default-avatar-white-layers/02_body_upper_arms.svg',
            'slot' => 'DEFAULT_BODY_UPPER',
            'layer' => 35,
        ],
        [
            'path' => 'reddit-default-avatar-white-layers/03_head_and_antenna.svg',
            'slot' => 'DEFAULT_HEAD',
            'layer' => 65,
        ],
        [
            'path' => 'reddit-default-avatar-white-layers/04_eyes.svg',
            'slot' => 'DEFAULT_EYES',
            'layer' => 75,
        ],
    ];

    public const TAB_ORDER = [
        'Outfits',
        'Tops',
        'Bottoms',
        'Hair',
        'Hats',
        'Eyes',
        'Face',
        'Left_Hand',
        'Right_Hand',
    ];

    public const ALLOWED_COLOR_KEYS = ['body', 'hair', 'eyes', 'background'];

    public const BACKGROUND_COLORS = [
        '#ffffff',
        '#f8fafc',
        '#f1f5f9',
        '#e0f2fe',
        '#dcfce7',
        '#fef3c7',
        '#ffe4e6',
        '#f5f3ff',
        '#faf5ff',
        '#ecfccb',
        '#ccfbf1',
        '#fce7f3',
        '#111827',
        '#1e293b',
        '#164e63',
        '#3b0764',
        'linear-gradient(135deg, #fdf2f8 0%, #dbeafe 100%)',
        'linear-gradient(135deg, #ecfeff 0%, #dcfce7 100%)',
        'linear-gradient(135deg, #fff7ed 0%, #fde68a 100%)',
        'linear-gradient(135deg, #e0e7ff 0%, #f5d0fe 100%)',
        'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 48%, #fef3c7 100%)',
        'linear-gradient(135deg, #f0f9ff 0%, #bae6fd 50%, #f0fdf4 100%)',
        'linear-gradient(135deg, #fff1f2 0%, #fecdd3 45%, #fed7aa 100%)',
        'linear-gradient(135deg, #fef9c3 0%, #bbf7d0 45%, #bfdbfe 100%)',
        'linear-gradient(135deg, #fae8ff 0%, #c4b5fd 55%, #93c5fd 100%)',
        'linear-gradient(135deg, #0f172a 0%, #312e81 54%, #7c2d12 100%)',
        'linear-gradient(135deg, #022c22 0%, #065f46 55%, #14b8a6 100%)',
        'linear-gradient(135deg, #312e81 0%, #7e22ce 50%, #db2777 100%)',
        'linear-gradient(135deg, #7f1d1d 0%, #ea580c 52%, #facc15 100%)',
        'radial-gradient(circle at 30% 20%, #ffffff 0%, #e0f2fe 45%, #bfdbfe 100%)',
        'radial-gradient(circle at 35% 25%, #fff7ed 0%, #fed7aa 44%, #fb7185 100%)',
        'radial-gradient(circle at 20% 20%, #fefce8 0%, #fef3c7 42%, #fb7185 100%)',
        'radial-gradient(circle at 70% 20%, #ecfeff 0%, #99f6e4 45%, #0f766e 100%)',
        'radial-gradient(circle at 30% 30%, #f5f3ff 0%, #ddd6fe 42%, #7c3aed 100%)',
        'conic-gradient(from 180deg at 50% 50%, #fef3c7, #fbcfe8, #bfdbfe, #bbf7d0, #fef3c7)',
        'repeating-linear-gradient(45deg, #f8fafc 0 10px, #e2e8f0 10px 20px)',
    ];

    private static ?array $manifest = null;

    private static ?int $assetVersion = null;

    public function __construct(
        private readonly string $assetsPath = __DIR__.'/../../assets/avatars',
    ) {
    }

    public static function canEditUser(User $user, Context $context): bool
    {
        $actor = $context->getActor();

        return $actor->id === $user->id || $actor->can('edit', $user);
    }

    public static function decodeUserDecoration(?string $value): array
    {
        if (! $value) {
            return self::defaultDecoration();
        }

        $decoded = json_decode($value, true);

        if (! is_array($decoded)) {
            return self::defaultDecoration();
        }

        return self::normalizeDecoration($decoded);
    }

    public static function defaultDecoration(): array
    {
        return [
            'version' => self::VERSION,
            'selections' => new \stdClass(),
            'colors' => [
                'body' => '#ffffff',
                'hair' => '#111827',
                'eyes' => '#111827',
                'background' => '#ffffff',
            ],
        ];
    }

    public static function normalizeDecoration(array $value): array
    {
        $selections = Arr::get($value, 'selections', []);
        $colors = Arr::get($value, 'colors', []);

        if (! is_array($selections)) {
            $selections = [];
        }

        if (! is_array($colors)) {
            $colors = [];
        }

        $normalizedSelections = [];

        foreach ($selections as $tab => $item) {
            if (! is_string($tab) || ! in_array($tab, self::TAB_ORDER, true) || ! is_array($item)) {
                continue;
            }

            $id = Arr::get($item, 'id');
            $assets = Arr::get($item, 'assets', []);

            if (! is_string($id) || ! is_array($assets)) {
                continue;
            }

            $normalizedAssets = [];

            foreach ($assets as $asset) {
                if (! is_array($asset)) {
                    continue;
                }

                $path = Arr::get($asset, 'path');

                if (! is_string($path) || ! self::isSafeRelativePath($path)) {
                    continue;
                }

                $normalizedAssets[] = [
                    'path' => $path,
                    'slot' => self::assetSlot($path),
                    'layer' => self::assetLayer($path),
                ];
            }

            if ($normalizedAssets) {
                $normalizedSelections[$tab] = [
                    'id' => $id,
                    'name' => self::cleanName(Arr::get($item, 'name', $id)),
                    'assets' => $normalizedAssets,
                    'preview' => is_string(Arr::get($item, 'preview')) && self::isSafeRelativePath(Arr::get($item, 'preview')) ? Arr::get($item, 'preview') : null,
                ];
            }
        }

        $normalizedColors = self::defaultDecoration()['colors'];

        foreach (self::ALLOWED_COLOR_KEYS as $key) {
            $color = self::normalizeColor($key, $colors[$key] ?? null);

            if ($color !== null) {
                $normalizedColors[$key] = $color;
            }
        }

        return [
            'version' => self::VERSION,
            'selections' => (object) $normalizedSelections,
            'colors' => $normalizedColors,
        ];
    }

    public function manifest(string $baseUrl): array
    {
        if (self::$manifest !== null) {
            return $this->withBaseUrl(self::$manifest, $baseUrl);
        }

        $tabs = [];

        foreach (self::TAB_ORDER as $tab) {
            $path = $this->assetsPath.'/'.$tab;

            if (! is_dir($path)) {
                continue;
            }

            $tabs[] = [
                'key' => $tab,
                'label' => $this->tabLabel($tab),
                'items' => $tab === 'Outfits' ? $this->scanOutfits($tab, $path) : $this->scanTab($tab, $path),
            ];
        }

        self::$manifest = [
            'version' => self::VERSION,
            'defaultAvatar' => [
                'path' => self::DEFAULT_FILE,
            ],
            'defaultLayers' => self::DEFAULT_LAYERS,
            'tabs' => $tabs,
            'colors' => [
                'body' => ['#ffffff', '#f5d0b8', '#d7a47f', '#9f6a4d', '#6b3f2a', '#3b2417'],
                'hair' => ['#111827', '#5b3a29', '#8b5a2b', '#d6a15d', '#d1d5db', '#ef4444', '#7c3aed', '#2563eb'],
                'eyes' => ['#111827', '#2563eb', '#059669', '#7c3aed', '#f97316', '#dc2626'],
                'background' => self::BACKGROUND_COLORS,
            ],
        ];

        return $this->withBaseUrl(self::$manifest, $baseUrl);
    }

    public function assetPath(string $relativePath): ?string
    {
        if (! self::isSafeRelativePath($relativePath)) {
            return null;
        }

        $path = realpath($this->assetsPath.'/'.$relativePath);
        $root = realpath($this->assetsPath);

        if (! $path || ! $root || ! str_starts_with($path, $root.DIRECTORY_SEPARATOR)) {
            return null;
        }

        if (! is_file($path)) {
            return null;
        }

        return $path;
    }

    public function assetVersion(): int
    {
        if (self::$assetVersion !== null) {
            return self::$assetVersion;
        }

        $version = self::VERSION;
        $root = realpath($this->assetsPath);

        if (! $root) {
            return self::$assetVersion = $version;
        }

        $files = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($root, \FilesystemIterator::SKIP_DOTS)
        );

        foreach ($files as $file) {
            if (! $file->isFile()) {
                continue;
            }

            $extension = strtolower($file->getExtension());

            if (! in_array($extension, ['svg', 'png', 'webp', 'jpg', 'jpeg'], true)) {
                continue;
            }

            $version = max($version, (int) $file->getMTime());
        }

        return self::$assetVersion = $version;
    }

    public static function isSafeRelativePath(string $path): bool
    {
        return $path !== ''
            && ! str_contains($path, "\0")
            && ! str_starts_with($path, '/')
            && ! preg_match('~(^|/)\.\.(/|$)~', $path);
    }

    public static function isHexColor(mixed $value): bool
    {
        return is_string($value) && (bool) preg_match('/^#[a-f0-9]{6}$/i', $value);
    }

    public static function normalizeColor(string $key, mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $value = trim($value);

        if (self::isHexColor($value)) {
            return strtolower($value);
        }

        if ($key === 'background' && in_array($value, self::BACKGROUND_COLORS, true)) {
            return $value;
        }

        return null;
    }

    public static function assetSlot(string $path): string
    {
        $basename = strtoupper(pathinfo($path, PATHINFO_FILENAME));

        return match (true) {
            str_contains($basename, 'ACCESSORY_BACK') => 'ACCESSORY_BACK',
            str_contains($basename, 'HAIR_BACK') => 'HAIR_BACK',
            str_contains($basename, 'FACE_LOWER') => 'FACE_LOWER',
            str_contains($basename, 'FACE_UPPER') => 'FACE_UPPER',
            str_contains($basename, 'BODY_BOTTOM') => 'BODY_BOTTOM',
            str_contains($basename, 'HEAD_ACCESSORY') => 'HEAD_ACCESSORY',
            str_contains($basename, 'HEAD') => 'HEAD',
            str_contains($basename, 'LEFT_HAND') => 'LEFT_HAND',
            str_contains($basename, 'RIGHT_HAND') => 'RIGHT_HAND',
            str_contains($basename, 'ACCESSORY') => 'ACCESSORY',
            str_contains($basename, 'HAIR') => 'HAIR',
            str_contains($basename, 'BODY') => 'BODY',
            default => 'DECORATION',
        };
    }

    public static function assetLayer(string $path): int
    {
        $slot = self::assetSlot($path);

        if (self::isRightHandPath($path) && in_array($slot, ['ACCESSORY_BACK', 'RIGHT_HAND'], true)) {
            return 85;
        }

        return match ($slot) {
            'ACCESSORY_BACK' => 10,
            'HAIR_BACK' => 20,
            'BODY_BOTTOM' => 30,
            'BODY' => 40,
            'LEFT_HAND' => 50,
            'RIGHT_HAND' => 60,
            'HEAD' => 65,
            'FACE_LOWER' => 70,
            'FACE_UPPER' => 80,
            'HAIR' => 90,
            'HEAD_ACCESSORY' => 100,
            'ACCESSORY' => 110,
            default => 120,
        };
    }

    private static function isRightHandPath(string $path): bool
    {
        $path = str_replace('\\', '/', $path);

        return (bool) preg_match('~(^|/)Right_Hand(/|$)~', $path);
    }

    private function scanTab(string $tab, string $path): array
    {
        $items = [];

        foreach ($this->sortedChildren($path) as $child) {
            if (is_dir($child)) {
                $assets = $this->assetFiles($child);

                if ($assets) {
                    $items[] = $this->makeItem($tab, $child, $assets);
                }

                continue;
            }

            if ($this->isAssetFile($child)) {
                $items[] = $this->makeItem($tab, $child, [$child]);
            }
        }

        return $items;
    }

    private function scanOutfits(string $tab, string $path): array
    {
        $sections = [];

        foreach ($this->sortedChildren($path) as $sectionPath) {
            if (! is_dir($sectionPath)) {
                continue;
            }

            $items = [];

            foreach ($this->sortedChildren($sectionPath) as $itemPath) {
                if (! is_dir($itemPath)) {
                    continue;
                }

                $assets = $this->assetFiles($itemPath);

                if ($assets) {
                    $items[] = $this->makeItem($tab, $itemPath, $assets);
                }
            }

            if ($items) {
                $sections[] = [
                    'key' => $this->relativePath($sectionPath),
                    'label' => self::cleanName(basename($sectionPath)),
                    'items' => $items,
                ];
            }
        }

        return $sections;
    }

    private function makeItem(string $tab, string $path, array $assets): array
    {
        $relative = $this->relativePath($path);
        $preview = null;

        if (is_dir($path)) {
            foreach (['preview.png', 'preview.svg', 'preview.webp', 'preview.jpg', 'preview.jpeg'] as $candidate) {
                if (is_file($path.'/'.$candidate)) {
                    $preview = $this->relativePath($path.'/'.$candidate);
                    break;
                }
            }
        }

        $assetRecords = array_map(fn (string $asset) => [
            'path' => $this->relativePath($asset),
            'slot' => self::assetSlot($asset),
            'layer' => self::assetLayer($asset),
        ], $assets);

        usort($assetRecords, fn (array $a, array $b) => [$a['layer'], $a['path']] <=> [$b['layer'], $b['path']]);

        return [
            'id' => $relative,
            'tab' => $tab,
            'name' => self::cleanName(pathinfo($path, PATHINFO_FILENAME)),
            'preview' => $preview,
            'assets' => $assetRecords,
            'slots' => array_values(array_unique(array_column($assetRecords, 'slot'))),
        ];
    }

    private function assetFiles(string $path): array
    {
        return array_values(array_filter($this->sortedChildren($path), fn (string $child) => $this->isAssetFile($child)));
    }

    private function sortedChildren(string $path): array
    {
        $children = array_values(array_filter(glob($path.'/*') ?: [], fn (string $child) => basename($child) !== '.DS_Store'));

        usort($children, fn (string $a, string $b) => strnatcasecmp(basename($a), basename($b)));

        return $children;
    }

    private function isAssetFile(string $path): bool
    {
        return is_file($path) && strtolower(pathinfo($path, PATHINFO_EXTENSION)) === 'svg';
    }

    private function relativePath(string $path): string
    {
        return ltrim(str_replace('\\', '/', substr($path, strlen($this->assetsPath))), '/');
    }

    private function withBaseUrl(array $manifest, string $baseUrl): array
    {
        $baseUrl = rtrim($baseUrl, '/');

        $addUrl = function (array &$item) use (&$addUrl, $baseUrl) {
            if (isset($item['path']) && is_string($item['path'])) {
                $item['url'] = $this->assetUrl($baseUrl, $item['path']);
            }

            if (isset($item['preview']) && is_string($item['preview'])) {
                $item['previewUrl'] = $this->assetUrl($baseUrl, $item['preview']);
            }

            if (isset($item['assets']) && is_array($item['assets'])) {
                foreach ($item['assets'] as &$asset) {
                    $addUrl($asset);
                }
            }

            if (isset($item['items']) && is_array($item['items'])) {
                foreach ($item['items'] as &$child) {
                    $addUrl($child);
                }
            }
        };

        $addUrl($manifest['defaultAvatar']);

        foreach ($manifest['defaultLayers'] as &$layer) {
            $addUrl($layer);
        }

        foreach ($manifest['tabs'] as &$tab) {
            foreach ($tab['items'] as &$item) {
                $addUrl($item);
            }
        }

        return $manifest;
    }

    private function assetUrl(string $baseUrl, string $path): string
    {
        $file = $this->assetPath($path);
        $version = $file ? (string) filemtime($file) : (string) self::VERSION;

        return $baseUrl.'/flarum-avatar/asset?path='.rawurlencode($path).'&v='.$version;
    }

    private function tabLabel(string $tab): string
    {
        return str_replace('_', ' ', $tab);
    }

    private static function cleanName(mixed $name): string
    {
        $name = preg_replace('/^\d+[_-]*/', '', (string) $name);
        $name = preg_replace('/\.(svg|png|webp|jpe?g)$/i', '', $name);
        $name = str_replace('_', ' ', $name);

        return trim($name) ?: 'Untitled';
    }
}
