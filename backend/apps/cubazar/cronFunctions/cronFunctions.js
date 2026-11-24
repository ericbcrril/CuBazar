const { parseDateOnly, saveLogToDB, genRandomNumber, printf } = require("../../../functions");

async function validateMemberships(membershipModel) {

  const currentExecution = genRandomNumber(8);

  if (!membershipModel || typeof membershipModel.find !== 'function') {
    console.warn('No se recibió un modelo válido para el cron de membresías.');
    saveLogToDB({ message: `${currentExecution} No se recibió un modelo válido para el cron de membresías. `, level: "warn", client: "vps" }, "server");
    return;
  }

  console.log('╔═════════════════════════════════════════════════════════════════════╗');
  console.log('║  Ejecutando verificación de vencimiento de membresías BSites...     ║');
  console.log('╚═════════════════════════════════════════════════════════════════════╝');

  if (membershipModel.db?.readyState !== 1) {
    console.log('La conexión a MongoDB no está lista para consultar membresías.');
    saveLogToDB({ message: `${currentExecution} La conexión a MongoDB no está lista para consultar membresías.`, level: "log", client: "vps" }, "server");
    return;
  }

  try {
    const memberships = await membershipModel.find({}).lean().maxTimeMS(8000);
    const membershipDocs = Array.isArray(memberships) ? memberships : [];

    if (membershipDocs.length === 0) {
      console.log('No se encontraron membresías en la base de datos.');
      saveLogToDB({ message: `${currentExecution} No se encontraron membresías en la base de datos.`, level: "log", client: "vps" }, "server");
      return;
    }

    console.log('Membresías BSites:', membershipDocs.length);

    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    for (const membership of membershipDocs) {
      const renewalDate = parseDateOnly(membership?.details?.renewal_date);
      if (!renewalDate) continue;

      const isExpired = renewalDate < todayDate;
      const nextStatus = isExpired ? 'expired' : 'active';

      console.log('═══════════════════════════════════════════════════════════════════════');
      console.log(`ID: ${membership?._id} User ID: ${membership?.user_id}`);
      if (membership?.details?.status != nextStatus) {
        console.log(`${membership?.name}: ${membership?.details?.status} -> ${nextStatus} (${membership?.details?.renewal_date})`);
      } else {
        console.log(`${membership?.name}: ${membership?.details?.status}`);
      }
      console.log('═══════════════════════════════════════════════════════════════════════');

      if (membership?.details?.status !== nextStatus || membership?.metadata?.status !== nextStatus) {
        await membershipModel.findByIdAndUpdate(membership._id, {
          $set: {
            'details.status': nextStatus,
            'metadata.status': nextStatus,
            'metadata.last_updated': new Date(),
          },
        });
      }
    }
  } catch (error) {
    console.error('Error verificando vencimiento de membresías:', error.message);
    saveLogToDB({ message: `${currentExecution} Error verificando vencimiento de membresías.`, level: "error", client: "vps" }, "server");
  }
}

module.exports = {
  validateMemberships,
};