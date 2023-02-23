
<template>
    <v-container class="pl-10 pr-10">
        <v-card class="mb-12 pl-8" height="490px">
            <svg ref="chart1"></svg>
            <svg ref="chart2"></svg>
            <svg ref="chart3"></svg>
        </v-card>

        <v-btn color="primary" @click="nextStep">
            Continue
        </v-btn>

        <v-btn text @click="previousStep">Back</v-btn>
    </v-container>
</template>

<script>
import * as d3 from "d3";


export default {
    data() {
        return {
            torques: [],
            times: [],
            posAnats: [],
            velocities: [],
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
                d3.select(this.$refs.chart1).selectAll('g').remove();
                d3.select(this.$refs.chart2).selectAll('g').remove();
                d3.select(this.$refs.chart3).selectAll('g').remove();
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
                this.posAnats = data.map(point => parseFloat(point.posAnat));
                this.velocities = data.map(point => parseFloat(point.velocity));

                this.drawChart();
            };
            reader.readAsText(file);
        },
        drawChart() {
            const margin = { top: 20, right: 20, bottom: 30, left: 50 };
            const width = 900 - margin.left - margin.right;
            const height = 150 - margin.top - margin.bottom;

            const svg1 = d3.select(this.$refs.chart1)
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', `translate(${margin.left}, ${margin.top})`);

            const svg2 = d3.select(this.$refs.chart2)
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', `translate(${margin.left}, ${margin.top})`);

            const svg3 = d3.select(this.$refs.chart3)
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', `translate(${margin.left}, ${margin.top})`);

            const x = d3.scaleLinear()
                .domain(d3.extent(this.times))
                .range([0, width]);

            const y1 = d3.scaleLinear()
                .domain(d3.extent(this.torques))
                .range([height, 0]);
            const y2 = d3.scaleLinear()
                .domain(d3.extent(this.posAnats))
                .range([height, 0]);
            const y3 = d3.scaleLinear()
                .domain(d3.extent(this.velocities))
                .range([height, 0]);

            const xAxis = d3.axisBottom(x);

            const yAxis1 = d3.axisLeft(y1);
            const yAxis2 = d3.axisLeft(y2);
            const yAxis3 = d3.axisLeft(y3);

            svg1.append('g')
                .attr('transform', `translate(0, ${height})`)
                .call(xAxis);
            svg1.append('g')
                .call(yAxis1)
            svg1.append('path')
                .datum(this.torques)
                .attr('fill', 'none')
                .attr('stroke', 'steelblue')
                .attr('stroke-width', 1.5)
                .attr('d', d3.line()
                    .x((d, i) => x(this.times[i]))
                    .y(d => y1(d))
                );
            svg2.append('g')
                .attr('transform', `translate(0, ${height})`)
                .call(xAxis);
            svg2.append('g')
                .call(yAxis2)
            svg2.append('path')
                .datum(this.posAnats)
                .attr('fill', 'none')
                .attr('stroke', 'steelblue')
                .attr('stroke-width', 1.5)
                .attr('d', d3.line()
                    .x((d, i) => x(this.times[i]))
                    .y(d => y2(d))
                );

            svg3.append('g')
                .attr('transform', `translate(0, ${height})`)
                .call(xAxis);
            svg3.append('g')
                .call(yAxis3)
            svg3.append('path')
                .datum(this.velocities)
                .attr('fill', 'none')
                .attr('stroke', 'steelblue')
                .attr('stroke-width', 1.5)
                .attr('d', d3.line()
                    .x((d, i) => x(this.times[i]))
                    .y(d => y3(d))
                );


        },


    },



}
</script>