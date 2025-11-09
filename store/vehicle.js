export const state = () => ({ list: [] })

export const mutations = { SET_VEHICLES(state, vehicles) { state.list = vehicles } }

export const actions = {
  async fetchUserVehicles({ commit, rootState }) {
    const { db } = await import('~/plugins/firebase')
    const uid = rootState.user.currentUser.uid
    const snap = await db.collection('vehicles').where('user_id', '==', uid).get()
    const vehicles = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    commit('SET_VEHICLES', vehicles)
  }
}
