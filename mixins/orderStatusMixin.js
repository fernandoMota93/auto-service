export default {
  methods: {
    formatOrderStatus(status) {
      if (!status) return '-'

      const map = {
        open: { label: 'Aberta', color: 'warning' },
        in_progress: { label: 'Em andamento', color: 'primary' },
        done: { label: 'Concluída', color: 'success' },
        canceled: { label: 'Cancelada', color: 'danger' },
        on_hold: { label: 'Em espera', color: 'secondary' }
      }

      const info = map[status] || { label: status, color: 'dark' }

      return info
    }
  }
}
