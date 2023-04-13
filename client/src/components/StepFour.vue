<template>
    <v-container class="pl-10 pr-10">
        <v-card class="mb-8 pl-8" height="490px">
            <svg ref="chart2"></svg>
            <svg ref="chart1"></svg>
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
        auto: Function,
        formData: {
            type: Object,
            required: true
        },
    },
    watch: {
        'formData.viewResult'(new_view) {
            this.clearChart();
            if (this.formData.manual == 1) {
                this.x_h = this.formData.x_angle_h_m;
                this.y_h = this.formData.y_torq_h_m;
                this.x_q = this.formData.x_angle_q_m;
                this.y_q = this.formData.y_torq_q_m;
            } else {
                this.x_h = this.formData.x_angle_h;
                this.y_h = this.formData.y_torq_h;
                this.x_q = this.formData.x_angle_q;
                this.y_q = this.formData.y_torq_q;
            }

            if (new_view) {
                this.loadResult();
            }
        },
    },
    methods: {
        previousStep() {
            this.formData.viewResult = 0;
            if (this.formData.manual == 1) {
                this.previous();
            } else {
                this.auto();
            }

        },
        clearChart() {
            d3.select(this.$refs.chart1).selectAll('g').remove();
            d3.select(this.$refs.chart2).selectAll('g').remove();
            d3.select(this.$refs.chart3).selectAll('g').remove();
        },
        loadResult() {

            let XY_h = this.x_h.map((value, index) => ({ x: value, y: this.y_h[index] }));
            XY_h.sort((a, b) => a.x - b.x);
            let sortedXh = XY_h.map(obj => obj.x);
            let sortedYh = XY_h.map(obj => obj.y);

            // Average and smoooth curves
            let i = 0;
            let x = 0;
            let y = 0;
            let n = 0;
            let averagedXh = [];
            let averagedYh = [];
            let averagedXq = [];
            let averagedYq = [];

            while (i < sortedXh.length) {
                if (x === 0 || sortedXh[i] === x) {
                    y += sortedYh[i];
                    x = sortedXh[i];
                    n++;
                } else {
                    averagedXh.push(x);
                    averagedYh.push(y / n);
                    x = sortedXh[i];
                    y = sortedYh[i];
                    n = 1;
                }
                i++;
            }

            if (n !== 0) {
                averagedXh.push(x);
                averagedYh.push(y / n);
            }
            if (averagedXh[averagedXh.length - 1] - averagedXh[0] + 1 == averagedXh.length) {
                averagedYh = this.moving(averagedYh, 10);
            } else {
                console.log("lowess")
            }
            let avg_h = averagedXh.map(function (d, i) { return { x: d, y: averagedYh[i] }; });

            // same for quadriceps
            i = 0;
            x = 0;
            y = 0;
            n = 0;
            let XY_q = this.x_q.map((value, index) => ({ x: value, y: this.y_q[index] }));
            XY_q.sort((a, b) => a.x - b.x);
            const sortedXq = XY_q.map(obj => obj.x);
            const sortedYq = XY_q.map(obj => obj.y);

            while (i < sortedXq.length) {
                if (x === 0 || sortedXq[i] === x) {
                    y += sortedYq[i];
                    x = sortedXq[i];
                    n++;
                } else {
                    averagedXq.push(x);
                    averagedYq.push(y / n);
                    x = sortedXq[i];
                    y = sortedYq[i];
                    n = 1;
                }
                i++;
            }

            if (n !== 0) {
                averagedXq.push(x);
                averagedYq.push(y / n);
            }
            if (averagedXq[averagedXq.length - 1] - averagedXq[0] + 1 == averagedXq.length) {
                averagedYq = this.moving(averagedYq, 10);
            } else {
                console.log("lowess")
            }
            let avg_q = averagedXq.map(function (d, i) { return { x: d, y: averagedYq[i] }; });
            console.log(averagedYh)
            console.log(avg_h)

            var commonX = [];
            var ratio = [];

            for (var k = 0; k < averagedXh.length; k++) {
                if (averagedXq.includes(averagedXh[k])) {
                    var j = averagedXq.indexOf(averagedXh[k]);
                    commonX.push(averagedXh[k]);
                    ratio.push(averagedYh[k] / averagedYq[j]);
                }
            }

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
            const xScale3 = d3.scaleLinear().domain([d3.min(commonX), d3.max(commonX)]).range([0, width]);
            const yScale3 = d3.scaleLinear().domain([d3.min(ratio), d3.max(ratio)]).range([height, 0]);

            // create the axes for x and y
            const xAxis1 = d3.axisBottom(xScale1);
            const yAxis1 = d3.axisLeft(yScale1);
            const xAxis2 = d3.axisBottom(xScale2);
            const yAxis2 = d3.axisLeft(yScale2);


            // add the x and y axes to the chart
            svg1.append('g').attr('class', 'x axis').attr('transform', `translate(0,${height})`).call(xAxis1);
            svg1.append('g').attr('class', 'y axis').call(yAxis1);

            // add the scatter points to the chart
            svg1.selectAll('circle')
                .data(this.x_h)
                .enter()
                .append('circle')
                .attr('cx', (d, i) => xScale1(this.x_h[i]))
                .attr('cy', (d, i) => yScale1(this.y_h[i]))
                .attr('r', 2)
                .attr("stroke", "#73B9D7")
                .attr("fill", "none");

            svg1.append("path")
                .datum(avg_h)
                .attr("d", d3.line()
                    .x(function (d) { return xScale1(d.x); })
                    .y(function (d) { return yScale1(d.y); }))
                .attr("stroke", "black")
                .attr("stroke-width", 1)
                .attr("fill", "none");

            // add the x and y axes to the chart
            svg2.append('g').attr('class', 'x axis').attr('transform', `translate(0,${height})`).call(xAxis2);
            svg2.append('g').attr('class', 'y axis').call(yAxis2);

            // add the scatter points to the chart
            svg2
                .selectAll('circle')
                .data(this.x_q)
                .enter()
                .append('circle')
                .attr('cx', (d, i) => xScale2(this.x_q[i]))
                .attr('cy', (d, i) => yScale2(this.y_q[i]))
                .attr('r', 2)
                .attr("stroke", "#73B9D7")
                .attr("fill", "none");
            svg2.append("path")
                .datum(avg_q)
                .attr("d", d3.line()
                    .x(function (d) { return xScale2(d.x); })
                    .y(function (d) { return yScale2(d.y); }))
                .attr("stroke", "black")
                .attr("stroke-width", 1)
                .attr("fill", "none");

            // add the line to the SVG element
            svg3.append("path")
                .datum(ratio)
                .attr("d", d3.line()
                    .x(function (d, i) { return xScale3(commonX[i]); })
                    .y(function (d, i) { return yScale3(ratio[i]); }))
                .attr("stroke", "black")
                .attr("stroke-width", 1)
                .attr("fill", "none");

            // add the x-axis
            svg3.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(xScale3));

            // add the y-axis
            svg3.append("g")
                .call(d3.axisLeft(yScale3));


        },
        moving(y, span) {
            span = Math.floor(span);
            var n = y.length;
            span = Math.min(span, n);
            var width = span - 1 + (span % 2); // force it to be odd
            var c = new Array(n).fill(0);
            c[0]=y[0];
            for (var i = 0; i < n; i++) {
                var sum = 0;
                if (i - Math.floor(width / 2) >= 0) {
                    for (var j = i - Math.floor(width / 2); j <= i + Math.floor(width / 2); j++) {
                        if (j >= 0 && j < n) {
                            sum += y[j];
                        }
                    }
                    c[i] = sum / width;
                } else {
                    for (var j = 0; j <= 2*i; j++) {
                        if (j < n) {
                            sum += y[j];
                        }
                    }
                    c[i] = sum / (2*i+1);
                }

            }
            return c;
        },

    }
}
</script>