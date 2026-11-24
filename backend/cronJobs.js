const cron = require('node-cron');
const bsitesValidateMemberships = require('./apps/bsites/cronFunctions/cronFunctions').validateMemberships;
const { saveLogToDB } = require('./functions');

/*

Cada minuto: * * * * *.

Cada hora: 0 * * * *.

Cada día a medianoche: 0 0 * * *.

Cada mes (día 1 a las 00:00): 0 0 1 * *.

Cada lunes a las 9 AM: 0 9 * * 1.

*/

const initCronJobs = (membershipModel) => {
  if (!membershipModel || typeof membershipModel.find !== 'function') {
    console.warn('No se recibió un modelo válido para inicializar el cron de membresías.');
    saveLogToDB({ message: 'No se recibió un modelo válido para inicializar el cron de membresías.', level: 'warn', client: 'vps' }, 'server');
    return;
  }

  cron.schedule('0 0 1 * *', async () => {
    await bsitesValidateMemberships(membershipModel);
  });
};

module.exports = initCronJobs;