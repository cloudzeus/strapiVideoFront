'use strict';

const axios = require('axios');

module.exports = {
  async lookup(ctx) {
    try {
      const { vatNumber } = ctx.request.body;

      if (!vatNumber) {
        return ctx.badRequest('VAT number is required');
      }

      // Clean the VAT number
      const cleanVat = vatNumber.replace(/[^0-9]/g, '');

      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://vat.wwa.gr/afm2info',
        headers: { 
          'Content-Type': 'application/json'
        },
        data: JSON.stringify({
          afm: cleanVat
        })
      };

      const response = await axios.request(config);
      const data = response.data;

      if (!data.basic_rec) {
        return ctx.notFound('No VAT number matched');
      }

      // Map the response to our expected format
      const mappedData = {
        name: data.basic_rec.onomasia,
        address: `${data.basic_rec.postal_address} ${data.basic_rec.postal_address_no}`.trim(),
        zip: data.basic_rec.postal_zip_code,
        city: data.basic_rec.postal_area_description,
        vatNumber: data.basic_rec.afm,
        irsOffice: data.basic_rec.doy_descr
      };

      return mappedData;
    } catch (error) {
      console.error('VAT lookup error:', error.response?.data || error.message);
      ctx.throw(500, error.response?.data?.message || error.message);
    }
  },
}; 