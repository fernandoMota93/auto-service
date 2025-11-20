<template>
  <div>
    <b-card class="mb-3" title="Cadastrar">
      <b-form @submit.prevent="add">
        <b-form-row>
          <!-- Montadora -->
          <b-col cols="12" md="6" class="mb-2">
            <v-select v-model="vehicle.brand" :options="brands" label="nome" placeholder="Selecione a montadora"
              :reduce="(b) => b.codigo" @input="loadModels" required />
          </b-col>

          <!-- Modelo -->
          <b-col cols="12" md="6" class="mb-2">
            <v-select v-model="vehicle.model" :options="models" label="nome" placeholder="Selecione o modelo"
              :reduce="(m) => m.codigo" :disabled="!vehicle.brand" @input="loadYears" required />
          </b-col>

          <!-- Ano -->
          <b-col cols="12" md="6" class="mb-2">
            <v-select v-model="vehicle.year" :options="years" label="nome" placeholder="Selecione o ano"
              :reduce="(y) => y.nome" :disabled="!vehicle.model" required />
          </b-col>

          <!-- Motor -->
          <b-col cols="12" md="6" class="mb-2">
            <b-form-input v-model="vehicle.engine" placeholder="Motor" required />
          </b-col>

          <!-- Placa -->
          <b-col cols="12" md="6" class="mb-2">
            <b-form-input v-model="vehicle.plate" placeholder="Placa" required />
          </b-col>

          <b-col cols="12" md="6" class="mb-2">
            <b-form-input type="number" v-model="vehicle.mileage" placeholder="Quilometragem" required />
          </b-col>
        </b-form-row>

        <b-button type="submit" variant="primary" class="mt-2" :disabled="loading">
          {{ loading ? 'Salvando...' : 'Adicionar' }}
        </b-button>
      </b-form>
    </b-card>

    <b-card :title="client ? `Veículos de ${client.name}` : 'Meus veículos'">
      <div class="mt-3">
        <b-row>
          <b-col md="6" v-for="v in vehicles" :key="v.id">
            <b-card class="mb-2" @click="openEditModal(v)" style="cursor: pointer">

              <strong>{{ v.plate }}</strong> - {{ v.brand_name }} /
              {{ v.model_name }} / {{ v.year }} / Km: {{ v.mileage }}
            </b-card>
          </b-col>
        </b-row>
      </div>
    </b-card>

    <b-modal id="editVehicleModal" v-model="showEditModal" title="Editar veículo" hide-footer>
      <b-form @submit.prevent="updateVehicle">

        <b-form-group label="Montadora">
          <b-form-input v-model="editVehicle.brand_name" disabled></b-form-input>
        </b-form-group>

        <b-form-group label="Modelo">
          <b-form-input v-model="editVehicle.model_name" disabled></b-form-input>
        </b-form-group>

        <b-form-group label="Ano">
          <b-form-input v-model="editVehicle.year" disabled></b-form-input>
        </b-form-group>

        <b-form-group label="Placa">
          <b-form-input v-model="editVehicle.plate" required></b-form-input>
        </b-form-group>

        <b-form-group label="Motor">
          <b-form-input v-model="editVehicle.engine" required></b-form-input>
        </b-form-group>

        <b-form-group label="Quilometragem">
          <b-form-input type="number" v-model="editVehicle.mileage"></b-form-input>
        </b-form-group>

        <div class="d-flex justify-content-between mt-3">
          <b-button variant="danger" @click="softDeleteModal = true">Excluir</b-button>
          <b-button variant="primary" type="submit">Salvar</b-button>
        </div>

      </b-form>
    </b-modal>

    <b-modal v-model="softDeleteModal" title="Confirmar exclusão" hide-footer centered>
      <div class="text-center">
        <p>
          Tem certeza que deseja excluir o veículo
          <strong>{{ editVehicle.plate }}</strong>?
        </p>

        <p class="text-muted" style="font-size: 0.9rem;">
          Esta ação não apagará o registro permanentemente.<br>
          Ele apenas ficará marcado como removido.
        </p>

        <div class="d-flex justify-content-between mt-4">
          <b-button variant="secondary" @click="softDeleteModal = false">
            Cancelar
          </b-button>

          <b-button variant="danger" @click="confirmSoftDelete">
            Confirmar exclusão
          </b-button>
        </div>
      </div>
    </b-modal>

  </div>
</template>

<script>
import vehicleService from '~/services/vehicleService';
import vSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';

export default {
  props: {
    client: { type: Object, required: false }
  },
  components: { vSelect },
  data() {
    return {
      editVehicle: {},
      showEditModal: false,
      softDeleteModal: false,
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
    openEditModal(v) {
      this.editVehicle = { ...v }; // clona o veículo
      this.showEditModal = true;
    },
    async updateVehicle() {
      await vehicleService.update(this.editVehicle.id, {
        plate: this.editVehicle.plate,
        engine: this.editVehicle.engine,
        mileage: this.editVehicle.mileage
        // mileage NÃO é editável
      });

      const uid = this.client ? this.client.id : this.$store.state.user.currentUser.uid;
      this.vehicles = await vehicleService.listByUser(uid);

      this.showEditModal = false;
    },

    async confirmSoftDelete() {
      await vehicleService.softDelete(this.editVehicle.id);

      const uid = this.client ? this.client.id : this.$store.state.user.currentUser.uid;
      this.vehicles = await vehicleService.listByUser(uid);

      this.softDeleteModal = false;
      this.showEditModal = false;

      this.$bvToast.toast(
        `O veículo ${this.editVehicle.plate} foi excluído com sucesso.`,
        {
          title: 'Exclusão realizada',
          variant: 'success',
          solid: true,
          autoHideDelay: 3500,
          toaster: 'b-toaster-bottom-right'
        }
      );
    },
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
