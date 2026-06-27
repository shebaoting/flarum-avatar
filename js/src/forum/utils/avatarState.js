import app from 'flarum/forum/app';

export const TAB_ORDER = ['Outfits', 'Tops', 'Bottoms', 'Hair', 'Hats', 'Eyes', 'Face', 'Left_Hand', 'Right_Hand'];

export const DEFAULT_COLORS = {
  body: '#ffffff',
  hair: '#111827',
  eyes: '#111827',
  background: '#ffffff',
};

export const BACKGROUND_COLORS = [
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

const HEX_COLOR = /^#[a-f0-9]{6}$/i;

export const DEFAULT_LAYERS = [
  {
    path: 'reddit-default-avatar-white-layers/01_body_lower.svg',
    slot: 'DEFAULT_BODY_LOWER',
    layer: 25,
  },
  {
    path: 'reddit-default-avatar-white-layers/02_body_upper_arms.svg',
    slot: 'DEFAULT_BODY_UPPER',
    layer: 35,
  },
  {
    path: 'reddit-default-avatar-white-layers/03_head_and_antenna.svg',
    slot: 'DEFAULT_HEAD',
    layer: 65,
  },
  {
    path: 'reddit-default-avatar-white-layers/04_eyes.svg',
    slot: 'DEFAULT_EYES',
    layer: 75,
  },
];

export const REPLACEMENT_DEFAULT_SLOTS = {
  BODY_BOTTOM: ['DEFAULT_BODY_LOWER'],
  BODY: ['DEFAULT_BODY_UPPER'],
  FACE_UPPER: ['DEFAULT_EYES'],
  EYES: ['DEFAULT_EYES'],
  HEAD: ['DEFAULT_HEAD'],
};

export const FACE_TAB_REPLACEMENT_DEFAULT_SLOTS = ['DEFAULT_HEAD'];

export const OUTFIT_FACE_LOWER_REPLACEMENT_DEFAULT_SLOTS = ['DEFAULT_HEAD'];

export function emptyDecoration() {
  return {
    version: 1,
    selections: {},
    colors: { ...DEFAULT_COLORS },
  };
}

export function decorationFromUser(user) {
  const value = user && typeof user.avatarDecoration === 'function' ? user.avatarDecoration() : null;

  return normalizeDecoration(value);
}

export function normalizeDecoration(value) {
  const decoration = emptyDecoration();

  if (!value || typeof value !== 'object') {
    return decoration;
  }

  const selections = value.selections || {};

  TAB_ORDER.forEach((tab) => {
    if (selections[tab] && Array.isArray(selections[tab].assets)) {
      decoration.selections[tab] = compactItem(selections[tab]);
    }
  });

  Object.keys(DEFAULT_COLORS).forEach((key) => {
    const color = normalizeColor(key, value.colors?.[key]);

    if (color) {
      decoration.colors[key] = color;
    }
  });

  return decoration;
}

export function compactItem(item) {
  return {
    id: item.id,
    name: item.name || item.id,
    preview: item.preview || null,
    previewUrl: item.previewUrl || null,
    assets: (item.assets || []).map((asset) => ({
      path: asset.path,
      slot: asset.slot || 'DECORATION',
      layer: assetLayer(asset),
      url: asset.url,
    })),
  };
}

export function selectionCount(decoration) {
  const normalized = normalizeDecoration(decoration);
  const colorChanges = Object.keys(DEFAULT_COLORS).filter((key) => normalized.colors?.[key] !== DEFAULT_COLORS[key]).length;

  return Object.keys(normalized.selections || {}).length + colorChanges;
}

export function hasDecoration(decoration) {
  return selectionCount(decoration) > 0;
}

export function setSelection(decoration, tab, item) {
  const next = normalizeDecoration(decoration);

  if (!item) {
    delete next.selections[tab];
    return next;
  }

  next.selections[tab] = compactItem(item);

  return next;
}

export function setColor(decoration, key, color) {
  const next = normalizeDecoration(decoration);
  const normalized = normalizeColor(key, color);

  if (normalized) {
    next.colors[key] = normalized;
  }

  return next;
}

export function isSelected(decoration, tab, item) {
  return decoration?.selections?.[tab]?.id === item?.id;
}

function normalizeColor(key, value) {
  if (typeof value !== 'string') {
    return null;
  }

  const color = value.trim();

  if (HEX_COLOR.test(color)) {
    return color.toLowerCase();
  }

  if (key === 'background' && BACKGROUND_COLORS.includes(color)) {
    return color;
  }

  return null;
}

export function assetUrl(asset, colors = DEFAULT_COLORS) {
  const source = asset?.url || (asset?.path ? assetBaseUrl(asset.path) : '');

  if (!source) {
    return '';
  }

  const url = new URL(source, window.location.origin);
  const path = asset?.path || url.searchParams.get('path') || source;

  if (!/\.svg$/i.test(path)) {
    return url.pathname + url.search;
  }

  ['body', 'hair', 'eyes'].forEach((key) => {
    if (colors[key]) {
      url.searchParams.set(key, colors[key]);
    }
  });

  return url.pathname + url.search;
}

function assetBaseUrl(path) {
  const version = app.forum.attribute('avatarDecorationAssetVersion');
  const query = new URLSearchParams({ path });

  if (version) {
    query.set('v', version);
  }

  return `${app.forum.attribute('baseUrl').replace(/\/$/, '')}/flarum-avatar/asset?${query.toString()}`;
}

export function itemPreviewUrl(item, colors = DEFAULT_COLORS) {
  if (item?.previewUrl || item?.preview) {
    return assetUrl({ path: item.preview, url: item.previewUrl }, colors);
  }

  const first = firstAsset(item);

  return first ? assetUrl(first, colors) : '';
}

export function defaultLayers(manifest = {}) {
  const layers = Array.isArray(manifest.defaultLayers) && manifest.defaultLayers.length ? manifest.defaultLayers : DEFAULT_LAYERS;

  return sortLayers(layers.map((asset) => ({
    path: asset.path,
    slot: asset.slot || 'DEFAULT',
    layer: assetLayer(asset, 0),
    url: asset.url,
  })));
}

export function firstAsset(item) {
  return item?.assets?.slice().sort((a, b) => Number(a.layer || 0) - Number(b.layer || 0))[0] || null;
}

export function renderLayers(decoration) {
  const normalized = normalizeDecoration(decoration);
  const layersBySlot = {};
  const outfit = normalized.selections.Outfits;

  if (outfit) {
    addItemLayers(layersBySlot, outfit);
  }

  TAB_ORDER.filter((tab) => tab !== 'Outfits').forEach((tab) => {
    const item = normalized.selections[tab];

    if (item) {
      addItemLayers(layersBySlot, item);
    }
  });

  return sortLayers(Object.values(layersBySlot));
}

function addItemLayers(layersBySlot, item) {
  (item.assets || []).forEach((asset) => {
    const key = asset.slot === 'DECORATION' ? asset.path : asset.slot;
    layersBySlot[key] = asset;
  });
}

export function replacementDefaultSlots(layers) {
  return new Set(
    (layers || []).flatMap((asset) => {
      const slot = asset?.slot || 'DECORATION';

      if (asset?.path?.startsWith('Face/') && (slot === 'FACE_LOWER' || slot === 'FACE_UPPER')) {
        return FACE_TAB_REPLACEMENT_DEFAULT_SLOTS;
      }

      if (asset?.path?.startsWith('Outfits/') && slot === 'FACE_LOWER') {
        return OUTFIT_FACE_LOWER_REPLACEMENT_DEFAULT_SLOTS;
      }

      return REPLACEMENT_DEFAULT_SLOTS[slot] || [];
    })
  );
}

export function composeAvatarLayers(decoration, manifest = {}) {
  const decorationLayers = renderLayers(decoration);
  const replacedDefaultSlots = replacementDefaultSlots(decorationLayers);
  const baseLayers = defaultLayers(manifest).filter((asset) => !replacedDefaultSlots.has(asset.slot));

  return {
    baseLayers,
    decorationLayers,
    layers: sortLayers([...baseLayers, ...decorationLayers]),
  };
}

function sortLayers(layers) {
  return layers.slice().sort((a, b) => {
    const layerDiff = assetLayer(a, 0) - assetLayer(b, 0);

    if (layerDiff !== 0) {
      return layerDiff;
    }

    return String(a.path || '').localeCompare(String(b.path || ''));
  });
}

function assetLayer(asset, fallback = 120) {
  const slot = asset?.slot || 'DECORATION';
  const path = asset?.path || '';

  if (path.startsWith('Right_Hand/') && (slot === 'ACCESSORY_BACK' || slot === 'RIGHT_HAND')) {
    return 85;
  }

  return Number(asset?.layer ?? fallback);
}

export function flattenOutfitSections(tab) {
  return (tab?.items || []).flatMap((section) => section.items || []);
}

export function tabLabel(key) {
  return key.replace(/_/g, ' ');
}
