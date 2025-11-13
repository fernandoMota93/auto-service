<template>
  <b-card>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="mb-0">Clientes</h4>
      <b-button variant="primary" @click="openCreateModal">Novo Cliente</b-button>
    </div>

    <b-table :items="clients" :fields="fields" hover small responsive bordered>
      <template #cell(actions)="item">
        <Actions @edit="openEditModal" @delete="openDeleteModal" @recoverPassword="sendRecoverEmail" :item="item.item"
          :type="'client'" />
      </template>
    </b-table>

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
import authService from "@/services/authService";


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
    async sendRecoverEmail(val) {
      console.log('val',val)
      this.message = null;
      this.error = null;
      this.loading = true;

      try {
        await authService.recoverPassword(val.email);

        this.message =
          "Se este e-mail estiver cadastrado, o cliente receberá um link para redefinir sua senha.";

        // ✅ Toast de sucesso
        this.$bvToast.toast('E-mail de recuperação enviado com sucesso!', {
          title: 'Sucesso',
          variant: 'success',
          solid: true,
          autoHideDelay: 4000
        });

      } catch (err) {
        const map = {
          "auth/user-not-found": "E-mail não encontrado.",
          "auth/invalid-email": "E-mail inválido.",
        };

        this.error = map[err.code] || "Erro ao enviar e-mail de recuperação.";

        // ❌ Toast de erro
        this.$bvToast.toast(this.error, {
          title: 'Erro',
          variant: 'danger',
          solid: true,
          autoHideDelay: 5000
        });

      } finally {
        this.loading = false;
      }
    }

  },
};
</script>
