<template>
  <div>
    <b-card v-if="order">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4>{{ companyName }}</h4>
          <h5>Ordem de Serviço #{{ orderId ? orderId : id }}</h5>
        </div>
        <b-button variant="success" @click="generatePDF">
          <i class="fas fa-file-pdf"> <b-icon icon="printer" /></i>
        </b-button>
      </div>

      <hr />

      <b-row>
        <b-col md="6">
          <p><strong>Cliente:</strong> {{ clientName }}</p>
          <p><strong>Veículo:</strong> {{ vehicleName }}</p>
          <p>
            <strong>Status:</strong>
            <b-badge :variant="formatOrderStatus(order.status).color">{{
              formatOrderStatus(order.status).label
            }}</b-badge>
          </p>
          <p>
            <strong>Data de criação:</strong> {{ formatDate(order.created_at) }}
          </p>
          <p><strong>Observações:</strong> {{ order.description }}</p>
        </b-col>

        <b-col md="6">
          <h6>Serviços realizados:</h6>
          <ul>
            <li v-for="(s, idx) in order.services" :key="idx">
              {{ s.name }} —
              {{
                s.value.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })
              }}
            </li>
          </ul>
          <p class="mt-2">
            <strong>Total:</strong>
            {{
              total(order).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })
            }}
          </p>
        </b-col>
      </b-row>
      <b-row>
        <b-col cols="12" class="mt-5">
          <h5>Histórico</h5>
          <b-table :items="order.history" class="mt-4" show-empty striped
            :fields="[{ key: 'created_at', label: 'Data' }, { key: 'text', label: 'Descrição' }]" small>
            <template #cell(created_at)="data">
              {{ formatFirebaseDate(data.item.created_at) }}
            </template>
            <template #empty>
              <b-alert variant="info" show>
                <p class="p-1">Sem registro de histórico.</p>
              </b-alert>
            </template>
          </b-table>

        </b-col>
      </b-row>

      <hr />

      <h5>Galeria de Imagens</h5>
      <div v-if="order.images && order.images.length">
        <b-row>
          <b-col md="4" v-for="img in order.images" :key="img" class="mb-3">
            <b-card no-body>
              <b-img
                :src="img"
                fluid
                alt="Imagem OS"
                @click="viewImage(img)"
                style="cursor: pointer; border-radius: 8px"
              />
            </b-card>
          </b-col>
        </b-row>
      </div>
      <div v-else class="text-muted">Nenhuma imagem disponível.</div>

      <b-modal id="imageModal" size="xl" hide-footer>
        <img :src="selectedImage" class="img-fluid" />
      </b-modal>
    </b-card>
  </div>
</template>

<script>
import { jsPDF } from 'jspdf';
import { db } from '~/plugins/firebase';
import timbradoUrl from '@/assets/images/timbrado.png';
import orderStatusMixin from '~/mixins/orderStatusMixin';
import mixinShared from '../../../mixins/mixinShared';

export default {
  mixins: [orderStatusMixin, mixinShared],

  props: {
    id: { type: String, default: null },
  },
  name: 'view-os',
  layout: 'default',
  data() {
    return {
      order: null,
      clientName: '',
      vehicleName: '',
      selectedImage: null,
      companyName: 'Grilo Auto Service',
    };
  },
  computed: {
    orderId() {
      return this.$route.params.id;
    },
  },
  async mounted() {
    await this.loadOrder();
  },
  methods: {
    async loadOrder() {
      let osId = this.id ? this.id : this.orderId;
      const doc = await db.collection('orders').doc(osId).get();
      if (!doc.exists) return;
      this.order = { id: doc.id, ...doc.data() };

      const clientDoc = await db
        .collection('users')
        .doc(this.order.client_id)
        .get();
      this.clientName = clientDoc.exists
        ? clientDoc.data().name
        : 'Cliente não encontrado';

      if (this.order.vehicle_id) {
        const vdoc = await db
          .collection('vehicles')
          .doc(this.order.vehicle_id)
          .get();
        this.vehicleName = vdoc.exists
          ? `${vdoc.data().model} (${vdoc.data().plate})`
          : 'Sem veículo';
      } else {
        this.vehicleName = 'Sem veículo vinculado';
      }
    },

    total(order) {
      if (!order.services || !Array.isArray(order.services)) return 0;
      return order.services.reduce((acc, s) => acc + (Number(s.value) || 0), 0);
    },

    formatDate(date) {
      if (!date) return '';
      const d = date.toDate ? date.toDate() : new Date(date);
      return d.toLocaleString('pt-BR');
    },

    viewImage(img) {
      this.selectedImage = img;
      this.$bvModal.show('imageModal');
    },

    async getBase64FromUrl(url) {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    },

    async generatePDF() {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;

      // ✅ Carrega o timbrado
      const bg = await this.getBase64FromUrl(timbradoUrl);
      doc.addImage(bg, 'PNG', 0, 0, pageWidth, pageHeight);

      // Cabeçalho
      doc.setFontSize(16);
      doc.text(this.companyName, 40, 15);
      doc.setFontSize(12);
      doc.text(`Ordem de Serviço #${this.orderId}`, 40, 20);

      let y = 40;
      doc.setFontSize(11);
      doc.text(`Cliente: ${this.clientName}`, 20, y);
      doc.text(`Veículo: ${this.vehicleName}`, 20, (y += 6));
      doc.text(
        `Status: ${this.formatOrderStatus(this.order.status)}`,
        20,
        (y += 6)
      );
      doc.text(`Data: ${this.formatDate(this.order.created_at)}`, 20, (y += 6));

      y += 10;
      doc.setFontSize(13);
      doc.text('Serviços realizados:', 20, y);
      y += 6;
      doc.setFontSize(11);

      this.order.services?.forEach((s) => {
        doc.text(`${s.name} — R$ ${Number(s.value).toFixed(2)}`, 25, y);
        y += 6;
      });

      y += 4;
      doc.text(`Total: R$ ${this.total(this.order).toFixed(2)}`, 25, y);

      // Galeria
      if (this.order.images && this.order.images.length) {
        y += 12;
        doc.setFontSize(13);
        doc.text('Galeria de Imagens:', 20, y);
        y += 6;

        const imgSize = 50;
        let x = 20;

        for (let img of this.order.images) {
          try {
            const base64 = await this.getBase64FromUrl(img);
            doc.addImage(base64, 'JPEG', x, y, imgSize, imgSize);
            x += imgSize + 10;
            if (x + imgSize > pageWidth) {
              x = 20;
              y += imgSize + 10;
            }
          } catch (e) {
            console.error('Erro ao carregar imagem:', e);
          }
        }
      }

      // Rodapé com data
      const today = new Date().toLocaleDateString('pt-BR');
      doc.setFontSize(10);
      doc.text(`Emitido em: ${today}`, 20, pageHeight - 10);

      // Abre em nova aba
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      window.open(url);
    },
  },
};
</script>
