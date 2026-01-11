import { PLUGIN_ID } from './pluginId';
import { Initializer } from './components/Initializer';
import DocumentMetadataGuard from './components/DocumentMetadataGuard';

/**
 * The view of the injection zone.
 *
 * - See also: https://docs.strapi.io/cms/plugins-development/admin-panel-api#using-predefined-injection-zones
 */
const enum InjectionZoneView {
  editView = 'editView',
  listView = 'listView',
}

/**
 * The location of the injection zone.
 *
 * - Note: We're only using `editView` and therefore only specify the corresponding locations below.
 */
const enum InjectionZoneLocation {
  /** Sits at the top right of the edit view. */
  informations = 'informations',
  /** Sits between "Configure the view" and "Edit" buttons. */
  rightLinks = 'right-links',
}

export default {
  register(app: any) {
    app
      .getPlugin('content-manager')
      .injectComponent(InjectionZoneView.editView, InjectionZoneLocation.rightLinks, {
        name: 'DocumentMetadataGuard',
        Component: DocumentMetadataGuard,
      });

    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer,
      isReady: false,
      name: PLUGIN_ID,
    });
  },

  async registerTrads({ locales }: { locales: string[] }) {
    return Promise.all(
      locales.map(async (locale) => {
        try {
          const { default: data } = await import(`./translations/${locale}.json`);

          return { data, locale };
        } catch {
          return { data: {}, locale };
        }
      })
    );
  },
};
