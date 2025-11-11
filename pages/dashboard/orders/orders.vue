<template>
  <div>
    <b-card>
      <h4>Meus Serviços</h4>

      <div v-if="orders.length === 0" class="text-muted">
        Nenhuma ordem encontrada.
      </div>

      <b-row>
        <b-col md="6" v-for="o in orders" :key="o.id" class="mb-3">
          <b-card
            @click="$router.push(`/dashboard/orders/${o.id}`)"
            style="cursor: pointer"
          >
            <div class="d-flex justify-content-between align-items-center">
              <h5></h5>
              <b-button
                size="sm"
                variant="outline-success"
                @click="exportPDF(o)"
              >
                <b-icon icon="printer"></b-icon>
              </b-button>
            </div>
            <p class="mb-1">
              <strong>Data de criação:</strong> {{ formatDate(o.created_at) }}
            </p>
            <b-badge :variant="formatOrderStatus(o.status).color">
              {{ formatOrderStatus(o.status).label }}
            </b-badge>
            <p class="mb-1"><strong>Valor total:</strong> {{ total(o) }}</p>

            <div v-if="o.images && o.images.length">
              <h6 class="mt-2">Imagens:</h6>
              <img
                v-for="img in o.images"
                :key="img"
                :src="img"
                class="img-thumbnail mr-2"
                style="max-width: 120px"
              />
            </div>
          </b-card>
        </b-col>
      </b-row>
    </b-card>
  </div>
</template>

<script>
import jsPDF from 'jspdf';
import orderService from '~/services/orderService';
import timbradoUrl from '@/assets/images/timbrado.png';
import orderStatusMixin from '~/mixins/orderStatusMixin';

export default {
  layout: 'default',
  mixins: [orderStatusMixin],

  data() {
    return { orders: [] };
  },

  async mounted() {
    const uid = this.$store.state.user.currentUser.uid;
    this.orders = await orderService.listByUser(uid);
  },

  methods: {
    formatDate(date) {
      if (!date) return '';
      const d = date.toDate ? date.toDate() : new Date(date);
      return d.toLocaleString('pt-BR');
    },
    total(o) {
      if (!o.services) return 'R$ 0,00';
      const sum = o.services.reduce((s, it) => s + (it.value || 0), 0);
      return sum.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });
    },

    async exportPDF(o) {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Fundo timbrado
      const bg = await this.getBase64FromUrl(timbradoUrl);
      doc.addImage(bg, 'PNG', 0, 0, pageWidth, pageHeight);

      // Cabeçalho
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('Grilo Mecânica', 105, 20, { align: 'center' });
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Ordem de Serviço nº ${o.id}`, 105, 30, { align: 'center' });

      // Dados
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

      // Descrição
      doc.setFont('helvetica', 'bold');
      doc.text('Serviço(s) executado(s):', 20, y);
      y += 7;
      doc.setFont('helvetica', 'normal');

      const textLines = doc.splitTextToSize(o.description || '—', 170);
      doc.text(textLines, 20, y);
      y += textLines.length * 6 + 10;

      // Valor total
      const valor = o.services
        ? o.services.reduce((s, it) => s + (it.value || 0), 0)
        : 0;
      doc.setFont('helvetica', 'bold');
      doc.text('Valor total:', 20, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`R$ ${valor.toFixed(2).replace('.', ',')}`, 55, y);
      y += 15;

      // Galeria de imagens
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

      // Rodapé
      const today = new Date().toLocaleDateString('pt-BR');
      doc.setFontSize(10);
      doc.text(`Emitido em: ${today}`, 20, 285);

      // Abre em nova aba
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
};
</script>
