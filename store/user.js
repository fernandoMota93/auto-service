export const state = () => ({
  currentUser: null,
  profile: null
})

export const mutations = {
  SET_USER(state, user) { state.currentUser = user },
  SET_PROFILE(state, profile) { state.profile = profile }
}

export const actions = {
  async login({ commit }, { email, password }) {
    const { auth, db } = await import('~/plugins/firebase')
    const res = await auth.signInWithEmailAndPassword(email, password)
    commit('SET_USER', { uid: res.user.uid, email: res.user.email })
    const doc = await db.collection('users').doc(res.user.uid).get()
    commit('SET_PROFILE', doc.exists ? doc.data() : null)
  },

  async logout({ commit }) {
    const { auth } = await import('~/plugins/firebase')
    await auth.signOut()
    commit('SET_USER', null)
    commit('SET_PROFILE', null)
  },

  async register({ commit }, { email, password, profile }) {
    const { auth, db } = await import('~/plugins/firebase')
    const res = await auth.createUserWithEmailAndPassword(email, password)
    const userData = {
      ...profile,
      role: profile.role || 'user',
      created_at: new Date()
    }
    await db.collection('users').doc(res.user.uid).set(userData)
    commit('SET_USER', { uid: res.user.uid, email: res.user.email })
    commit('SET_PROFILE', userData)
  }
}
