export default {
  type: 'admin',
  routes: [
    {
      method: 'POST',
      path: '/last-opened/:uid/:documentId',
      handler: 'controller.lastOpened',
      config: {
        policies: [],
      },
    },
  ],
};
