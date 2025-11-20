<template>
    <div>
        <apexchart type="bar" height="350" :options="chartOptions" :series="series" />
    </div>
</template>

<script>
export default {
    props: {
        osList: { type: Array, required: true }
    },

    computed: {
        grouped() {
            const map = {};

            this.osList.forEach(os => {
                if (!os.created_at) return;

                let d;

                // Se for Timestamp do Firestore
                if (os.created_at.toDate) {
                    d = os.created_at.toDate();
                }
                // Se vier como { seconds, nanoseconds }
                else if (os.created_at.seconds) {
                    d = new Date(os.created_at.seconds * 1000);
                }
                else {
                    return;
                }

                const key = `${d.getMonth() + 1}/${d.getFullYear()}`;

                if (!map[key]) map[key] = 0;
                map[key]++;
            });

            return map;
        },

        series() {
            return [
                {
                    name: "OS abertas",
                    data: Object.values(this.grouped)
                }
            ];
        },

        chartOptions() {
            return {
                chart: {
                    id: "os-mes"
                },
                xaxis: {
                    categories: Object.keys(this.grouped)
                },
                plotOptions: {
                    bar: {
                        distributed: true
                    }
                },
                colors: ["#008FFB"],
                dataLabels: {
                    enabled: true
                },
                tooltip: {
                    enabled: true,
                }
            };
        }
    }
};
</script>
