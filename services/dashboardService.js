import { db } from "~/plugins/firebase";

export default {
    async listAll() {
    const snap = await db
      .collection("orders")
      .orderBy("created_at", "desc")
      .limit(1000)
      .get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

};
