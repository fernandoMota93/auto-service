import { db, secondaryAuth } from "~/plugins/firebase";
import firebase from "firebase/compat/app";

export default {
  async getAll() {
    const snap = await db.collection("users").get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  async create(client) {
    const password = "123456";

    const userCredential = await secondaryAuth.createUserWithEmailAndPassword(
      client.email,
      password
    );

    const { user } = userCredential;

    const userData = {
      uid: user.uid,
      email: client.email,
      name: client.name,
      role: "user",
      active: true,
      created_at: new Date(),
      is_deleted: false,
      phone: client.phone
    };

    await db.collection("users").doc(user.uid).set(userData);

    await secondaryAuth.signOut();

    return userData;
  },

  async update(id, data) {
    await db.collection("users").doc(id).update(data);
  },

  async remove(client) {
    await db.collection("users").doc(client.uid).update({
      deleted_at: firebase.firestore.FieldValue.serverTimestamp(),
      is_deleted: true,
    });
  },

  async searchByName(name) {
    const snap = await db
      .collection("users")
      .where("name", ">=", name)
      .where("name", "<=", name + "\uf8ff")
      .get();

    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  async listPaginated(perPage, page, search) {


    if (!this._cursors) this._cursors = [];

    let query = db
      .collection("users")
      .where("is_deleted", "==", false)
      .orderBy("name", "asc");

    // 🔍 Se estiver pesquisando
    if (search.length >= 3) {
      const key = search
      query = query
        .where("name", ">=", key)
        .where("name", "<=", key + "\uf8ff");
    }

    query = query.limit(perPage);

    // 🔹 Paginação via startAfter
    if (page > 1 && this._cursors[page - 2]) {
      query = query.startAfter(this._cursors[page - 2]);
    }

    const snap = await query.get();

    if (snap.docs.length > 0) {
      this._cursors[page - 1] = snap.docs[snap.docs.length - 1];
    }

    // 🔹 Total com filtros
    let totalQuery = db.collection("users").where("is_deleted", "==", false);

    if (search.length >= 3) {
      const key = search.toLowerCase();
      totalQuery = totalQuery
        .where("name", ">=", key)
        .where("name", "<=", key + "\uf8ff");
    }

    const totalSnap = await totalQuery.get();

    return {
      data: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
      total: totalSnap.size,
    };
  },
};
