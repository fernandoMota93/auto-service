<template>
  <div>
    <b-card>
      <h4>Meus Veículos</h4>
      <b-form @submit.prevent="add">
        <b-form-row>
          <b-col md="4"><b-form-input v-model="vehicle.plate" placeholder="Placa" required /></b-col>
          <b-col md="4"><b-form-input v-model="vehicle.model" placeholder="Modelo" required /></b-col>
          <b-col md="4"><b-form-input v-model="vehicle.year" placeholder="Ano" required /></b-col>
        </b-form-row>
        <b-button type="submit" variant="primary" class="mt-2">Adicionar</b-button>
      </b-form>

      <div class="mt-3">
        <b-row>
          <b-col md="6" v-for="v in vehicles" :key="v.id">
            <b-card class="mb-2">
              <strong>{{ v.plate }}</strong> - {{ v.model }} / {{ v.year }}
            </b-card>
          </b-col>
        </b-row>
      </div>
    </b-card>
  </div>
</template>

<script>
import vehicleService from '~/services/vehicleService'

export default {
  data() { return { vehicle: { plate:'', model:'', year:'' }, vehicles: [] } },
  async mounted() {
    const uid = this.$store.state.user.currentUser.uid
    this.vehicles = await vehicleService.listByUser(uid)
  },
  methods: {
    async add() {
      const uid = this.$store.state.user.currentUser.uid
      await vehicleService.create({ ...this.vehicle, user_id: uid })
      this.vehicles = await vehicleService.listByUser(uid)
      this.vehicle = { plate:'', model:'', year:'' }
    }
  }
}
</script>
