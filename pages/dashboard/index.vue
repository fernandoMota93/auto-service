<template>
  <div>
    <h3>Dashboard Administrativa</h3>

    <!-- SELECT FILTRO -->
    <b-card class="mb-3 p-2">
      <b-row>
        <b-col cols="12" md="3">
          <label>Filtrar por período:</label>
          <b-form-select v-model="selectedRange" :options="dateRangeOptions" @change="applyDateFilter" />
        </b-col>
      </b-row>
    </b-card>

    <!-- CARDS -->
    <b-card class="p-2" title="Resumo das Ordens de Serviço">
      <b-row>
        <b-col cols="12" md="2">
          <div class="card-box aberta mb-2">
            <h4>Abertas</h4>
            <p>{{ osAbertas.length }}</p>
          </div>
        </b-col>

        <b-col cols="12" md="2">
          <div class="card-box encerrada mb-2">
            <h4>Finalizadas</h4>
            <p>{{ osEncerradas.length }}</p>
          </div>
        </b-col>

        <b-col cols="12" md="2">
          <div class="card-box andamento mb-2">
            <h4>Andamento</h4>
            <p>{{ osEmAndamento.length }}</p>
          </div>
        </b-col>

                <b-col cols="12" md="2">
          <div class="card-box espera mb-2">
            <h4>Em espera</h4>
            <p>{{ osEspera.length }}</p>
          </div>
        </b-col>

        <b-col cols="12" md="2">
          <div class="card-box cancelada mb-2">
            <h4>Canceladas</h4>
            <p>{{ osCancelada.length }}</p>
          </div>
        </b-col>
        <b-col cols="12" md="2">
          <div class="card-box total mb-2">
            <h4>Total</h4>
            <p>{{ filteredList.length }}</p>
          </div>
        </b-col>
      </b-row>
    </b-card>

    <!-- GRÁFICO -->
    <b-card class="my-5" title="OS Aberta por mês">
      <b-row>
        <b-col cols="12">
          <OsByMonthChart :osList="filteredList" />
        </b-col>
      </b-row>
    </b-card>

    <b-card class="mt-4">
      <h4 class="mb-3">Resumo Financeiro</h4>

      <b-row>
        <!-- Abertas -->
        <b-col cols="12" md="4">
          <div class="finance-box aberta">
            <div class="label"><b-icon icon="folder-plus"></b-icon> Abertas</div>
            <div class="value">
              {{ totalGeral(osAbertas).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
            </div>
          </div>
        </b-col>
        <!-- Em andamento -->
        <b-col cols="12" md="4">
          <div class="finance-box andamento">
            <div class="label"><b-icon icon="tools"></b-icon> Em andamento</div>
            <div class="value">
              {{ totalGeral(osEmAndamento).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
            </div>
          </div>
        </b-col>



        <!-- Finalizadas -->
        <b-col cols="12" md="4">
          <div class="finance-box encerrada">
            <div class="label"><b-icon icon="check-circle"></b-icon> Finalizadas</div>
            <div class="value">
              {{ totalGeral(osEncerradas).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
            </div>
          </div>
        </b-col>

        <!-- Canceladas -->
        <b-col cols="12" md="4">
          <div class="finance-box espera">
            <div class="label"><b-icon icon="x-circle"></b-icon> Em Espera</div>
            <div class="value">
              {{ totalGeral(osEspera).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
            </div>
          </div>
        </b-col>
          <!-- Canceladas -->
        <b-col cols="12" md="4">
          <div class="finance-box cancelada">
            <div class="label"><b-icon icon="x-circle"></b-icon> Canceladas</div>
            <div class="value">
              {{ totalGeral(osCancelada).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
            </div>
          </div>
        </b-col>
      </b-row>
      <b-card class="mt-4" title="Comparativo Financeiro">
        <b-row>
          <b-col cols="12" md="6">
            <BarFinanceChart :values="{
              open: totalGeral(osAbertas),
              progress: totalGeral(osEmAndamento),
              done: totalGeral(osEncerradas),
              canceled: totalGeral(osCancelada)
            }" />
          </b-col>

          <b-col cols="12" md="6">
            <PieFinanceChart :values="{
              open: totalGeral(osAbertas),
              progress: totalGeral(osEmAndamento),
              done: totalGeral(osEncerradas),
              canceled: totalGeral(osCancelada)
            }" />
          </b-col>
        </b-row>
      </b-card>

    </b-card>

  </div>
</template>

<script>
import dashboardService from "~/services/dashboardService";
import OsByMonthChart from "./components/OsByMonthChart.vue";
import BarFinanceChart from './components/BarFinanceChart.vue'
import PieFinanceChart from './components/PieFinanceChart.vue'


export default {
  components: {
    OsByMonthChart, BarFinanceChart,
    PieFinanceChart
  },

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
    },
    osCancelada() {
      return this.filteredList.filter(os => os.status === "canceled");
    },
    osEspera() {
      return this.filteredList.filter(os => os.status === "on_hold");
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

      let filtered = this.osList.filter(o => !o.is_deleted);


      this.filteredList = filtered.filter(os => {
        if (!os.created_at) return false;

        const d = os.created_at.toDate
          ? os.created_at.toDate()
          : new Date(os.created_at.seconds * 1000);

        return d >= start;
      });
    },
    totalGeral(osList) {
      if (!Array.isArray(osList)) return 0;

      return osList.reduce((accOS, os) => {
        // ignora OS sem services
        if (!Array.isArray(os.services)) return accOS;

        const totalOS = os.services.reduce(
          (accService, s) => accService + (Number(s.value) || 0),
          0
        );

        return accOS + totalOS;
      }, 0);
    }

  },

  async mounted() {

    this.osList = await dashboardService.listAll();
    
    this.filteredList = this.osList;
    this.selectedRange = 'last7'
    this.applyDateFilter()
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
  background: #ffbb00;
}

.andamento {
  background: #0a4878;
}


.encerrada {
  background: #00E396;
}

.cancelada {
  background: #ff4949;
}

.espera {
  background: #5f5f5f;
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

.finance-box {
  padding: 18px 20px;
  border-radius: 12px;
  color: #fff;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.finance-box .label {
  font-size: 15px;
  opacity: 0.9;
  display: flex;
  align-items: center;
  gap: 6px;
}

.finance-box .value {
  font-size: 26px;
  font-weight: bold;
  margin-top: 4px;
}

/* Cores harmonizadas */
.finance-box.andamento {
  background: #0a4878;
}

.finance-box.aberta {
  background: #ffbb00;
}

.finance-box.encerrada {
  background: #00c983;
}

.finance-box.cancelada {
  background: #ff4949;
}
</style>
