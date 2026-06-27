import ExtensionPage from 'flarum/admin/components/ExtensionPage';

export default class AvatarDecorationSettingsPage extends ExtensionPage {
  content() {
    return (
      <div className="ExtensionPage-settings AvatarDecorationAdminPage">
        <div className="container">
          <section className="AvatarDecorationAdminPanel">
            <h2>{app.translator.trans('shebaoting-avatar.admin.title')}</h2>
            <p>{app.translator.trans('shebaoting-avatar.admin.description')}</p>
            <code>packages/flarum-avatar/assets/avatars</code>
          </section>
        </div>
      </div>
    );
  }
}
