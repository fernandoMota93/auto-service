<template>
  <div>
    <apexchart
      type="pie"
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
        this.values.open,
        this.values.progress,
        this.values.done,
        this.values.canceled
      ];
    },

    chartOptions() {
      return {
        labels: ["Abertas", "Andamento", "Finalizadas", "Canceladas"],
        colors: ["#ffbb00", "#0a4878", "#00c983", "#ff4949"],
        legend: {
          position: "bottom"
        }
      };
    }
  }
};
</script>

<style scoped>
</style>
