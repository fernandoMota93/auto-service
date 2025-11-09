import { auth, db } from '~/plugins/firebase'

export default ({ store }) => {
  return new Promise((resolve) => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        store.commit('user/SET_USER', { uid: user.uid, email: user.email })
        const doc = await db.collection('users').doc(user.uid).get()
        store.commit('user/SET_PROFILE', doc.exists ? doc.data() : null)
      } else {
        store.commit('user/SET_USER', null)
        store.commit('user/SET_PROFILE', null)
      }
      resolve()
    })
  })
}
