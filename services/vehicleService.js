import { db } from "~/plugins/firebase";

export default {
  async create(vehicle) {
    console.log("vehicle", vehicle);
    return db.collection("vehicles").add({
      ...vehicle,
      is_deleted: false,
      created_at: new Date(),
    });
  },

  async update(id, data) {
    return db
      .collection("vehicles")
      .doc(id)
      .update({
        ...data,
        updated_at: new Date(),
      });
  },

    async softDelete(id) {
      return db.collection("vehicles").doc(id).update({
        is_deleted: true,
        deleted_at: new Date(),
      });
    },

  async listByUser(userId) {
    const snap = await db
      .collection("vehicles")
      .where("owner_id", "==", userId)
      .where("is_deleted", "==", false)
      .get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  async listByClient(userId) {
    return this.listByUser(userId);
  },
};
