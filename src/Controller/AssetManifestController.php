<?php

namespace Shebaoting\FlarumAvatar\Controller;

use Flarum\Http\UrlGenerator;
use Laminas\Diactoros\Response\JsonResponse;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Shebaoting\FlarumAvatar\Support\AvatarAssetRepository;

class AssetManifestController implements RequestHandlerInterface
{
    public function __construct(
        private readonly AvatarAssetRepository $assets,
        private readonly UrlGenerator $url,
    ) {
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        return new JsonResponse([
            'data' => [
                'type' => 'flarum-avatar-assets',
                'id' => 'manifest',
                'attributes' => $this->assets->manifest($this->url->to('forum')->base()),
            ],
        ]);
    }
}
