import app from 'flarum/forum/app';
import Page from 'flarum/common/components/Page';
import Button from 'flarum/common/components/Button';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import LinkButton from 'flarum/common/components/LinkButton';
import classList from 'flarum/common/utils/classList';
import AvatarCanvas from './AvatarCanvas';
import OutfitPreviewModal from './OutfitPreviewModal';
import {
  BACKGROUND_COLORS,
  decorationFromUser,
  emptyDecoration,
  flattenOutfitSections,
  isSelected,
  itemPreviewUrl,
  normalizeDecoration,
  selectionCount,
  setColor,
  setSelection,
  TAB_ORDER,
} from '../utils/avatarState';

export default class AvatarEditorPage extends Page {
  oninit(vnode) {
    super.oninit(vnode);

    this.bodyClass = 'App--avatarDecorationEditor';
    this.loading = true;
    this.saving = false;
    this.manifest = null;
    this.activeTab = 'Outfits';
    this.decoration = app.session.user ? decorationFromUser(app.session.user) : emptyDecoration();

    this.loadManifest();
  }

  oncreate(vnode) {
    super.oncreate(vnode);

    app.setTitle(app.translator.trans('shebaoting-flarum-avatar.forum.editor.title'));
    app.setTitleCount(0);
  }

  view() {
    if (!app.session.user) {
      return (
        <div className="AvatarDecorationPage">
          <div className="container">
            <div className="AvatarDecorationSignedOut">
              <h2>{app.translator.trans('shebaoting-flarum-avatar.forum.editor.sign_in_title')}</h2>
              <Button className="Button Button--primary" icon="fas fa-sign-in-alt" onclick={() => app.modal.show(() => import('flarum/forum/components/LogInModal'))}>
                {app.translator.trans('core.forum.header.log_in_link')}
              </Button>
            </div>
          </div>
        </div>
      );
    }

    if (this.loading || !this.manifest) {
      return (
        <div className="AvatarDecorationPage">
          <LoadingIndicator display="block" />
        </div>
      );
    }

    const active = this.activeTabData();

    return (
      <div className="AvatarDecorationPage">
        <div className="container AvatarDecorationContainer">
          <div className="AvatarDecorationShell">
            <aside className="AvatarDecorationPreviewPane">
              <div className="AvatarDecorationPreviewSticky">
                <div className="AvatarDecorationPreviewHeader">
                  <LinkButton
                    className="Button Button--icon"
                    icon="fas fa-arrow-left"
                    href={app.route.user(app.session.user)}
                    aria-label={app.translator.trans('shebaoting-flarum-avatar.forum.editor.back')}
                    title={app.translator.trans('shebaoting-flarum-avatar.forum.editor.back')}
                  />
                  <h1>{app.translator.trans('shebaoting-flarum-avatar.forum.editor.title')}</h1>
                </div>

                <AvatarCanvas manifest={this.manifest} decoration={this.decoration} />

                <div className="AvatarDecorationColorPanel">
                  {['body', 'hair', 'eyes', 'background'].map((key) => this.colorRow(key))}
                </div>

                <div className="AvatarDecorationActions">
                  <Button className="Button Button--primary" icon="fas fa-save" loading={this.saving} onclick={() => this.save()}>
                    {app.translator.trans('shebaoting-flarum-avatar.forum.editor.save')}
                  </Button>
                  <Button className="Button" icon="fas fa-undo" disabled={selectionCount(this.decoration) === 0} onclick={() => this.reset()}>
                    {app.translator.trans('shebaoting-flarum-avatar.forum.editor.reset')}
                  </Button>
                </div>
              </div>
            </aside>

            <main className="AvatarDecorationWardrobe">
              <div className="AvatarDecorationTabs" role="tablist">{this.manifest.tabs.map((tab) => this.tabButton(tab))}</div>

              <div className="AvatarDecorationWardrobeHeader">
                <h2>{this.tabLabel(active)}</h2>
                <Button
                  className="Button Button--flat"
                  icon="fas fa-times"
                  disabled={!this.decoration.selections[this.activeTab]}
                  onclick={() => this.clearActiveTab()}
                >
                  {app.translator.trans('shebaoting-flarum-avatar.forum.editor.clear')}
                </Button>
              </div>

              {this.activeTab === 'Outfits' ? this.outfitSections(active) : this.itemGrid(active.items || [])}
            </main>
          </div>
        </div>
      </div>
    );
  }

  colorRow(key) {
    const colors = this.manifest.colors?.[key] || (key === 'background' ? BACKGROUND_COLORS : []);

    return (
      <div className={classList('AvatarDecorationColorRow', key === 'background' && 'AvatarDecorationColorRow--background')} key={key}>
        <span>{app.translator.trans(`shebaoting-flarum-avatar.forum.editor.colors.${key}`)}</span>
        <div className="AvatarDecorationSwatches">
          {colors.map((color) => (
            <button
              type="button"
              className={classList('AvatarDecorationSwatch', this.decoration.colors?.[key] === color && 'is-active')}
              style={{ background: color }}
              title={color}
              aria-label={color}
              onclick={() => {
                this.decoration = setColor(this.decoration, key, color);
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  tabButton(tab) {
    return (
      <button
        type="button"
        className={classList('AvatarDecorationTab', this.activeTab === tab.key && 'is-active')}
        role="tab"
        aria-selected={this.activeTab === tab.key ? 'true' : 'false'}
        onclick={() => {
          this.activeTab = tab.key;
        }}
      >
        {this.tabLabel(tab)}
      </button>
    );
  }

  tabLabel(tab) {
    return app.translator.trans(`shebaoting-flarum-avatar.forum.editor.tabs.${tab.key}`);
  }

  outfitSections(tab) {
    return (
      <div className="AvatarDecorationOutfitSections">
        {(tab.items || []).map((section) => (
          <section className="AvatarDecorationOutfitSection" key={section.key}>
            <h3>{section.label}</h3>
            {this.itemGrid(section.items || [], true)}
          </section>
        ))}
      </div>
    );
  }

  itemGrid(items, outfit = false) {
    const tab = this.activeTab;

    return (
      <div className={classList('AvatarDecorationGrid', !outfit && 'AvatarDecorationGrid--compact')}>
        {items.map((item) => (
            <button
              type="button"
              className={classList('AvatarDecorationItemCard', isSelected(this.decoration, tab, item) && 'is-selected')}
              onclick={() => (outfit ? this.previewOutfit(item) : this.selectItem(tab, item))}
              aria-label={item.name}
              aria-pressed={isSelected(this.decoration, tab, item) ? 'true' : 'false'}
              key={item.id}
            >
              <span className="AvatarDecorationItemPreview">{this.itemPreview(item, outfit)}</span>
            </button>
          ))}
        </div>
    );
  }

  itemPreview(item, outfit) {
    if (outfit) {
      const src = itemPreviewUrl(item, this.decoration.colors);

      if (src) {
        return <img src={src} alt="" loading="lazy" />;
      }

      const previewDecoration = this.previewDecoration('Outfits', item);

      return <AvatarCanvas manifest={this.manifest} decoration={previewDecoration} compact />;
    }

    const previewDecoration = this.previewDecoration(this.activeTab, item);

    return <AvatarCanvas manifest={this.manifest} decoration={previewDecoration} compact />;
  }

  previewDecoration(tab, item) {
    const decoration = emptyDecoration();

    decoration.colors = {
      ...decoration.colors,
      ...(this.decoration.colors || {}),
    };

    return setSelection(decoration, tab, item);
  }

  activeTabData() {
    return this.manifest.tabs.find((tab) => tab.key === this.activeTab) || this.manifest.tabs[0];
  }

  selectItem(tab, item) {
    this.decoration = setSelection(this.decoration, tab, isSelected(this.decoration, tab, item) ? null : item);
  }

  previewOutfit(item) {
    app.modal.show(OutfitPreviewModal, {
      item,
      manifest: this.manifest,
      decoration: this.decoration,
      onselect: (selected) => {
        this.decoration = setSelection(this.decoration, 'Outfits', selected);
        m.redraw();
      },
    });
  }

  clearActiveTab() {
    this.decoration = setSelection(this.decoration, this.activeTab, null);
  }

  reset() {
    this.decoration = emptyDecoration();
  }

  save() {
    if (this.saving || !app.session.user) return;

    this.saving = true;

    app.session.user
      .save({ avatarDecoration: normalizeDecoration(this.decoration) })
      .then((user) => {
        this.decoration = decorationFromUser(user);
        app.alerts.show({ type: 'success' }, app.translator.trans('shebaoting-flarum-avatar.forum.editor.saved'));
      })
      .catch((error) => {
        app.alerts.show(error.alert || { type: 'error' }, app.translator.trans('shebaoting-flarum-avatar.forum.editor.save_error'));
      })
      .finally(() => {
        this.saving = false;
        m.redraw();
      });
  }

  loadManifest() {
    this.loading = true;

    return app
      .request({
        method: 'GET',
        url: `${app.forum.attribute('apiUrl')}/flarum-avatar/assets`,
      })
      .then((payload) => {
        this.manifest = payload.data.attributes;

        if (!this.manifest.tabs.find((tab) => tab.key === this.activeTab)) {
          this.activeTab = this.manifest.tabs[0]?.key || TAB_ORDER[0];
        }
      })
      .catch(() => {
        app.alerts.show({ type: 'error' }, app.translator.trans('shebaoting-flarum-avatar.forum.editor.load_error'));
      })
      .finally(() => {
        this.loading = false;
        m.redraw();
      });
  }
}
