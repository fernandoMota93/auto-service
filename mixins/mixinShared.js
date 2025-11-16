export default {
  methods: {
    formatFirebaseDate(timestamp) {
      if (!timestamp) return '-'

      // Se já for Timestamp do Firebase
      const date =
        typeof timestamp.toDate === 'function'
          ? timestamp.toDate()
          : new Date(timestamp.seconds * 1000)

      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')

      return `${day}/${month}/${year} - ${hours}:${minutes}`
    },
     convertMoneyToNumber(moneyString) {
      if (!moneyString) return 0;

      const cleaned = moneyString
        .replace('R$ ', '')
        .replace(/\./g, '')
        .replace(',', '.');

      return parseFloat(cleaned) || 0;
    },
  }
}
