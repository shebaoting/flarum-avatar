import app from 'flarum/forum/app';
import { override } from 'flarum/common/extend';
import Avatar from 'flarum/common/components/Avatar';
import Link from 'flarum/common/components/Link';
import Icon from 'flarum/common/components/Icon';
import classList from 'flarum/common/utils/classList';
import AvatarEditor from 'flarum/forum/components/AvatarEditor';
import AvatarCanvas from './components/AvatarCanvas';
import { decorationFromUser, hasDecoration } from './utils/avatarState';

export { default as extend } from './extend';

app.initializers.add('shebaoting-flarum-avatar', () => {
  override(AvatarEditor.prototype, 'view', function (original) {
    const user = this.attrs.user;
    const className = classList('AvatarEditor', 'AvatarDecorationAvatarEditor', this.attrs.className);

    if (!user) {
      return original();
    }

    if (user !== app.session.user) {
      return (
        <span className={className}>
          <Avatar user={user} loading="eager" />
        </span>
      );
    }

    const label = app.translator.trans('shebaoting-flarum-avatar.forum.nav.edit_avatar');

    return (
      <Link className={className} href={app.route('flarum-avatar.edit')} title={label} aria-label={label}>
        <Avatar user={user} loading="eager" />
        <span className="Dropdown-toggle AvatarDecorationAvatarEditor-toggle" aria-hidden="true">
          <Icon name="fas fa-user-astronaut" />
        </span>
      </Link>
    );
  });

  override(Avatar.prototype, 'view', function (original, vnode) {
    const content = original(vnode);
    const user = vnode.attrs.user;
    const decoration = decorationFromUser(user);

    if (!user || !hasDecoration(decoration) || vnode.attrs.decorationPreview === false) {
      return content;
    }

    const className = content?.attrs?.className || vnode.attrs.className || 'Avatar';
    const title = content?.attrs?.title || vnode.attrs.title || user.displayName();

    return (
      <span className={`${className} AvatarDecorationAvatar`} title={title} role="img" aria-label={title}>
        <AvatarCanvas decoration={decoration} defaultAvatar={{ path: 'reddit-default-avatar-white.svg' }} compact portrait showBackground />
      </span>
    );
  });
});
