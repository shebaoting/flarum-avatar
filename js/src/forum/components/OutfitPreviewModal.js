import Modal from 'flarum/common/components/Modal';
import Button from 'flarum/common/components/Button';
import classList from 'flarum/common/utils/classList';
import AvatarCanvas from './AvatarCanvas';
import { compactItem, emptyDecoration, setSelection } from '../utils/avatarState';

export default class OutfitPreviewModal extends Modal {
  oninit(vnode) {
    super.oninit(vnode);

    this.selectedPaths = new Set((this.attrs.item.assets || []).map((asset) => asset.path));
  }

  className() {
    return 'AvatarDecorationOutfitModal Modal--medium';
  }

  title() {
    return '';
  }

  content() {
    const item = this.attrs.item;
    const selectedItem = this.selectedItem();
    const previewDecoration = selectedItem.assets.length
      ? setSelection(this.attrs.decoration, 'Outfits', selectedItem)
      : setSelection(this.attrs.decoration, 'Outfits', null);

    return (
      <div className="Modal-body">
        <div className="AvatarDecorationOutfitModal-body">
          <AvatarCanvas manifest={this.attrs.manifest} decoration={previewDecoration} />

          <div className="AvatarDecorationOutfitModal-parts">
            {(item.assets || []).map((asset) => (
              <button
                type="button"
                className={classList('AvatarDecorationPart', this.selectedPaths.has(asset.path) && 'is-active')}
                aria-label={asset.slot.replace(/_/g, ' ')}
                aria-pressed={this.selectedPaths.has(asset.path) ? 'true' : 'false'}
                onclick={() => this.toggleAsset(asset)}
                key={asset.path}
              >
                <span className="AvatarDecorationPart-thumb">
                  <AvatarCanvas manifest={this.attrs.manifest} decoration={this.partDecoration(asset)} compact />
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="AvatarDecorationOutfitModal-actions">
          <Button className="Button" onclick={() => this.hide()}>
            {app.translator.trans('shebaoting-avatar.forum.editor.cancel')}
          </Button>
          <Button
            className="Button Button--primary"
            icon="fas fa-check"
            onclick={() => {
              this.attrs.onselect(selectedItem.assets.length ? compactItem(selectedItem) : null);
              this.hide();
            }}
          >
            {app.translator.trans('shebaoting-avatar.forum.editor.apply')}
          </Button>
        </div>
      </div>
    );
  }

  selectedItem() {
    return {
      ...this.attrs.item,
      preview: null,
      previewUrl: null,
      assets: (this.attrs.item.assets || []).filter((asset) => this.selectedPaths.has(asset.path)),
    };
  }

  partDecoration(asset) {
    const decoration = emptyDecoration();

    decoration.colors = {
      ...decoration.colors,
      ...(this.attrs.decoration?.colors || {}),
    };

    return setSelection(decoration, 'Outfits', {
      ...this.attrs.item,
      id: `${this.attrs.item.id}:${asset.path}`,
      preview: null,
      previewUrl: null,
      assets: [asset],
    });
  }

  toggleAsset(asset) {
    if (this.selectedPaths.has(asset.path)) {
      this.selectedPaths.delete(asset.path);
    } else {
      this.selectedPaths.add(asset.path);
    }

    m.redraw();
  }
}
