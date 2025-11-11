import { db } from '~/plugins/firebase';

export default {
  async create(vehicle) {
    console.log('vehicle', vehicle);
    return db.collection('vehicles').add({
      ...vehicle,
      created_at: new Date(),
    });
  },

  async listByUser(userId) {
    const snap = await db
      .collection('vehicles')
      .where('owner_id', '==', userId)
      .get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  async listByClient(userId) {
    return this.listByUser(userId);
  },
};
