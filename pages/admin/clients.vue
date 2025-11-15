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
        <Actions @edit="openEditModal" @delete="openDeleteModal" @recoverPassword="sendRecoverEmail"
          @openVehicles="openVehicles" @sendMessage="sendWhatsapp" :item="item.item" type="client" />
      </template>
      <template #cell(phone)="item">
        {{ formatPhone(item.item.phone) }}
      </template>
    </b-table>
    <b-pagination v-model="currentPage" :total-rows="totalClients" :per-page="perPage" align="center" size="sm"
      class="mt-3" @input="onPageChange" />


    <!-- Modal Criar/Editar ATUALIZADO -->
    <b-modal id="client-modal" v-model="showModal" :title="isEditing ? 'Editar Cliente' : 'Novo Cliente'"
      @ok="saveClient" @hidden="resetForm" :ok-disabled="saving">
      <b-form @submit.stop.prevent>
        <b-form-group label="Nome *" :state="nameState" invalid-feedback="Nome é obrigatório">
          <b-form-input v-model="form.name" required placeholder="Nome completo"></b-form-input>
        </b-form-group>

        <b-form-group v-if="!isEditing" label="Email *" :state="emailState" invalid-feedback="Email é obrigatório e deve ser válido">
          <b-form-input  type="email" v-model="form.email" required placeholder="email@exemplo.com"></b-form-input>
        </b-form-group>

        <b-form-group label="Telefone *" :state="phoneState"
          invalid-feedback="Telefone é obrigatório no formato (XX) XXXXX-XXXX">
          <b-form-input v-model="form.phone" v-mask="'(##) #####-####'" required
            placeholder="(00) 00000-0000"></b-form-input>
        </b-form-group>

        <b-form-group label="Endereço">
          <b-form-input v-model="form.address" placeholder="Rua, número, bairro, cidade"></b-form-input>
        </b-form-group>
      </b-form>

      <template #modal-ok>
        <b-spinner small v-if="saving" class="mr-1"></b-spinner>
        {{ saving ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar') }}
      </template>
    </b-modal>

    <!-- Modal Excluir -->
    <b-modal id="delete-modal" v-model="showDeleteModal" title="Confirmar exclusão" @ok="confirmDelete"
      ok-title="Sim, excluir" ok-variant="danger" cancel-title="Cancelar">
      Tem certeza que deseja excluir <strong>{{ selected?.name }}</strong>?
    </b-modal>

    <b-modal title="Veiculos" v-model="openVehicleModal" hide-footer size="lg">
      <Vechicle :client="parseClient" />
    </b-modal>
  </b-card>
</template>

<script>
import clientService from '~/services/clientService';
import Actions from './components/actions.vue';
import Vechicle from '../dashboard/vehicle.vue';
import authService from '@/services/authService';

export default {
  components: { Actions, Vechicle },

  data() {
    return {
      clients: [],
      parseClient: null,
      currentPage: 1,
      perPage: 50,
      openVehicleModal: false,
      totalClients: 0,
      search: "",
      debounceTimer: null,

      // NOVO: Estado para controlar o salvamento
      saving: false,

      fields: [
        { key: 'actions', label: 'Ações' },
        { key: 'name', label: 'Nome' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Telefone' },
        { key: 'address', label: 'Endereço' },
      ],

      showModal: false,
      showDeleteModal: false,
      isEditing: false,
      form: {
        name: '',
        email: '',
        phone: '',
        address: ''
      },
      selected: null,
    };
  },

  computed: {
    nameState() {
      return this.form.name.length > 0 ? true : false;
    },

    emailState() {
      if (this.form.email.length === 0) return false;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(this.form.email) ? true : false;
    },

    phoneState() {
      return this.form.phone.length === 15 ? true : false;
    },

    isFormValid() {
      return this.nameState && this.emailState && this.phoneState;
    }
  },

  async mounted() {
    await this.loadClients();
  },

  methods: {
    formatPhone(phone) {
      if (!phone) return '-';
      return phone;
    },

    onPageChange(page) {
      this.currentPage = page;
      this.loadClients();
    },

    sendWhatsapp(client) {
      const password = "123456";
      const platformUrl = "https://grilo-auto-service.web.app/";

      const message = `Olá ${client.name}!

        Aqui estão suas credenciais de acesso à platoforma Grilo Auto Service:

        *Email:* ${client.email}
        *Senha:* ${password}
        *Acesso:* ${platformUrl}

        *Instruções:*
        1. Acesse o link acima
        2. Use seu email e a senha fornecida
        3. Recomendamos alterar a senha no primeiro acesso

        Em caso de dúvidas, estamos à disposição!`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/55${this.cleanPhone(client.phone)}?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');
    },

    cleanPhone(phone) {
      if (!phone) return '';
      return phone.replace(/\D/g, '');
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
      this.form = {
        name: '',
        email: '',
        phone: '',
        address: ''
      };
      this.showModal = true;
    },

    openEditModal(client) {
      this.isEditing = true;
      this.selected = client;
      this.form = {
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || ''
      };
      this.showModal = true;
    },

    openVehicles(client) {
      this.openVehicleModal = true
      this.parseClient = client
    },

    resetForm() {
      this.form = {
        name: '',
        email: '',
        phone: '',
        address: ''
      };
      this.saving = false; // Reseta o estado de salvamento
    },

    async saveClient(event) {
      event.preventDefault();

      if (!this.isFormValid) {
        this.$bvToast.toast('Preencha todos os campos obrigatórios corretamente', {
          title: 'Erro de validação',
          variant: 'danger',
          solid: true,
        });
        return;
      }

      this.saving = true; // Ativa o estado de salvamento

      try {
        const cleanPhone = this.form.phone.replace(/\D/g, '');

        const clientData = {
          ...this.form,
          phone: cleanPhone.length === 11 ? this.form.phone : this.form.phone
        };

        if (this.isEditing) {
          await clientService.update(this.selected.id, clientData);
          this.$bvToast.toast('Cliente atualizado com sucesso!', {
            title: 'Sucesso',
            variant: 'success',
            solid: true,
          });
        } else {
          await clientService.create(clientData);
          this.$bvToast.toast('Cliente criado com sucesso!', {
            title: 'Sucesso',
            variant: 'success',
            solid: true,
          });
        }

        this.showModal = false;
        await this.loadClients();

      } catch (error) {
        console.error('Erro ao salvar cliente:', error);
        this.$bvToast.toast('Erro ao salvar cliente. Tente novamente.', {
          title: 'Erro',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.saving = false; // Desativa o estado de salvamento
      }
    },

    openDeleteModal(client) {
      this.selected = client;
      this.showDeleteModal = true;
    },

    async confirmDelete() {
      try {
        await clientService.remove(this.selected);
        this.$bvToast.toast('Cliente excluído com sucesso!', {
          title: 'Sucesso',
          variant: 'success',
          solid: true,
        });
        this.showDeleteModal = false;
        await this.loadClients();
      } catch (error) {
        console.error('Erro ao excluir cliente:', error);
        this.$bvToast.toast('Erro ao excluir cliente. Tente novamente.', {
          title: 'Erro',
          variant: 'danger',
          solid: true,
        });
      }
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

<style scoped>
.form-group {
  margin-bottom: 1rem;
}

.form-group label::after {
  content: " *";
  color: #dc3545;
}

.form-group:not(:has(label[required])) label::after {
  content: "";
}
</style>