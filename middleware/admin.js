export default function ({ store, redirect }) {
  const profile = store.state.user.profile
  if (!profile || profile.role !== 'admin') return redirect('/')
}
