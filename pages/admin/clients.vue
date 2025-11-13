<template>
  <b-card>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="mb-0">Clientes</h4>
      <b-button variant="primary" @click="openCreateModal"
        >Novo Cliente</b-button
      >
    </div>

    <b-table :items="clients" :fields="fields" hover small responsive bordered>
      <template #cell(actions)="item">
        <Actions
          @edit="openEditModal"
          @delete="openDeleteModal"
          :item="item.item"
          :type="'client'"
        />
      </template>
    </b-table>

    <!-- Modal Criar/Editar -->
    <b-modal
      id="client-modal"
      v-model="showModal"
      :title="isEditing ? 'Editar Cliente' : 'Novo Cliente'"
      @ok="saveClient"
    >
      <b-form @submit.stop.prevent>
        <b-form-group label="Nome">
          <b-form-input v-model="form.name" required></b-form-input>
        </b-form-group>
        <b-form-group label="Email">
          <b-form-input
            type="email"
            v-model="form.email"
            required
          ></b-form-input>
        </b-form-group>
      </b-form>
    </b-modal>

    <!-- Modal Excluir -->
    <b-modal
      id="delete-modal"
      v-model="showDeleteModal"
      title="Confirmar exclusão"
      @ok="confirmDelete"
      ok-title="Sim, excluir"
      ok-variant="danger"
      cancel-title="Cancelar"
    >
      Tem certeza que deseja excluir <strong>{{ selected?.name }}</strong
      >?
    </b-modal>
  </b-card>
</template>

<script>
import clientService from '~/services/clientService';
import Actions from './components/actions.vue';

export default {
  components: {
    Actions,
  },
  data() {
    return {
      clients: [],
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
    async loadClients() {
      this.clients = await clientService.getAll();
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
      await clientService.remove(this.selected.id);
      this.showDeleteModal = false;
      await this.loadClients();
    },
  },
};
</script>
