<template>
  <div>
    <b-card v-if="order">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4>{{ companyName }}</h4>
          <h5>Ordem de Serviço #{{ orderId ? orderId : id }} {{ order && order.os_number ? ' ('+order.os_number+')' : '(S/Nr)' }}</h5>
          <b-button v-if="currentUser.role === 'admin'" variant="info" @click="sendWhatsapp">
            Enviar orçamento
          </b-button>
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
              <b-img :src="img" fluid alt="Imagem OS" @click="viewImage(img)"
                style="cursor: pointer; border-radius: 8px" />
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
import autoTable from 'jspdf-autotable';
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
      client: {},
    };
  },
  computed: {
    orderId() {
      return this.$route.params.id;
    },
    currentUser() {
      return this.$store.state.user.profile
    }
  },
  async mounted() {
    await this.loadOrder();
    console.log('user', this.$store.state)
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

      this.client = clientDoc.data()

      if (this.order.vehicle_id) {
        const vdoc = await db
          .collection('vehicles')
          .doc(this.order.vehicle_id)
          .get();
        this.vehicleName = vdoc.exists
          ? `${vdoc.data().brand_name} - ${vdoc.data().model_name} (${vdoc.data().plate})`
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

    sendWhatsapp() {
      console.log(this.client, 'cliente')
      const services = this.order.services || [];

      // monta o texto da lista
      const servicesText = services
        .map(s => `• ${s.name} – *${s.value.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        })}*`)
        .join('\n');

      const message = `Olá, ${this.client.name}!\n\nSegue o resumo dos serviços necessários para seu veículo na Grilo Auto Service:\n${this.vehicleName}\n\n-----------------\n${servicesText}\n\n*Total: ${ this.total(this.order).toLocaleString('pt-BR', {style: 'currency',currency: 'BRL',})}*\n-----------------\n\nEm caso de dúvidas, estamos à disposição!`.trim();

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/55${this.cleanPhone(this.client.phone)}?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');
    },


    cleanPhone(phone) {
      if (!phone) return '';
      return phone.replace(/\D/g, '');
    },

    async generatePDF() {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;

      const marginLeft = 20;
      const marginRight = 20;
      const marginTop = 20;

      let y = marginTop;

      // Carregar timbrado
      const bg = await this.getBase64FromUrl(timbradoUrl);

      // ===== Função: HEADER + TIMBRADO ==========================
      const renderHeader = () => {
        doc.addImage(bg, 'PNG', 0, 0, pageWidth, pageHeight);

        doc.setTextColor('#FFFFFF');
        doc.setFont('helvetica', 'bold').setFontSize(18);
        doc.text(this.companyName, pageWidth - 150, 15);

        doc.setFontSize(13).setFont('helvetica', 'normal');
        doc.text(
          `Ordem de Serviço #${this.orderId ? this.orderId : this.id} (${this.order?.os_number || 'S/Nr'})`,
          pageWidth - 150,
          20
        );
      };

      // Renderiza primeira página
      renderHeader();
      doc.setTextColor('#000000');


      // ==================== BLOCO: DADOS DA OS =============================
      y = 50;

      doc.setFontSize(14).setFont('helvetica', 'bold');
      doc.text('Dados da OS', marginLeft, y);
      y += 8;

      doc.setFontSize(11).setFont('helvetica', 'normal');
      doc.text(`Cliente: ${this.clientName}`, marginLeft + 5, y);
      y += 6;

      doc.text(`Veículo: ${this.vehicleName}`, marginLeft + 5, y);
      y += 6;

      doc.text(`Status: ${this.formatOrderStatus(this.order.status).label}`, marginLeft + 5, y);
      y += 6;

      doc.text(`Criada em: ${this.formatDate(this.order.created_at)}`, marginLeft + 5, y);
      y += 14;

      // ==================== SERVIÇOS (autoTable) =============================
      doc.setFontSize(14).setFont('helvetica', 'bold');
      doc.text('Serviços Realizados', marginLeft, y);
      y += 4;

      const servicosBody = this.order.services?.map(s => [
        s.name,
        Number(s.value).toFixed(2)
      ]) || [];

      autoTable(doc, {
        startY: y,
        margin: { left: marginLeft, right: marginRight },
        head: [['Serviço', 'Valor (R$)']],
        body: servicosBody,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [150, 150, 150] },
        didAddPage: () => {
          renderHeader();
        }
      });

      y = doc.lastAutoTable.finalY + 6;

      // TOTAL
      doc.setFontSize(12).setFont('helvetica', 'bold');
      doc.text(
        `Total: R$ ${this.total(this.order).toFixed(2)}`,
        pageWidth - marginRight - 40,
        y
      );

      y += 16;

      // ==================== HISTÓRICO (autoTable) ============================
      doc.setFontSize(14).setFont('helvetica', 'bold');
      doc.text('Histórico da OS', marginLeft, y);
      y += 4;

      const historicoBody = this.order.history?.map(h => [
        this.formatFirebaseDate(h.created_at),
        h.text || '-'
      ]) || [];

      autoTable(doc, {
        startY: y,
        margin: { left: marginLeft, right: marginRight },
        head: [['Data', 'Descrição']],
        body: historicoBody,
        styles: { fontSize: 10, cellWidth: 'wrap' },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: pageWidth - marginLeft - marginRight - 35 },
        },
        headStyles: { fillColor: [150, 150, 150] },
        didAddPage: () => {
          renderHeader();
        }
      });

      y = doc.lastAutoTable.finalY + 10;

      // ==================== IMAGENS =========================================
      if (this.order.images?.length) {
        doc.setFontSize(14).setFont('helvetica', 'bold');
        doc.text('Imagens da OS', marginLeft, y);
        y += 10;

        const imgSize = 55;
        let x = marginLeft;

        for (const imgUrl of this.order.images) {

          // Quebra de página automática
          if (y + imgSize > pageHeight - 20) {
            doc.addPage();
            renderHeader();
            x = marginLeft;
            y = marginTop + 30;
          }

          try {
            const imgBase64 = await this.getBase64FromUrl(imgUrl);
            doc.addImage(imgBase64, 'JPEG', x, y, imgSize, imgSize);
          } catch (e) {
            console.error('Erro ao carregar imagem:', e);
          }

          x += imgSize + 10;

          // Quebra horizontal
          if (x + imgSize > pageWidth - marginRight) {
            x = marginLeft;
            y += imgSize + 10;
          }
        }

        y += imgSize + 10;
      }

      // ==================== FOOTER ==========================================
      const today = new Date().toLocaleDateString('pt-BR');
      doc.setFontSize(10).setFont('helvetica', 'italic');
      doc.text(`Emitido em: ${today}`, marginLeft, pageHeight - 10);

      // ==================== ABRIR EM NOVA ABA ==============================
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      window.open(url);
    }


  },
};
</script>
