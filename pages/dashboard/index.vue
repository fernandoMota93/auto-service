<template>
  <div>
    <h3>Dashboard Administrativa</h3>

    <b-card class="p-2">
      <b-row>
        <b-col cols="12" md="4">
          <div class="card-box aberta mb-2">
            <h4>OS Abertas</h4>
            <p>{{ osAbertas.length }}</p>
          </div>
        </b-col>
        <b-col cols="12" md="4">
          <div class="card-box encerrada mb-2">
            <h4>OS Encerradas</h4>
            <p>{{ osEncerradas.length }}</p>
          </div>
        </b-col>
        <b-col cols="12" md="4">
          <div class="card-box total mb-2">
            <h4>Total</h4>
            <p>{{ osList.length }}</p>
          </div>
        </b-col>
      </b-row>
    </b-card>

    <b-card class="mt-5" title="OS Aberta por mês">
      <b-row>
        <b-col cols="12">
          <OsByMonthChart :osList="osList" />

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
      osList: []
    };
  },

  computed: {
    osAbertas() {
      return this.osList.filter(os => os.status === "open");
    },
    osEncerradas() {
      return this.osList.filter(os => os.status === "done");
    }
  },

  async mounted() {
    this.osList = await dashboardService.listAll();
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
  background: #008FFB;
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
