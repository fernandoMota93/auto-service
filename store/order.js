export const state = () => ({ list: [] })

export const mutations = { SET_ORDERS(state, orders) { state.list = orders } }

export const actions = {
  async fetchOrdersByUser({ commit, rootState }) {
    const { db } = await import('~/plugins/firebase')
    const uid = rootState.user.currentUser.uid
    const snap = await db.collection('orders').where('user_id', '==', uid).orderBy('created_at','desc').get()
    const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    commit('SET_ORDERS', orders)
  }
}
