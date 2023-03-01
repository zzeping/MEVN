
<template>
    <v-container class="pl-10 pr-10">
        <v-card class="mb-8 pl-8" height="490px">
            <svg ref="chart1"></svg>
            <svg ref="chart2"></svg>
            <svg ref="chart3"></svg>
        </v-card>

        <v-row class="text-center">
            <v-col md="4" class="d-flex justify-left">
                <v-btn color="primary" @click="previousStep">back</v-btn>
            </v-col>
            <v-col md="4">
                <v-btn outlined color="primary" @click="nextStep">I am not satisfied</v-btn>
            </v-col>
            <v-col md="4" class="d-flex justify-end">
                <v-btn color="primary" @click="viewResult">view result</v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import * as d3 from "d3";


export default {
    data() {
        return {
            index: [],
            torques: [],
            times: [],
            posAnats: [],
            velocities: [],
            velocityLimits: [],
            indexArr: [],
            torquesArr: [],
            timesArr: [],
            posAnatsArr: [],
            velocitiesArr: [],
            fileContent: '',
            sectionPoints: [0],
            numSections: 1,

        }
    },
    props: {
        next: Function,
        previous: Function,
        result: Function,
        formData: {
            type: Object,
            required: true
        },
    },
    watch: {
        'formData.dataFile'(new_file) {
            if (new_file != null) {
                this.indexArr = [];
                this.torquesArr = [];
                this.timesArr = [];
                this.velocitiesArr = [];
                this.posAnatsArr = [];
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
        viewResult() {
            this.result();
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
                this.index = Array.from({ length: this.times.length }, (_, i) => i);
                this.applyVelocityFiltering();
                this.drawChart();
            };
            reader.readAsText(file);
        },

        // obtain the processed array, which is the filtered data based on velocity
        applyVelocityFiltering() {
            // calculate the velMax
            let temp = [];
            for (let i = 0; i < this.velocities.length; i++) {
                if (Math.abs(this.velocities[i]) !== 0) {
                    temp.push(this.velocities[i]);
                }
            }
            const mode = arr => arr.reduce((a, b, c, d) => arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b);
            let velMax = Math.abs(Math.round(mode(temp) / 10) * 10);

            // apply velocity filter
            let velocityLimits = [];
            velocityLimits[0] = velMax + Math.abs(velMax * this.formData.velTol);
            velocityLimits[1] = velMax - Math.abs(velMax * this.formData.velTol);
            velocityLimits[2] = -velMax + Math.abs(velMax * this.formData.velTol);
            velocityLimits[3] = -velMax - Math.abs(velMax * this.formData.velTol);
            for (let i = 0; i < this.times.length; i++) {
                if ((this.velocities[i] <= velocityLimits[0] && this.velocities[i] >= velocityLimits[1]) ||
                    (this.velocities[i] <= velocityLimits[2] && this.velocities[i] >= velocityLimits[3])) {
                    this.torquesArr.push(this.torques[i]);
                    this.timesArr.push(this.times[i]);
                    this.posAnatsArr.push(this.posAnats[i]);
                    this.velocitiesArr.push(this.velocities[i]);
                    this.indexArr.push(this.index[i]);
                }
            }
            this.creatSectionData();
            // filter according to specified range of angle motion: 80 for concentric; 65 for eccentric 
            for (let i = this.numSections * 2 - 1; i >= 0; i -= 2) {
                if (Math.abs(this.posAnatsArr[this.sectionPoints[i - 1]] - this.posAnatsArr[this.sectionPoints[i]]) < 80) {
                    this.indexArr.splice(this.sectionPoints[i - 1], this.sectionPoints[i] - this.sectionPoints[i - 1] + 1);
                    this.posAnatsArr.splice(this.sectionPoints[i - 1], this.sectionPoints[i] - this.sectionPoints[i - 1] + 1);
                    this.timesArr.splice(this.sectionPoints[i - 1], this.sectionPoints[i] - this.sectionPoints[i - 1] + 1);
                    this.torquesArr.splice(this.sectionPoints[i - 1], this.sectionPoints[i] - this.sectionPoints[i - 1] + 1);
                    this.velocitiesArr.splice(this.sectionPoints[i - 1], this.sectionPoints[i] - this.sectionPoints[i - 1] + 1);
                }
            }
            this.creatSectionData();



        },

        // create section data, sectionPoints stores the starts and ends of all sections. 
        creatSectionData() {
            this.numSections = 1;
            this.sectionPoints = [0];
            //Look for non-contiguous values in the index column
            for (let i = 0; i < this.indexArr.length - 1; i++) {
                while (this.indexArr[i + 1] - this.indexArr[i] !== 1) {
                    this.numSections++;
                    this.sectionPoints.push(i, i + 1);
                    break;
                }
            }
            this.sectionPoints.push(this.indexArr.length - 1);
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
                .call(xAxis)
                .append("text")
                .style("fill", "black")
                .attr('text-anchor', 'end')
                .attr('x', width)
                .attr('y', margin.bottom - 3)
                .text('Time (ms)');

            svg1.append('g')
                .call(yAxis1)
                .append("text")
                .attr("text-anchor", "end")
                .attr("transform", "rotate(-90)")
                .attr("y", -margin.left + 20)
                .attr("x", -margin.top)
                .attr("fill", "black")
                .text("Torque (N*m)");
            svg1.append('path')
                .datum(this.torques)
                .attr('fill', 'none')
                .attr('stroke', '#0f6e2f')
                .attr('stroke-width', 1.5)
                .attr('d', d3.line()
                    .x((d, i) => x(this.times[i]))
                    .y(d => y1(d))
                );

            svg1.selectAll("circle")
                .data(this.torquesArr)
                .enter()
                .append("circle")
                .attr("cx", (d, i) => x(this.timesArr[i]))
                .attr("cy", d => y1(d))
                .attr("r", 3)
                .attr("stroke", "rgba(115,185,215,0.7)")
                .attr("fill", "none");

            svg2.append('g')
                .attr('transform', `translate(0, ${height})`)
                .call(xAxis)
                .append("text")
                .attr('text-anchor', 'end')
                .attr('x', width)
                .attr('y', margin.bottom - 3)
                .style("fill", "black")
                .text('Time (ms)');

            svg2.append('g')
                .call(yAxis2)
                .append("text")
                .attr("text-anchor", "end")
                .attr("transform", "rotate(-90)")
                .attr("y", -margin.left + 20)
                .attr("x", -margin.top)
                .attr("fill", "black")
                .text("Angle (Degrees)");
            svg2.append('path')
                .datum(this.posAnats)
                .attr('fill', 'none')
                .attr('stroke', '#0f6e2f')
                .attr('stroke-width', 1.5)
                .attr('d', d3.line()
                    .x((d, i) => x(this.times[i]))
                    .y(d => y2(d))
                );

            svg2.selectAll("circle")
                .data(this.posAnatsArr)
                .enter()
                .append("circle")
                .attr("cx", (d, i) => x(this.timesArr[i]))
                .attr("cy", d => y2(d))
                .attr("r", 3)
                .attr("stroke", "rgba(115,185,215,0.7)")
                .attr("fill", "none");

            svg3.append('g')
                .attr('transform', `translate(0, ${height})`)
                .call(xAxis)
                .append("text")
                .attr('text-anchor', 'end')
                .attr('x', width)
                .attr('y', margin.bottom - 3)
                .style("fill", "black")
                .text('Time (ms)');

            svg3.append('g')
                .call(yAxis3)
                .append("text")
                .attr("text-anchor", "end")
                .attr("transform", "rotate(-90)")
                .attr("y", -margin.left + 20)
                .attr("x", -margin.top)
                .attr("fill", "black")
                .text("Velocity (Deg/sec)");

            svg3.append('path')
                .datum(this.velocities)
                .attr('fill', 'none')
                .attr('stroke', '#0f6e2f')
                .attr('stroke-width', 1.5)
                .attr('d', d3.line()
                    .x((d, i) => x(this.times[i]))
                    .y(d => y3(d))
                );
            svg3.selectAll("circle")
                .data(this.velocitiesArr)
                .enter()
                .append("circle")
                .attr("cx", (d, i) => x(this.timesArr[i]))
                .attr("cy", d => y3(d))
                .attr("r", 3)
                .attr("stroke", "rgba(115,185,215,0.7)")
                .attr("fill", "none");

        },


    },



}
</script>