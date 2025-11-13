import { auth, db } from '~/plugins/firebase'

export default {
  async login(email, password) {
    return auth.signInWithEmailAndPassword(email, password)
  },
  async logout() {
    return auth.signOut()
  },
  async register(email, password, profile) {
    const res = await auth.createUserWithEmailAndPassword(email, password)
    await db.collection('users').doc(res.user.uid).set({
      ...profile,
      role: profile.role || 'user',
      created_at: new Date()
    })
    return res
  },
    async recoverPassword(email) {
    return auth.sendPasswordResetEmail(email)
  }
}
