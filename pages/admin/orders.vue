<template>
  <div>
    <b-row>
      <!-- Lista de Ordens -->
      <b-col cols="12">
        <b-card>
          <h5>Ordens existentes</h5>
          <b-row class="mb-3">
            <b-col cols="12" class="text-right">
              <b-button variant="success" @click="createOS">+ Criar Nova OS</b-button>
            </b-col>
          </b-row>
          <b-row class="mb-3">
            <!-- FILTROS -->
            <b-col md="3" class="mb-3">
              <b-form-datepicker v-model="filters.selectedDate" placeholder="Selecione uma data"></b-form-datepicker>
            </b-col>

            <b-col md="3" class="mb-3">
              <b-form-select v-model="filters.status" :options="statusOptions" />
            </b-col>

            <b-col md="3" class="mb-3">
             
              <v-select v-model="filters.client_id" :options="clientFilterOptions" label="text" :reduce="(option) => option.value" placeholder="Filtrar por cliente" />
            </b-col>

            <b-col md="3" class="mb-3">
              <b-button variant="primary" block @click="onFilter">Filtrar</b-button>
              <b-button variant="outline-secondary" block @click="clearFilters" class="mt-1">Limpar</b-button>
            </b-col>
          </b-row>
          <b-row style="max-height: 90vh; overflow-y: auto;">
            <b-table striped small responsive show-empty :items="paginatedOrders" :fields="fields">
              <template #empty>
                <b-alert variant="info" show>
                  <p class="p-1">Não existe OS para o período.</p>
                </b-alert>
              </template>
              <template #cell(actions)="item">
                <Actions @view="viewOS" @edit="editPromptOS" @delete="promptDeleteOS" :item="item.item" />
              </template>
              <template #cell(client_id)="item">
                {{ clientName(item.item.client_id) }}
              </template>
              <template #cell(status)="item">
                <b-badge :variant="formatOrderStatus(item.item.status).color">
                  {{ formatOrderStatus(item.item.status).label }}
                </b-badge>
              </template>
              <template #cell(services)="item">
                <div v-if="item.item.services && item.item.services.length">
                  <ul class="list-unstyled mb-2">
                    <li v-for="(s, idx) in item.item.services" :key="idx" class="d-flex justify-content-between">
                      <span>{{ s.name }} - </span>
                      <span>
                        <strong>R$ {{ Number(s.value).toFixed(2) }}</strong></span>
                      <hr />
                    </li>
                  </ul>
                </div>
              </template>
              <template #cell(total)="item">
                R$ {{ total(item.item).toFixed(2) }}
              </template>

              <template #cell(created_at)="item">
                {{ formatFirebaseDate(item.item.created_at) }}
              </template>
            </b-table>
          </b-row>

          <!-- Contadores no final da tabela -->
          <b-row class="mt-3 pt-3 border-top" v-if="filteredOrders.length > 0">
            <b-col cols="12" class="d-flex justify-content-end">
              <div class="summary-cards">
                <b-card class="summary-card mr-2">
                  <div class="text-center">
                    <div class="summary-label">Total de OS</div>
                    <div class="summary-value text-primary">
                      {{ filteredOrders.length }}
                    </div>
                  </div>
                </b-card>
                <b-card class="summary-card">
                  <div class="text-center">
                    <div class="summary-label">Total dos Serviços</div>
                    <div class="summary-value text-success">
                      R$ {{ totalServicesValue.toFixed(2) }}
                    </div>
                  </div>
                </b-card>
              </div>
            </b-col>
          </b-row>

          <b-pagination v-model="currentPage" :total-rows="totalOrders" :per-page="perPage" align="center" size="sm"
            class="mt-2" @change="onPageChange" />
          <div v-if="filteredOrders.length === 0" class="text-muted">
            Nenhuma ordem
          </div>
        </b-card>
      </b-col>
    </b-row>

    <!-- Modais (mantidos iguais) -->
    <b-modal id="confirm-delete-modal" ref="confirmDeleteModal" title="Confirmar exclusão" ok-title="Sim"
      cancel-title="Cancelar" @ok="confirmDeleteImage">
      <p>Tem certeza que deseja remover esta imagem?</p>
    </b-modal>

    <b-modal id="confirm-delete-os-modal" ref="confirmDeleteOSModal" title="Confirmar exclusão" ok-title="Sim"
      cancel-title="Cancelar" @ok="confirmDeleteOS">
      <p>Tem certeza que deseja excluir esta OS?</p>
    </b-modal>

    <b-modal size="lg" title="Visualizar OS" v-model="viewOSModal" hide-footer>
      <_id :id="osId" />
    </b-modal>

    <b-modal size="lg" :title="editable ? 'Editar OS' : 'Criar OS'" v-model="launchModal" hide-footer>
      <b-card>
        <b-form @submit.prevent="handlerSubmit">
          <b-form-group label="Cliente">
            <b-form-select v-model="form.client_id" :options="clientOptions" required />
          </b-form-group>

          <b-form-group label="Veículo (opcional)">
            <b-form-select v-model="form.vehicle_id" :options="vehicleOptions" />
          </b-form-group>

          <b-form-group label="Descrição">
            <b-form-textarea v-model="form.description" rows="3" required />
          </b-form-group>

          <b-form-group label="Status da OS">
            <b-form-select v-model="form.status" :options="statusOptions.filter(s => s.value !== 'all')" />
          </b-form-group>

          <div>
            <h6>Serviços</h6>
            <div v-for="(s, idx) in form.services" :key="idx" class="d-flex mb-2 align-items-center">
              <b-form-input v-model="s.name" placeholder="Serviço" class="mr-2" required />
              <b-form-input v-model="s.value" placeholder="Valor" class="mr-2 input-money" v-money="moneyConfig" />
              <b-button size="sm" variant="danger" @click="removeService(idx)">X</b-button>
            </div>
            <b-button class="mt-3" size="sm" variant="secondary" @click="addService">Adicionar serviço</b-button>
          </div>

          <b-form-group label="Upload de imagens (até 4)">
            <b-form-file multiple accept="image/*" @change="handleFiles"></b-form-file>
            <div class="mt-2 d-flex flex-wrap">
              <div v-for="(img, idx) in files" :key="idx" class="position-relative mr-2 mb-2">
                <b-img :src="img.preview || img.url" thumbnail fluid style="max-width: 100px" />
                <b-button size="sm" variant="danger" class="position-absolute"
                  style="top: 2px; right: 2px; padding: 0 4px" @click="removeFile(idx)">
                  X
                </b-button>
              </div>
            </div>
          </b-form-group>

          <b-button type="submit" variant="primary" :disabled="isSubmitting">
            <span v-if="isSubmitting">
              <b-spinner small class="mr-1"></b-spinner>
              Aguarde...
            </span>
            <span v-else>
              {{ editable ? 'Atualizar' : 'Criar OS' }}
            </span>
          </b-button>
        </b-form>
      </b-card>
    </b-modal>
  </div>
</template>

<script>
import { db } from '~/plugins/firebase';
import orderService from '~/services/orderService';
import orderStatusMixin from '~/mixins/orderStatusMixin';
import jsPDF from 'jspdf';
import timbradoUrl from '@/assets/images/timbrado.png';
import Actions from './components/actions.vue';
import mixinShared from '../../mixins/mixinShared';
import _id from '../dashboard/orders/_id.vue';
import vSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';

export default {
  mixins: [orderStatusMixin, mixinShared],

  data() {
    return {
      viewOSModal: false,
      launchModal: false,
      editable: false,
      isSubmitting: false,
      osId: '',
      filters: {
        selectedDate: new Date().toISOString().split('T')[0],
        status: 'all',
        client_id: null, // NOVO FILTRO POR CLIENTE
      },
      statusOptions: [
        { value: 'all', text: 'Todos' },
        { value: 'open', text: 'Pendente' },
        { value: 'in_progress', text: 'Em andamento' },
        { value: 'done', text: 'Concluído' },
        { value: 'canceled', text: 'Cancelado' },
        { value: 'on_hold', text: 'Em espera' },
      ],
      osToDelete: null,
      totalOrders: 0,
      currentPage: 1,
      perPage: 10,
      loading: false,
      clients: [],
      vehicles: [],
      clientOptions: [],
      vehicleOptions: [],
      allOrders: [],
      filteredOrders: [],
      paginatedOrders: [],
      form: {
        client_id: null,
        vehicle_id: null,
        description: '',
        services: [{ name: '', value: 0 }],
        status: 'open',
      },
      files: [],
      imageToDelete: null,
      imageOrderId: null,
      fields: [
        { key: 'actions', label: 'Ações' },
        { key: 'client_id', label: 'Cliente' },
        { key: 'description', label: 'Descrição' },
        { key: 'status', label: 'Estado da OS' },
        { key: 'services', label: 'Serviços' },
        { key: 'created_at', label: 'Aberto em', sortable: true },
        { key: 'total', label: 'Valor Serviço' },
      ],
      moneyConfig: {
        decimal: ',',
        thousands: '.',
        prefix: 'R$ ',
        suffix: '',
        precision: 2,
        masked: false
      },
    };
  },

  components: {
    Actions,
    _id,
    vSelect
  },

  watch: {
    'form.client_id': function () {
      this.onClientChange();
    },
    currentPage: function () {
      this.updatePagination();
    }
  },

  computed: {
    totalServicesValue() {
      return this.paginatedOrders.reduce((total, order) => {
        return total + this.total(order);
      }, 0);
    },

    // NOVO: Opções para o filtro de clientes
    clientFilterOptions() {
      return [
        { value: null, text: 'Todos os clientes' },
        ...this.clients.map((c) => ({
          value: c.id,
          text: `${c.name} (${c.email})`,
        }))
      ];
    },
  },

  async mounted() {
    const snap = await db.collection('users').get();
    this.clients = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    this.clientOptions = this.clients.map((c) => ({
      value: c.id,
      text: `${c.name} (${c.email})`,
    }));

    await this.loadAllOrders();
  },

  methods: {
    // Carrega todos os orders uma vez
    async loadAllOrders() {
      try {
        this.loading = true;
        this.allOrders = await orderService.listAll();
        this.applyFilters();
      } catch (error) {
        console.error('Erro ao carregar orders:', error);
        this.$bvToast.toast('Erro ao carregar ordens de serviço', {
          title: 'Erro',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.loading = false;
      }
    },

    // FILTRO ATUALIZADO COM CLIENTE
    applyFilters() {
      let filtered = this.allOrders.filter(order => !order.deleted_at);

      // Filtro por status
      if (this.filters.status && this.filters.status !== 'all') {
        filtered = filtered.filter(order => order.status === this.filters.status);
      }

      // NOVO: Filtro por cliente
      if (this.filters.client_id) {
        filtered = filtered.filter(order => order.client_id === this.filters.client_id);
      }

      // Filtro por data
      if (this.filters.selectedDate) {
        const selectedDate = new Date(this.filters.selectedDate);
        const nextDay = new Date(selectedDate);
        nextDay.setDate(nextDay.getDate() + 1);

        filtered = filtered.filter(order => {
          const orderDate = this.getOrderDate(order.created_at);
          return orderDate >= selectedDate && orderDate < nextDay;
        });
      }

      this.filteredOrders = filtered;
      this.totalOrders = filtered.length;
      this.updatePagination();
    },

    // Converte created_at para Date object
    getOrderDate(created_at) {
      try {
        if (!created_at) return new Date(0);

        if (created_at.toDate && typeof created_at.toDate === 'function') {
          return created_at.toDate();
        }

        if (created_at.seconds) {
          return new Date(created_at.seconds * 1000);
        }

        if (typeof created_at === 'string' || typeof created_at === 'number') {
          const date = new Date(created_at);
          return isNaN(date.getTime()) ? new Date(0) : date;
        }

        if (created_at instanceof Date) {
          return created_at;
        }

        return new Date(0);
      } catch (error) {
        console.warn('Erro ao converter data:', created_at, error);
        return new Date(0);
      }
    },

    // Atualiza os dados paginados
    updatePagination() {
      const startIndex = (this.currentPage - 1) * this.perPage;
      const endIndex = startIndex + this.perPage;
      this.paginatedOrders = this.filteredOrders.slice(startIndex, endIndex);
    },

    // Handler para mudança de página
    onPageChange(page) {
      this.currentPage = page;
      this.updatePagination();
    },

    // Handler para aplicar filtros
    onFilter() {
      this.currentPage = 1;
      this.applyFilters();

      let message = 'Filtro aplicado';

      if (this.filters.selectedDate) {
        message += ` para ${new Date(this.filters.selectedDate).toLocaleDateString('pt-BR')}`;
      }

      if (this.filters.client_id) {
        const client = this.clients.find(c => c.id === this.filters.client_id);
        if (client) {
          message += ` - Cliente: ${client.name}`;
        }
      }

      if (this.filters.status && this.filters.status !== 'all') {
        const statusText = this.statusOptions.find(s => s.value === this.filters.status)?.text;
        message += ` - Status: ${statusText}`;
      }

      this.$bvToast.toast(message, {
        title: 'Filtro',
        variant: 'info',
        solid: true,
        autoHideDelay: 3000
      });
    },

    // Limpar filtros ATUALIZADO
    clearFilters() {
      this.filters = {
        selectedDate: null,
        status: 'all',
        client_id: null,
      };
      this.currentPage = 1;
      this.applyFilters();

      this.$bvToast.toast('Filtros limpos', {
        title: 'Sucesso',
        variant: 'info',
        solid: true,
      });
    },

    handlerSubmit() {
      if (this.editable) {
        this.editOS();
      } else {
        this.create();
      }
    },

    // Método para converter string monetária para número
    convertMoneyToNumber(moneyString) {
      if (!moneyString) return 0;

      // Remove "R$ ", pontos e converte vírgula para ponto
      const cleaned = moneyString
        .replace('R$ ', '')
        .replace(/\./g, '')
        .replace(',', '.');

      return parseFloat(cleaned) || 0;
    },

    // Método para preparar os dados antes de salvar
    prepareFormData() {
      const formData = { ...this.form };

      // Converte os valores monetários para número
      formData.services = formData.services.map(service => ({
        ...service,
        value: this.convertMoneyToNumber(service.value)
      }));

      return formData;
    },

    // Método para formatar números existentes para formato monetário
    formatNumberToMoney(number) {
      if (!number && number !== 0) return 'R$ 0,00';

      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(number);
    },

    // Formata valores existentes quando editar
    formatExistingValues(services) {
      return services.map(service => ({
        ...service,
        value: this.formatNumberToMoney(service.value)
      }));
    },

    async editOS() {
      if (this.isSubmitting) return;
      this.isSubmitting = true;

      try {
        if (!this.form.client_id) {
          this.$bvToast.toast('Selecione um cliente.', {
            title: 'Erro',
            variant: 'danger',
            solid: true,
          });
          return;
        }

        const formData = this.prepareFormData();

        const updatedData = {
          client_id: formData.client_id,
          vehicle_id: formData.vehicle_id || null,
          description: formData.description,
          services: formData.services.filter(s => s.name),
          status: formData.status,
        };

        await orderService.update(this.osId, updatedData);

        const keptOldImages = this.files
          .filter(f => !f.file)
          .map(f => f.url);

        const newFiles = this.files.filter(f => f.file);

        const existingImages = (await orderService.listByUser(this.form.client_id))
          .find(order => order.id === this.osId)?.images || [];

        const removedImages = existingImages.filter(url => !keptOldImages.includes(url));

        for (const url of removedImages) {
          await orderService.deleteImage(this.osId, url);
        }

        for (const f of newFiles) {
          await orderService.uploadImage(this.osId, f.file);
        }

        this.$bvToast.toast('OS atualizada com sucesso!', {
          title: 'Sucesso',
          variant: 'success',
          solid: true,
        });

        this.launchModal = false;
        await this.loadAllOrders();

      } catch (error) {
        this.$bvToast.toast(error.message || 'Erro ao atualizar OS', {
          title: 'Erro',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.isSubmitting = false;
      }
    },

    createOS() {
      this.editable = false;
      this.launchModal = true;

      this.form = {
        client_id: null,
        vehicle_id: null,
        description: null,
        services: [{ name: '', value: 'R$ 0,00' }],
        status: 'open',
      };

      this.files = [];
    },

    viewOS(item) {
      this.osId = item.id;
      this.viewOSModal = true;
    },

    editPromptOS(item) {
      this.launchModal = true;
      this.editable = true;
      this.osId = item.id;

      this.form = {
        client_id: item.client_id,
        vehicle_id: item.vehicle_id,
        description: item.description,
        services: this.formatExistingValues(item.services),
        status: item.status,
      };

      this.files = (item.images || []).map((url) => ({
        preview: url,
        url,
        file: null,
      }));
    },

    promptDeleteOS(item) {
      this.osToDelete = item.id;
      this.$refs.confirmDeleteOSModal.show();
    },

    total(order) {
      if (!order.services || !Array.isArray(order.services)) return 0;
      return order.services.reduce((acc, s) => acc + (Number(s.value) || 0), 0);
    },

    clientName(id) {
      const c = this.clients.find((x) => x.id === id);
      return c ? c.name : id;
    },

    addService() {
      if (!Array.isArray(this.form.services)) {
        this.form.services = [];
      }
      this.form.services.push({ name: '', value: 'R$ 0,00' });
    },

    removeService(idx) {
      this.form.services.splice(idx, 1);
    },

    async onClientChange() {
      if (!this.form.client_id) return;
      const snap = await db
        .collection('vehicles')
        .where('owner_id', '==', this.form.client_id)
        .get();
      this.vehicleOptions = snap.docs.map((d) => ({
        value: d.id,
        text: `${d.data().plate} - ${d.data().model_name}`,
      }));
    },

    handleFiles(event) {
      const selected = Array.from(event.target.files);
      if (selected.length + this.files.length > 4) {
        this.$bvToast.toast('Você só pode enviar até 4 imagens.', {
          title: 'Erro',
          variant: 'danger',
          solid: true,
        });
        return;
      }
      selected.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) =>
          this.files.push({ file, preview: e.target.result });
        reader.readAsDataURL(file);
      });
    },

    removeFile(idx) {
      this.files.splice(idx, 1);
    },

    async create() {
      if (this.isSubmitting) return;
      this.isSubmitting = true;

      try {
        if (!this.form.client_id) {
          this.$bvToast.toast('Selecione um cliente.', {
            title: 'Erro',
            variant: 'danger',
            solid: true,
          });
          return;
        }

        const formData = this.prepareFormData();

        const adminUid = this.$store.state.user.currentUser.uid;
        const order = {
          client_id: formData.client_id,
          vehicle_id: formData.vehicle_id || null,
          description: formData.description,
          services: formData.services.filter((s) => s.name),
          user_id: formData.client_id,
          created_by: adminUid,
          status: formData.status,
          created_at: new Date(),
        };

        const res = await orderService.create(order);

        for (const f of this.files) {
          await orderService.uploadImage(res.id, f.file);
        }

        await this.loadAllOrders();

        this.$bvToast.toast('OS criada com sucesso!', {
          title: 'Sucesso',
          variant: 'success',
          solid: true,
        });

        this.launchModal = false;

      } catch (e) {
        this.$bvToast.toast(`Erro ao criar OS: ${e.message}`, {
          title: 'Erro',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.isSubmitting = false;
      }
    },

    async setStatus(id, status) {
      await orderService.updateStatus(id, { status });
      await this.loadAllOrders();
    },

    async confirmDeleteOS() {
      if (!this.osToDelete) return;
      try {
        await orderService.softDelete(this.osToDelete);
        this.$bvToast.toast('OS excluída com sucesso!', {
          title: 'Sucesso',
          variant: 'success',
          solid: true,
        });
        await this.loadAllOrders();
      } catch (e) {
        this.$bvToast.toast(`Erro ao excluir OS: ${e.message}`, {
          title: 'Erro',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.osToDelete = null;
      }
    },

    promptDeleteImage(orderId, img) {
      this.imageToDelete = img;
      this.imageOrderId = orderId;
      this.$refs.confirmDeleteModal.show();
    },

    async confirmDeleteImage() {
      try {
        if (!this.imageToDelete || !this.imageOrderId) return;
        await orderService.deleteImage(this.imageOrderId, this.imageToDelete);
        this.$bvToast.toast('Imagem removida com sucesso!', {
          title: 'Sucesso',
          variant: 'success',
          solid: true,
        });
        await this.loadAllOrders();
      } catch (e) {
        this.$bvToast.toast(`Erro ao remover imagem: ${e.message}`, {
          title: 'Erro',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.imageToDelete = null;
        this.imageOrderId = null;
      }
    },

    async exportPDF(o) {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const bg = await this.getBase64FromUrl(timbradoUrl);
      doc.addImage(bg, 'PNG', 0, 0, pageWidth, pageHeight);

      doc.setFontSize(16);
      doc.text('Grilo Auto Service', 40, 15);
      doc.setFontSize(12);
      doc.text(`Ordem de Serviço #${o.id}`, 40, 20);

      let y = 50;
      doc.setFontSize(11);
      doc.text(`Cliente: ${this.clientName(o.client_id)}`, 20, y);
      y += 7;
      doc.text(`Veículo: ${o.vehicle_id || '-'}`, 20, y);
      y += 7;
      doc.text(`Descrição: ${o.description || '-'}`, 20, y);
      y += 10;

      doc.setFont('helvetica', 'bold');
      doc.text('Serviço(s) executado(s):', 20, y);
      y += 7;
      doc.setFont('helvetica', 'normal');

      if (o.services && o.services.length) {
        o.services.forEach(service => {
          const serviceText = `${service.name} - R$ ${Number(service.value).toFixed(2)}`;
          doc.text(serviceText, 20, y);
          y += 5;
        });
      } else {
        doc.text('Nenhum serviço registrado', 20, y);
        y += 5;
      }

      y += 5;

      const valor = this.total(o);
      doc.setFont('helvetica', 'bold');
      doc.text('Valor total:', 20, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`R$ ${valor.toFixed(2).replace('.', ',')}`, 55, y);
      y += 15;

      if (o.images && o.images.length) {
        doc.setFont('helvetica', 'bold');
        doc.text('Imagens:', 20, y);
        y += 10;
        for (const img of o.images) {
          const base64 = img.startsWith('data:')
            ? img
            : await this.getBase64FromUrl(img);
          const imgWidth = 60;
          const imgHeight = 45;
          if (y + imgHeight > 270) {
            doc.addPage();
            doc.addImage(bg, 'PNG', 0, 0, pageWidth, pageHeight);
            y = 20;
          }
          doc.addImage(base64, 'JPEG', 20, y, imgWidth, imgHeight);
          y += imgHeight + 10;
        }
      }

      const today = new Date().toLocaleDateString('pt-BR');
      doc.setFontSize(10);
      doc.text(`Emitido em: ${today}`, 20, 285);

      const blob = doc.output('blob');
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    },

    async getBase64FromUrl(url) {
      const res = await fetch(url);
      const blob = await res.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    },

    formatFirebaseDate(date) {
      if (!date) return '-';
      try {
        const dateObj = this.getOrderDate(date);
        return dateObj.toLocaleDateString('pt-BR');
      } catch (error) {
        console.warn('Erro ao formatar data:', date, error);
        return '-';
      }
    }
  },
};
</script>

<style scoped>
.summary-cards {
  display: flex;
  gap: 1rem;
}

.summary-card {
  min-width: 150px;
  padding: 0.75rem;
  border: 1px solid #e9ecef;
}

.summary-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6c757d;
  margin-bottom: 0.25rem;
}

.summary-value {
  font-size: 1.25rem;
  font-weight: 600;
}

/* Estilo para o campo de money */
.input-money {
  text-align: right;
  font-weight: 500;
}

/* Responsividade para mobile */
@media (max-width: 576px) {
  .summary-cards {
    flex-direction: column;
    width: 100%;
  }

  .summary-card {
    min-width: auto;
    width: 100%;
  }

  .mb-3 {
    margin-bottom: 1rem !important;
  }
}
</style>