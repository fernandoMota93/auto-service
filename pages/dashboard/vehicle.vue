<template>
  <div>
    <b-card class="mb-3" title="Cadastrar">
      <b-form @submit.prevent="add">
        <b-form-row>
          <!-- Montadora -->
          <b-col cols="12" md="6" class="mb-2">
            <v-select
              v-model="vehicle.brand"
              :options="brands"
              label="nome"
              placeholder="Selecione a montadora"
              :reduce="(b) => b.codigo"
              @input="loadModels"
              required
            />
          </b-col>

          <!-- Modelo -->
          <b-col cols="12" md="6" class="mb-2">
            <v-select
              v-model="vehicle.model"
              :options="models"
              label="nome"
              placeholder="Selecione o modelo"
              :reduce="(m) => m.codigo"
              :disabled="!vehicle.brand"
              @input="loadYears"
              required
            />
          </b-col>

          <!-- Ano -->
          <b-col cols="12" md="6" class="mb-2">
            <v-select
              v-model="vehicle.year"
              :options="years"
              label="nome"
              placeholder="Selecione o ano"
              :reduce="(y) => y.nome"
              :disabled="!vehicle.model"
              required
            />
          </b-col>

          <!-- Motor -->
          <b-col cols="12" md="6" class="mb-2">
            <b-form-input
              v-model="vehicle.engine"
              placeholder="Motor"
              required
            />
          </b-col>

          <!-- Placa -->
          <b-col cols="12" md="6" class="mb-2">
            <b-form-input
              v-model="vehicle.plate"
              placeholder="Placa"
              required
            />
          </b-col>

           <b-col cols="12" md="6" class="mb-2">
            <b-form-input
              v-model="vehicle.mileage"
              placeholder="Quilometragem"
              required
            />
          </b-col>
        </b-form-row>

        <b-button
          type="submit"
          variant="primary"
          class="mt-2"
          :disabled="loading"
        >
          {{ loading ? 'Salvando...' : 'Adicionar' }}
        </b-button>
      </b-form>
    </b-card>

    <b-card :title="client ? `Veículos de ${client.name}` : 'Meus veículos'">
      <div class="mt-3">
        <b-row>
          <b-col md="6" v-for="v in vehicles" :key="v.id">
            <b-card class="mb-2">
              <strong>{{ v.plate }}</strong> - {{ v.brand_name }} /
              {{ v.model_name }} / {{ v.year }} / Km: {{ v.mileage }}
            </b-card>
          </b-col>
        </b-row>
      </div>
    </b-card>
  </div>
</template>

<script>
import vehicleService from '~/services/vehicleService';
import vSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';

export default {
  props: {
    client: {type: Object, required: false}
  },
  components: { vSelect },
  data() {
    return {
      vehicle: {
        brand: '',
        model: '',
        year: '',
        plate: '',
        engine: '',
        mileage: '',
      },
      brands: [],
      models: [],
      years: [],
      vehicles: [],
      loading: false,
    };
  },
  async mounted() {
    await this.loadBrands();
    const uid = this.client ? this.client.id : this.$store.state.user.currentUser.uid;


    this.vehicles = await vehicleService.listByUser(uid);

    console.log('props', this.client)
  },
  methods: {
    async loadBrands() {
      try {
        const res = await fetch(
          'https://parallelum.com.br/fipe/api/v1/carros/marcas'
        );
        this.brands = await res.json();
      } catch (error) {
        console.error('Erro ao carregar marcas FIPE:', error);
        this.brands = [];
      }
    },
    async loadModels() {
      this.models = [];
      this.years = [];
      this.vehicle.model = '';
      this.vehicle.year = '';
      if (!this.vehicle.brand) return;

      try {
        const res = await fetch(
          `https://parallelum.com.br/fipe/api/v1/carros/marcas/${this.vehicle.brand}/modelos`
        );
        const data = await res.json();
        this.models = data.modelos || [];
      } catch (error) {
        console.error('Erro ao carregar modelos FIPE:', error);
      }
    },
    async loadYears() {
      this.years = [];
      this.vehicle.year = '';
      if (!this.vehicle.model) return;

      try {
        const res = await fetch(
          `https://parallelum.com.br/fipe/api/v1/carros/marcas/${this.vehicle.brand}/modelos/${this.vehicle.model}/anos`
        );
        this.years = await res.json();
      } catch (error) {
        console.error('Erro ao carregar anos FIPE:', error);
      }
    },
    async add() {
      if (!this.vehicle.brand || !this.vehicle.model || !this.vehicle.year)
        return;
      this.loading = true;

      const uid = this.client ? this.client.id : this.$store.state.user.currentUser.uid;

      // Busca os nomes legíveis das seleções (opcional, para salvar o nome da marca/modelo)
      const brandObj = this.brands.find((b) => b.codigo === this.vehicle.brand);
      const modelObj = this.models.find((m) => m.codigo === this.vehicle.model);

      try {
        await vehicleService.create({
          owner_id: uid,
          brand: this.vehicle.brand,
          brand_name: brandObj?.nome,
          model: this.vehicle.model,
          model_name: modelObj?.nome,
          year: this.vehicle.year,
          plate: this.vehicle.plate,
          engine: this.vehicle.engine,
          mileage: this.vehicle.mileage
        });

        this.vehicles = await vehicleService.listByUser(uid);
        this.vehicle = {
          brand: '',
          model: '',
          year: '',
          plate: '',
          engine: '',
          mileage: '',
        };
        this.models = [];
        this.years = [];
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
