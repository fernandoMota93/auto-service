<template>
  <b-card>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="mb-0">Clientes</h4>
      <b-button variant="primary" @click="openCreateModal">Novo Cliente</b-button>
    </div>

    <!-- Campo de pesquisa -->
    <b-row class="mb-3">
      <b-col cols="12" md="4">
        <b-form-input v-model="search" placeholder="Pesquisar cliente pelo nome..."
          @input="debounceSearch"></b-form-input>
      </b-col>
    </b-row>

    <!-- Tabela -->
    <b-table :items="clients" :fields="fields" hover small responsive bordered>
      <template #cell(actions)="item">
        <Actions @edit="openEditModal" @delete="openDeleteModal" @recoverPassword="sendRecoverEmail" :item="item.item"
          type="client" />
      </template>
    </b-table>
    <b-pagination v-model="currentPage" :total-rows="totalClients" :per-page="perPage" align="center" size="sm"
      class="mt-3" @input="onPageChange" />


    <!-- Modal Criar/Editar -->
    <b-modal id="client-modal" v-model="showModal" :title="isEditing ? 'Editar Cliente' : 'Novo Cliente'"
      @ok="saveClient">
      <b-form @submit.stop.prevent>
        <b-form-group label="Nome">
          <b-form-input v-model="form.name" required></b-form-input>
        </b-form-group>
        <b-form-group label="Email">
          <b-form-input type="email" v-model="form.email" required></b-form-input>
        </b-form-group>
      </b-form>
    </b-modal>

    <!-- Modal Excluir -->
    <b-modal id="delete-modal" v-model="showDeleteModal" title="Confirmar exclusão" @ok="confirmDelete"
      ok-title="Sim, excluir" ok-variant="danger" cancel-title="Cancelar">
      Tem certeza que deseja excluir <strong>{{ selected?.name }}</strong>?
    </b-modal>
  </b-card>
</template>

<script>
import clientService from '~/services/clientService';
import Actions from './components/actions.vue';
import authService from '@/services/authService';

export default {
  components: { Actions },

  data() {
    return {
      clients: [],
      currentPage: 1,
      perPage: 50,
      totalClients: 0,
      search: "",
      debounceTimer: null,

      fields: [
        { key: 'actions', label: 'Ações' },
        { key: 'name', label: 'Nome' },
        { key: 'email', label: 'Email' },
      ],

      showModal: false,
      showDeleteModal: false,
      isEditing: false,
      form: { name: '', email: '' },
      selected: null,
    };
  },

  async mounted() {
    await this.loadClients();
  },

  methods: {
    onPageChange(page) {
      this.currentPage = page;
      this.loadClients();
    },

    async loadClients() {
      const result = await clientService.listPaginated(
        this.perPage,
        this.currentPage,
        this.search
      );

      console.log('result', result)

      this.clients = result.data;
      this.totalClients = result.total;
    },


    debounceSearch() {
      clearTimeout(this.debounceTimer);

      this.debounceTimer = setTimeout(async () => {
        if (this.search.length >= 3 || this.search.length === 0) {
          this.currentPage = 1;
          await this.loadClients();
        }
      }, 400);
    },

    openCreateModal() {
      this.isEditing = false;
      this.form = { name: '', email: '' };
      this.showModal = true;
    },

    openEditModal(client) {
      this.isEditing = true;
      this.selected = client;
      this.form = { ...client };
      this.showModal = true;
    },

    async saveClient() {
      if (this.isEditing) {
        await clientService.update(this.selected.id, this.form);
      } else {
        await clientService.create(this.form);
      }
      this.showModal = false;
      await this.loadClients();
    },

    openDeleteModal(client) {
      this.selected = client;
      this.showDeleteModal = true;
    },

    async confirmDelete() {
      await clientService.remove(this.selected);
      this.showDeleteModal = false;
      await this.loadClients();
    },

    async sendRecoverEmail(val) {
      this.message = null;
      this.error = null;
      this.loading = true;

      try {
        await authService.recoverPassword(val.email);

        this.$bvToast.toast('E-mail de recuperação enviado com sucesso!', {
          title: 'Sucesso',
          variant: 'success',
          solid: true,
          autoHideDelay: 4000,
        });
      } catch (err) {
        const map = {
          "auth/user-not-found": "E-mail não encontrado.",
          "auth/invalid-email": "E-mail inválido.",
        };

        this.error = map[err.code] || "Erro ao enviar e-mail de recuperação.";

        this.$bvToast.toast(this.error, {
          title: 'Erro',
          variant: 'danger',
          solid: true,
          autoHideDelay: 5000,
        });
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
