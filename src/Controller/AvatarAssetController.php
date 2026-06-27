<?php

namespace Shebaoting\FlarumAvatar\Controller;

use Laminas\Diactoros\Response;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Shebaoting\FlarumAvatar\Support\AvatarAssetRepository;

class AvatarAssetController implements RequestHandlerInterface
{
    public function __construct(
        private readonly AvatarAssetRepository $assets,
    ) {
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $query = $request->getQueryParams();
        $params = $request->getAttribute('routeParameters') ?: [];
        $path = (string) ($query['path'] ?? ($params['path'] ?? ''));
        $path = rawurldecode($path);
        $file = $this->assets->assetPath($path);

        if (! $file) {
            return new Response('php://memory', 404);
        }

        $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));
        $body = file_get_contents($file);

        if ($body === false) {
            return new Response('php://memory', 404);
        }

        if ($extension === 'svg') {
            $body = $this->recolorSvg($body, $query);
        }

        $response = new Response('php://temp', 200, [
            'Content-Type' => $this->mimeType($extension),
            'Cache-Control' => 'public, max-age=31536000, immutable',
            'X-Content-Type-Options' => 'nosniff',
        ]);

        $response->getBody()->write($body);
        $response->getBody()->rewind();

        return $response;
    }

    private function recolorSvg(string $svg, array $query): string
    {
        $colors = [
            'color-body' => $this->sanitizeColor($query['body'] ?? null),
            'color-hair' => $this->sanitizeColor($query['hair'] ?? null),
            'color-eyes' => $this->sanitizeColor($query['eyes'] ?? null),
        ];

        foreach ($colors as $class => $color) {
            if (! $color) {
                continue;
            }

            $svg = preg_replace_callback(
                '/<([a-zA-Z][a-zA-Z0-9:-]*)([^>]*\bclass="[^"]*\b'.preg_quote($class, '/').'\b[^"]*"[^>]*)>/',
                fn (array $matches) => $this->applyInlineFill($matches[1], $matches[2], $color),
                $svg
            ) ?? $svg;
        }

        return $svg;
    }

    private function applyInlineFill(string $tag, string $attributes, string $color): string
    {
        $selfClosing = (bool) preg_match('/\s*\/\s*$/', $attributes);

        if ($selfClosing) {
            $attributes = preg_replace('/\s*\/\s*$/', '', $attributes) ?? $attributes;
        }

        if (preg_match('/\sstyle="([^"]*)"/', $attributes, $styleMatch)) {
            $style = preg_replace('/(?:^|;)\s*fill\s*:\s*[^;"]*/i', '', $styleMatch[1]);
            $style = trim((string) $style, " ;");
            $style = ($style ? $style.';' : '').'fill:'.$color;

            $attributes = preg_replace('/\sstyle="[^"]*"/', ' style="'.$style.'"', $attributes, 1);
        } else {
            $attributes .= ' style="fill:'.$color.'"';
        }

        return '<'.$tag.$attributes.($selfClosing ? ' />' : '>');
    }

    private function sanitizeColor(mixed $value): ?string
    {
        return AvatarAssetRepository::isHexColor($value) ? strtolower((string) $value) : null;
    }

    private function mimeType(string $extension): string
    {
        return match ($extension) {
            'svg' => 'image/svg+xml; charset=utf-8',
            'png' => 'image/png',
            'webp' => 'image/webp',
            'jpg', 'jpeg' => 'image/jpeg',
            default => 'application/octet-stream',
        };
    }
}
