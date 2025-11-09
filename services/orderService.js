import { db } from "~/plugins/firebase";
import firebase from "firebase/compat/app";
import imageService from "~/services/imageService";

export default {
  async create(order) {
    const data = {
      ...order,
      images: [],
      status: order.status || "open",
      created_at: new Date(),
      updated_at: new Date(),
      is_deleted: false,
    };
    const ref = await db.collection("orders").add(data);
    return { id: ref.id, ...data };
  },

  async update(orderId, data) {
    data.updated_at = new Date();
    await db.collection("orders").doc(orderId).update(data);
    const doc = await db.collection("orders").doc(orderId).get();
    return { id: doc.id, ...doc.data() };
  },

  async softDelete(id) {
    await db.collection("orders").doc(id).update({
      deleted_at: firebase.firestore.FieldValue.serverTimestamp(),
      is_deleted: true,
    });
  },

  async uploadImage(orderId, file) {
    const url = await imageService.upload(file);
    await db
      .collection("orders")
      .doc(orderId)
      .update({
        images: firebase.firestore.FieldValue.arrayUnion(url),
      });
    return url;
  },

  async deleteImage(orderId, fileUrl) {
    try {
      // Primeiro remove a imagem do serviço de armazenamento
      // await imageService.delete(fileUrl)

      // Depois remove do array de imagens da OS no Firestore
      await db
        .collection("orders")
        .doc(orderId)
        .update({
          images: firebase.firestore.FieldValue.arrayRemove(fileUrl),
        });

      return true;
    } catch (err) {
      throw new Error(err.message || "Erro ao remover imagem");
    }
  },

  async listAll() {
    const snap = await db
      .collection("orders")
      .orderBy("created_at", "desc")
      .get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  async listByUser(userId) {
    const snap = await db
      .collection("orders")
      .where("client_id", "==", userId)
      .orderBy("created_at", "desc")
      .get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  async listPaginated(perPage, page, filters = {}) {
    if (!this._cursors) this._cursors = [];

    const { startDate, endDate, status } = filters;

    let query = db
      .collection("orders")
      .where("is_deleted", "==", false)
      .orderBy("created_at", "desc");

    // 🔹 Aplica o filtro de status, se existir
    if (status && status !== "all") {
      query = query.where("status", "==", status);
    }

    // 🔹 Aplica o intervalo de datas, se existir
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query = query
        .where("created_at", ">=", start)
        .where("created_at", "<=", end);
    }

    // 🔹 Paginação via startAfter
    query = query.limit(perPage);
    if (page > 1 && this._cursors[page - 2]) {
      query = query.startAfter(this._cursors[page - 2]);
    }

    const snap = await query.get();

    if (snap.docs.length > 0) {
      this._cursors[page - 1] = snap.docs[snap.docs.length - 1];
    }

    // 🔹 Total geral (sem paginação, mas respeitando filtros)
    let totalQuery = db.collection("orders").where("is_deleted", "==", false);
    if (status && status !== "all")
      totalQuery = totalQuery.where("status", "==", status);
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      totalQuery = totalQuery
        .where("created_at", ">=", start)
        .where("created_at", "<=", end);
    }
    const totalSnap = await totalQuery.get();

    return {
      data: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
      total: totalSnap.size,
    };
  },
};
