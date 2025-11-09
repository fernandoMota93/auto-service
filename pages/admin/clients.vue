<template>
  <b-card>
    <h4>Clientes</h4>
    <div v-if="clients.length===0" class="text-muted">Nenhum cliente</div>
    <b-list-group>
      <b-list-group-item v-for="c in clients" :key="c.id">
        <strong>{{ c.name }}</strong><br/>
        <small>{{ c.email }}</small>
      </b-list-group-item>
    </b-list-group>
  </b-card>
</template>

<script>
import { db } from '~/plugins/firebase'
export default {
  data() { return { clients: [] } },
  async mounted() {
    const snap = await db.collection('users').get()
    this.clients = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  }
}
</script>
