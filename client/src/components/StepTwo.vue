
<template>
    <div>
        <v-card class="mb-12" height="400px">
            <svg ref="chart"></svg>
        </v-card>

        <v-btn color="primary" @click="nextStep">
            Continue
        </v-btn>

        <v-btn text @click="previousStep">Back</v-btn>
    </div>
</template>

<script>
import * as d3 from "d3";


export default {
    data() {
        return {
            torques: [],
            times: [],
            fileContent: '',
        }
    },
    props: {
        next: Function,
        previous: Function,
        formData: {
            type: Object,
            required: true
        },
    },
    watch: {
        'formData.dataFile'(new_file) {
            if (new_file != null) {
                d3.select(this.$refs.chart).selectAll('g').remove();
                this.loadDataFile(new_file);
            }
        }
    },
    methods: {
        nextStep() {
            this.next();
        },
        previousStep() {
            this.previous();
        },
        loadDataFile(file) {
            let reader = new FileReader();
            reader.onload = (e) => {
                this.fileContent = e.target.result;
                const lines = this.fileContent.split('\n');
                this.formData.test_time = lines[1];
                const data = lines.slice(6)
                    .filter(line => {
                        const [a, time, torque, position, posAnat, velocity] = line.split(/\s+/);
                        return !isNaN(a) && !isNaN(time) && !isNaN(torque) && !isNaN(position) && !isNaN(posAnat) && !isNaN(velocity);
                    })
                    .map(line => {
                        const [a, time, torque, position, posAnat, velocity] = line.split(/\s+/);
                        return { a, time, torque, position, posAnat, velocity };
                    });
                this.times = data.map(point => parseFloat(point.time));
                this.torques = data.map(point => parseFloat(point.torque));
                const posAnats = data.map(point => parseFloat(point.posAnat));
                const velocities = data.map(point => parseFloat(point.velocity));
                console.log(this.times);
                console.log(this.torques);
                this.drawChart();
            };
            reader.readAsText(file);
        },
        drawChart() {
            const margin = { top: 20, right: 20, bottom: 30, left: 50 };
            const width = 900 - margin.left - margin.right;
            const height = 300 - margin.top - margin.bottom;

            const svg = d3.select(this.$refs.chart)
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', `translate(${margin.left}, ${margin.top})`);

            const x = d3.scaleLinear()
                .domain(d3.extent(this.times))
                .range([0, width]);

            const y = d3.scaleLinear()
                .domain(d3.extent(this.torques))
                .range([height, 0]);

            const xAxis = d3.axisBottom(x);

            const yAxis = d3.axisLeft(y);

            svg.append('g')
                .attr('transform', `translate(0, ${height})`)
                .call(xAxis);
            svg.append('g')
                .call(yAxis)

            svg.append('path')
                .datum(this.torques)
                .attr('fill', 'none')
                .attr('stroke', 'steelblue')
                .attr('stroke-width', 1.5)
                .attr('d', d3.line()
                    .x((d, i) => x(this.times[i]))
                    .y(d => y(d))
                );

        },


    },



}
</script>