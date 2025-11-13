import { db, secondaryAuth } from '~/plugins/firebase';
import firebase from 'firebase/compat/app';

export default {
  async getAll() {
    const snap = await db.collection('users').get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  async create(client) {
    const password = '123456';

    const userCredential = await secondaryAuth.createUserWithEmailAndPassword(
      client.email,
      password
    );

    const { user } = userCredential;

    const userData = {
      uid: user.uid,
      email: client.email,
      name: client.name,
      role: 'user',
      active: true,
      created_at: new Date(),
      is_deleted: false,
    };

    await db.collection('users').doc(user.uid).set(userData);

    await secondaryAuth.signOut();

    return userData;
  },

  async update(id, data) {
    await db.collection('users').doc(id).update(data);
  },

  async remove(client) {
    await db.collection('users').doc(client.uid).update({
      deleted_at: firebase.firestore.FieldValue.serverTimestamp(),
      is_deleted: true,
    });
  },
};
