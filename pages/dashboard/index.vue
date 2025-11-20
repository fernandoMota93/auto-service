<template>
  <div>
    <h3>Dashboard Administrativa</h3>

    <!-- SELECT FILTRO -->
    <b-card class="mb-3 p-2">
      <b-row>
        <b-col cols="12" md="3">
          <label>Filtrar por período:</label>
          <b-form-select
            v-model="selectedRange"
            :options="dateRangeOptions"
            @change="applyDateFilter"
          />
        </b-col>
      </b-row>
    </b-card>

    <!-- CARDS -->
    <b-card class="p-2">
      <b-row>
        <b-col cols="12" md="3">
          <div class="card-box aberta mb-2">
            <h4>OS Abertas</h4>
            <p>{{ osAbertas.length }}</p>
          </div>
        </b-col>

        <b-col cols="12" md="3">
          <div class="card-box encerrada mb-2">
            <h4>OS Encerradas</h4>
            <p>{{ osEncerradas.length }}</p>
          </div>
        </b-col>

        <b-col cols="12" md="3">
          <div class="card-box andamento mb-2">
            <h4>Em Andamento</h4>
            <p>{{ osEmAndamento.length }}</p>
          </div>
        </b-col>

        <b-col cols="12" md="3">
          <div class="card-box total mb-2">
            <h4>Total</h4>
            <p>{{ filteredList.length }}</p>
          </div>
        </b-col>
      </b-row>
    </b-card>

    <!-- GRÁFICO -->
    <b-card class="mt-5" title="OS Aberta por mês">
      <b-row>
        <b-col cols="12">
          <OsByMonthChart :osList="filteredList" />
        </b-col>
      </b-row>
    </b-card>
  </div>
</template>

<script>
import dashboardService from "~/services/dashboardService";
import OsByMonthChart from "./components/OsByMonthChart.vue";

export default {
  components: { OsByMonthChart },

  data() {
    return {
      osList: [],
      filteredList: [],

      selectedRange: null,

      dateRangeOptions: [
        { value: null, text: "Selecionar período" },
        { value: "today", text: "Hoje" },
        { value: "last7", text: "Últimos 7 dias" },
        { value: "last30", text: "Últimos 30 dias" },
        { value: "last6m", text: "Últimos 6 meses" },
        { value: "last1y", text: "Último ano" }
      ]
    };
  },

  computed: {
    osAbertas() {
      return this.filteredList.filter(os => os.status === "open");
    },
    osEncerradas() {
      return this.filteredList.filter(os => os.status === "done");
    },
    osEmAndamento() {
      return this.filteredList.filter(os => os.status === "in_progress");
    }
  },

  methods: {
    applyDateFilter() {
      if (!this.selectedRange) {
        this.filteredList = this.osList;
        return;
      }

      const now = new Date();
      let start = null;

      switch (this.selectedRange) {
        case "today":
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case "last7":
          start = new Date(now.setDate(now.getDate() - 7));
          break;
        case "last30":
          start = new Date(now.setDate(now.getDate() - 30));
          break;
        case "last6m":
          start = new Date(now.setMonth(now.getMonth() - 6));
          break;
        case "last1y":
          start = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
      }

      this.filteredList = this.osList.filter(os => {
        if (!os.created_at) return false;

        const d = os.created_at.toDate
          ? os.created_at.toDate()
          : new Date(os.created_at.seconds * 1000);

        return d >= start;
      });
    }
  },

  async mounted() {
    this.osList = await dashboardService.listAll();
    this.filteredList = this.osList; // inicia sem filtro
  }
};
</script>


<style scoped>
.cards {
  flex-wrap: wrap;
}

.card-box {
  padding: 20px 25px;
  border-radius: 10px;
  text-align: center;
  color: white;

}

.aberta {
  background: #938700;
}

.andamento {
  background: #0a4878;
}


.encerrada {
  background: #00E396;
}

.total {
  background: #775DD0;
}

.card-box h4 {
  margin: 0;
  font-size: 17px;
}

.card-box p {
  margin: 10px 0 0;
  font-size: 30px;
  font-weight: bold;
}
</style>
