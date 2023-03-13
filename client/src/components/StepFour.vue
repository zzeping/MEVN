<template>
    <v-container class="pl-10 pr-10">
        <v-card class="mb-8 pl-8" height="490px">
            <svg ref="chart1"></svg>
            <svg ref="chart2"></svg>
            <svg ref="chart3"></svg>
        </v-card>

        <v-row class="text-center">
            <v-col md="6" class="d-flex justify-left">
                <v-btn color="primary" @click="previousStep">back</v-btn>
            </v-col>
            <v-col md="6" class="d-flex justify-end">
                <v-btn color="primary">submit</v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import * as d3 from "d3";

export default {
    data() {
        return {
            x_h: [],
            y_h: [],
            x_q: [],
            y_q: [],
        };
    },
    props: {
        previous: Function,
        formData: {
            type: Object,
            required: true
        },
    },
    watch: {
        'formData.viewResult'(new_view) {
            this.x_h = this.formData.x_angle_h;
            this.y_h = this.formData.y_torq_h;
            this.x_q_ = this.formData.x_angle_q;
            this.y_q = this.formData.y_torq_q;
            if (new_view) {
                this.loadResult();
            }
        },
    },
    methods: {
        previousStep() {
            this.formData.viewResult = 0;
            this.previous();
        },
        loadResult() {

            let XY_h = this.x_h.map((value, index) => ({ x: value, y: this.y_h[index] }));
            XY_h.sort((a, b) => a.x - b.x);
            const sortedXh = XY_h.map(obj => obj.x);
            const sortedYh = XY_h.map(obj => obj.y);

            // Average and smoooth curves
            let i = 0;
            let x = 0;
            let y = 0;
            let n = 0;
            let averagedXh = [];
            let averagedYh = [];

            while (i < sortedXh.length) {
                if (x === 0 || sortedXh[i] === x) {
                    y += sortedYh[i];
                    x = sortedXh[i];
                    n++;
                } else {
                    averagedXh.push(x);
                    averagedYh.push(y/n);
                    x = sortedXh[i];
                    y = sortedYh[i];
                    n = 1;
                }
                i++;
            }

            if (n !== 0) {
                averagedXh.push(x);
                averagedYh.push(y/n);
            }

            console.log(averagedXh)
            console.log(averagedYh)



            // set the size and padding of the chart
            const margin = { top: 10, right: 20, bottom: 30, left: 50 };
            const width = 700 - margin.left - margin.right;
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

            // create the scales for x and y axis
            const xScale1 = d3.scaleLinear().domain([d3.min(this.x_h), d3.max(this.x_h)]).range([0, width]);
            const yScale1 = d3.scaleLinear().domain([d3.min(this.y_h), d3.max(this.y_h)]).range([height, 0]);
            const xScale2 = d3.scaleLinear().domain([d3.min(this.x_q), d3.max(this.x_q)]).range([0, width]);
            const yScale2 = d3.scaleLinear().domain([d3.min(this.y_q), d3.max(this.y_q)]).range([height, 0]);

            // create the axes for x and y
            const xAxis1 = d3.axisBottom(xScale1);
            const yAxis1 = d3.axisLeft(yScale1);
            const xAxis2 = d3.axisBottom(xScale2);
            const yAxis2 = d3.axisLeft(yScale2);


            // add the x and y axes to the chart
            svg1.append('g').attr('class', 'x axis').attr('transform', `translate(0,${height})`).call(xAxis1);
            svg1.append('g').attr('class', 'y axis').call(yAxis1);

            // add the scatter points to the chart
            svg1
                .selectAll('circle')
                .data(this.x_h)
                .enter()
                .append('circle')
                .attr('cx', (d, i) => xScale1(this.x_h[i]))
                .attr('cy', (d, i) => yScale1(this.y_h[i]))
                .attr('r', 2)
                .attr("stroke", "#73B9D7")
                .attr("fill", "none");

        },
        smooth(y, v) {
            
        },

    }
}
</script>