export default function ({ store, redirect, route }) {
  const publicPaths = ['/', '/register', '/forgot-password']
  const user = store.state.user 

  console.log('user',user)

  // 1. Se a rota for pública → libera
  if (publicPaths.includes(route.path)) {
    return
  }

  // 2. Se não estiver logado → manda para login/home
  if (!user) {
    return redirect('/')
  }

  // 3. Regras de acesso por rota + role

  // 👇 Exemplo: qualquer rota que comece com /admin precisa ser admin
  if (route.path.startsWith('/admin')) {
    if (user.profile?.role !== 'admin') {
      return redirect('/403') // ou '/', escolha você
    }
  }

   if (route.path.startsWith('/admin')) {
    if (user.profile?.role !== 'admin') {
      return redirect('/403') // ou '/', escolha você
    }
  }



  // Aqui você pode adicionar outras regras, se quiser:
  // if (route.path.startsWith('/manager') && user.profile.role !== 'manager') return redirect('/')
}
