export default {
  type: 'admin',
  routes: [
    {
      method: 'GET',
      path: '/last-opened/:uid/:documentId',
      handler: 'controller.lastOpened',
      config: {
        policies: [],
      },
    },
  ],
};
