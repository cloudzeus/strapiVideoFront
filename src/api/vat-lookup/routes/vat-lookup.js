'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/vat-lookup',
      handler: 'vat-lookup.lookup',
      config: {
        policies: [],
        auth: false,
        prefix: false,
      },
    },
  ],
}; 