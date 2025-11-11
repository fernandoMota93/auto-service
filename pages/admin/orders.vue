<template>
  <div>
    <b-row>

      <!-- Lista de Ordens -->
      <b-col cols="12">
        <b-card>
          <h5>Ordens existentes</h5>
          <b-row class="mb-3 ">
            <b-col cols="12" class="text-right">
              <b-button variant="success" @click="createOS">+ Criar Nova OS</b-button>
            </b-col>
          </b-row>
          <b-row class="mb-3">
            <b-col md="3" class="mb-3">
              <b-form-datepicker v-model="filters.startDate" placeholder="Data inicial"></b-form-datepicker>
            </b-col>

            <b-col md="3" class="mb-3">
              <b-form-datepicker v-model="filters.endDate" placeholder="Data final"></b-form-datepicker>
            </b-col>

            <b-col md="3" class="mb-3">
              <b-form-select v-model="filters.status" :options="statusOptions" />
            </b-col>

            <b-col md="3" class="mb-3">
              <b-button variant="primary" block @click="loadOrders">Filtrar</b-button>
            </b-col>
          </b-row>
          <b-table striped small responsive show-empty :items="filteredOrders" :fields="fields">
            <template #empty>
              <b-alert variant="info" show>
                <p class="p-1">Não existe OS para o período.</p>
              </b-alert>
            </template>
            <template #cell(actions)="item">
              <Actions @view="viewOS" @edit="editOS" @delete="promptDeleteOS" :item="item.item" />
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

          <!-- Contadores no final da tabela -->
          <b-row class="mt-3 pt-3 border-top" v-if="filteredOrders.length > 0">
            <b-col cols="12" class="d-flex justify-content-end">
              <div class="summary-cards">
                <b-card class="summary-card mr-2">
                  <div class="text-center">
                    <div class="summary-label">Total de OS</div>
                    <div class="summary-value text-primary">{{ filteredOrders.length }}</div>
                  </div>
                </b-card>
                <b-card class="summary-card">
                  <div class="text-center">
                    <div class="summary-label">Total dos Serviços</div>
                    <div class="summary-value text-success">R$ {{ totalServicesValue.toFixed(2) }}</div>
                  </div>
                </b-card>
              </div>
            </b-col>
          </b-row>

          <b-pagination v-model="currentPage" :total-rows="totalOrders" :per-page="perPage" align="center" size="sm"
            class="mt-2" @change="loadOrders" />
          <div v-if="filteredOrders.length === 0" class="text-muted">
            Nenhuma ordem
          </div>

          <!-- <b-row>
            <b-col
              cols="12"
              md="6"
              v-for="o in filteredOrders"
              :key="o.id"
              class="mb-3"
            >
              <b-card>
                <h6>{{ o.description }}</h6>
                <p>Cliente: {{ clientName(o.client_id) }}</p>
                <b-badge :variant="formatOrderStatus(o.status).color">
                  {{ formatOrderStatus(o.status).label }}
                </b-badge>

                <div v-if="o.services && o.services.length">
                  <h6>Serviços</h6>
                  <ul class="list-unstyled mb-2">
                    <li
                      v-for="(s, idx) in o.services"
                      :key="idx"
                      class="d-flex justify-content-between"
                    >
                      <span>{{ s.name }}</span>
                      <span>R$ {{ Number(s.value).toFixed(2) }}</span>
                    </li>
                  </ul>
                </div>

                <p>
                  <strong>Valor total: R$ {{ total(o).toFixed(2) }}</strong>
                </p>

                <div
                  v-if="o.images && o.images.length"
                  class="d-flex flex-wrap"
                >
                  <div
                    v-for="(img, idx) in o.images"
                    :key="idx"
                    class="position-relative mr-2 mb-2"
                  >
                    <img
                      :src="img"
                      class="img-thumbnail"
                      style="max-width: 120px"
                    />
                    <b-button
                      size="sm"
                      variant="danger"
                      class="position-absolute"
                      style="top: 2px; right: 2px; padding: 0 4px"
                      @click="promptDeleteImage(o.id, img)"
                    >
                      X
                    </b-button>
                  </div>
                </div>

                <div class="mt-2 d-flex justify-content-between">
                  <div>
                    <b-button
                      size="sm"
                      variant="success"
                      @click="setStatus(o.id, 'in_progress')"
                      >Iniciar</b-button
                    >
                    <b-button
                      size="sm"
                      variant="primary"
                      @click="setStatus(o.id, 'done')"
                      >Concluir</b-button
                    >
                    <b-button
                      size="sm"
                      variant="danger"
                      @click="promptDeleteOS(o.id)"
                      >Excluir</b-button
                    >
                  </div>
                  <b-button size="sm" variant="success" @click="exportPDF(o)"
                    ><b-icon icon="printer"></b-icon
                  ></b-button>
                </div>
              </b-card>
            </b-col>
          </b-row> -->
        </b-card>
      </b-col>
    </b-row>

    <!-- Modal de confirmação de exclusão -->
    <b-modal id="confirm-delete-modal" ref="confirmDeleteModal" title="Confirmar exclusão" ok-title="Sim"
      cancel-title="Cancelar" @ok="confirmDeleteImage">
      <p>Tem certeza que deseja remover esta imagem?</p>
    </b-modal>
    <!-- Modal de confirmação de exclusão da OS -->
    <b-modal id="confirm-delete-os-modal" ref="confirmDeleteOSModal" title="Confirmar exclusão" ok-title="Sim"
      cancel-title="Cancelar" @ok="confirmDeleteOS">
      <p>Tem certeza que deseja excluir esta OS?</p>
    </b-modal>

    <b-modal size="lg" title="Visualizar OS" v-model="viewOSModal" hide-footer>
      <_id :id="osId" />
    </b-modal>

    <b-modal size="lg" :title="editable ? 'Editar OS' : 'Criar OS'" v-model="launchModal">
      <b-card>
        <b-form @submit.prevent="create">
          <b-form-group label="Cliente">
            <b-form-select v-model="form.client_id" :options="clientOptions" required />
          </b-form-group>

          <b-form-group label="Veículo (opcional)">
            <b-form-select v-model="form.vehicle_id" :options="vehicleOptions" />
          </b-form-group>

          <b-form-group label="Descrição">
            <b-form-textarea v-model="form.description" rows="3" required />
          </b-form-group>

          <div>
            <h6>Serviços</h6>
            <div v-for="(s, idx) in form.services" :key="idx" class="d-flex mb-2">
              <b-form-input v-model="s.name" placeholder="Serviço" class="mr-2" required />
              <b-form-input v-model.number="s.value" placeholder="Valor" type="number" class="mr-2" required />
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

          <b-button type="submit" variant="primary">Criar OS</b-button>
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

export default {
  mixins: [orderStatusMixin, mixinShared],

  data() {
    return {
      viewOSModal: false,
      launchModal: false,
      editable: false,
      osId: '',
      filters: {
        startDate: null,
        endDate: null,
        status: 'all',
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
      perPage: 50,
      loading: false,
      clients: [],
      vehicles: [],
      clientOptions: [],
      vehicleOptions: [],
      orders: [],
      form: {
        client_id: null,
        vehicle_id: null,
        description: '',
        services: [{ name: '', value: 0 }],
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
    };
  },

  components: {
    Actions,
    _id,
  },

  computed: {
    filteredOrders() {
      // Ignora OS soft deleted
      return this.orders.filter((o) => !o.deleted_at);
    },
    
    // Novo computed para calcular o total dos serviços
    totalServicesValue() {
      return this.filteredOrders.reduce((total, order) => {
        return total + this.total(order);
      }, 0);
    }
  },

  async mounted() {
    const snap = await db.collection('users').get();
    this.clients = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    this.clientOptions = this.clients.map((c) => ({
      value: c.id,
      text: `${c.name} (${c.email})`,
    }));

    await this.loadOrders(1);
  },

  methods: {
    createOS() {
      this.editable = false;
      this.launchModal = true;

      this.form = {
        client_id: null,
        vehicle_id: null,
        description: null,
        services: null,
      }

      this.files = []
    },
    viewOS(item) {
      this.osId = item.id;
      this.viewOSModal = true;
    },
    editOS(item) {
      console.log(item)
      this.launchModal = true;
      this.editable = true;

      this.form = {
        client_id: item.client_id,
        vehicle_id: item.vehicle_id,
        description: item.description,
        services: item.services,
      }

      this.files = (item.images || []).map(url => ({
        preview: url,   // usado para exibir no modal
        url,            // usado para saber se é imagem existente
        file: null      // diferencia das novas
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

    async loadOrders(page = this.currentPage) {
      //this.orders = await orderService.listAll()

      const { data, total } = await orderService.listPaginated(
        this.perPage,
        this.currentPage,
        this.filters
      );
      this.orders = data;
      this.totalOrders = total;
      this.currentPage = page;
    },

    clientName(id) {
      const c = this.clients.find((x) => x.id === id);
      return c ? c.name : id;
    },

    addService() {
      this.form.services.push({ name: '', value: 0 });
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
      try {
        if (!this.form.client_id) {
          this.$bvToast.toast('Selecione um cliente.', {
            title: 'Erro',
            variant: 'danger',
            solid: true,
          });
          return;
        }

        const adminUid = this.$store.state.user.currentUser.uid;
        const order = {
          client_id: this.form.client_id,
          vehicle_id: this.form.vehicle_id || null,
          description: this.form.description,
          services: this.form.services.filter((s) => s.name),
          user_id: this.form.client_id,
          created_by: adminUid,
        };

        const res = await orderService.create(order);

        for (const f of this.files) {
          await orderService.uploadImage(res.id, f.file);
        }

        await this.loadOrders();
        this.form = {
          client_id: null,
          vehicle_id: null,
          description: '',
          services: [{ name: '', value: 0 }],
        };
        this.files = [];

        this.$bvToast.toast('OS criada com sucesso!', {
          title: 'Sucesso',
          variant: 'success',
          solid: true,
        });
      } catch (e) {
        this.$bvToast.toast(`Erro ao criar OS: ${e.message}`, {
          title: 'Erro',
          variant: 'danger',
          solid: true,
        });
      }
    },

    async setStatus(id, status) {
      await orderService.update(id, { status });
      await this.loadOrders();
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
        await this.loadOrders();
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

    // Exclusão de imagem existente
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
        await this.loadOrders();
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

    // Função para gerar PDF
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
      doc.text(`Cliente: ${o.clientName || '-'}`, 20, y);
      y += 7;
      doc.text(`Veículo: ${o.vehicle || '-'}`, 20, y);
      y += 7;
      doc.text(`Placa: ${o.plate || '-'}`, 20, y);
      y += 7;
      doc.text(`Telefone: ${o.phone || '-'}`, 20, y);
      y += 10;

      doc.setFont('helvetica', 'bold');
      doc.text('Serviço(s) executado(s):', 20, y);
      y += 7;
      doc.setFont('helvetica', 'normal');
      const textLines = doc.splitTextToSize(o.description || '—', 170);
      doc.text(textLines, 20, y);
      y += textLines.length * 6 + 10;

      const valor = o.services
        ? o.services.reduce((s, it) => s + (it.value || 0), 0)
        : 0;
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
  },

  watch: {
    'form.client_id': function () {
      this.onClientChange();
    },
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
}
</style>