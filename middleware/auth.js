export default function ({ store, redirect, route }) {
  const publicPaths = ['/', '/register']
  if (publicPaths.includes(route.path)) return
  const user = store.state.user.currentUser
  if (!user) return redirect('/')
}
