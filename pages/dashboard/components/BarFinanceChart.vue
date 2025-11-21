<template>
  <div>
    <apexchart
      type="bar"
      height="300"
      :options="chartOptions"
      :series="chartSeries"
    />
  </div>
</template>

<script>
export default {
  props: {
    values: {
      type: Object,
      required: true
    }
  },

  computed: {
    chartSeries() {
      return [
        {
          name: "Valores (R$)",
          data: [
            this.values.open,
            this.values.progress,
            this.values.done,
            this.values.canceled
          ]
        }
      ];
    },

    chartOptions() {
      return {
        chart: {
          toolbar: { show: false }
        },
        xaxis: {
          categories: ["Abertas", "Andamento", "Finalizadas", "Canceladas"]
        },
        colors: ["#ffbb00", "#0a4878", "#00c983", "#ff4949"],
        plotOptions: {
          bar: {
            distributed: true,
            borderRadius: 6
          }
        },
        dataLabels: {
          enabled: false
        }
      };
    }
  }
};
</script>

<style scoped>
</style>
