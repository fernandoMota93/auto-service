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
    await  db.collection("orders").doc(id).update({
      deleted_at: firebase.firestore.FieldValue.serverTimestamp()
    })
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
      await db.collection('orders').doc(orderId).update({
        images: firebase.firestore.FieldValue.arrayRemove(fileUrl)
      })

      return true
    } catch (err) {
      throw new Error(err.message || 'Erro ao remover imagem')
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
};
