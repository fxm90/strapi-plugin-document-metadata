import type { PolicyConfig } from '../policies/hasPermission';

const hasPermission = (config: PolicyConfig) => ({
  name: 'plugin::document-metadata.hasPermission',
  config,
});

export default {
  type: 'admin',
  routes: [
    {
      method: 'POST',
      path: '/last-opened/:uid/:documentId',
      handler: 'controller.lastOpened',
      config: {
        policies: [
          'admin::isAuthenticatedAdmin',
          hasPermission({
            // This endpoint returns metadata, but it also writes the new last-opened values.
            // Require update permission so read-only users cannot trigger a database write.
            actions: [
              'plugin::content-manager.explorer.read',
              'plugin::content-manager.explorer.update',
            ],
          }),
        ],
      },
    },
  ],
};
