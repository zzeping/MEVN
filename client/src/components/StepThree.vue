<template>
    <v-container class="pl-10 pr-10">
        <v-row no-gutters>
            <v-col sm="10" class="mx-auto">
                <v-card class="mb-4 pl-4 pr-4" height="520px">
                    <svg ref="chart1"></svg>
                    <svg ref="chart2"></svg>
                    <svg ref="chart3"></svg>
                    <v-row class="pl-7">
                        <v-col md="8">
                            <v-row class="text-center justify-center">
                                <v-col md="3" class="d-flex py-1">
                                    <v-text-field v-model="velTol" label="velocity tolerance"></v-text-field>
                                </v-col>
                                <v-col md="3" class="d-flex py-1">
                                    <v-text-field v-model="velMax" label="max velocity"></v-text-field>
                                </v-col>
                                <v-col md="3" class="d-flex py-1">
                                    <v-text-field v-model="velMin" label="min velocity"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row class="text-center justify-center">
                                <v-col md="3" class="d-flex justify-left py-0">
                                    <v-text-field v-model="rom" label="ROM"></v-text-field>
                                </v-col>
                                <v-col md="3" class="d-flex justify-left py-0">
                                    <v-text-field v-model="romTol" label="ROM tolerance"></v-text-field>
                                </v-col>
                                <v-col md="3" class="d-flex justify-left py-0">
                                    <v-text-field v-model="torTol" label="torque tolerance"></v-text-field>
                                </v-col>
                            </v-row>
                        </v-col>
                        <v-col class="d-flex align-center">
                            <v-row class="text-center justify-start">
                                <v-btn @click="redraw">select</v-btn>
                            </v-row>
                        </v-col>
                    </v-row>


                </v-card>
            </v-col>
        </v-row>


        <v-row no-gutters class="d-flex justify-center">
            <v-col sm="5" class="d-flex justify-left">
                <v-btn color="primary" @click="previousStep">back</v-btn>
            </v-col>
            <v-col sm="5" class="d-flex justify-end">
                <v-btn color="primary" @click="nextStep">view result</v-btn>
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
            torquesArr_h: [],
            torquesArr_q: [],
            timesArr: [],
            timesArr_h: [],
            timesArr_q: [],
            posAnatsArr: [],
            posAnatsArr_h: [],
            posAnatsArr_q: [],
            velocitiesArr: [],
            velocitiesArr_h: [],
            velocitiesArr_q: [],
            sectionPoints: [0],
            numSections: 1,
            maxTorque: '',
            maxIndex: '',
            minTorque: '',
            minIndex: '',
            velTol: 0.1,
            romTol: 0.1,
            torTol: 0.1,
            rom: 0,
            velMax: 0,
            velMin: 0,
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
        'formData.manual'(new_manual) {
            this.clearChart();
            if (new_manual) {
                if (this.formData.dataType === "concentric") {
                    this.rom = 80;
                } else {
                    this.rom = 65;
                }
                this.times = this.formData.times;
                this.torques = this.formData.torques;
                this.posAnats = this.formData.posAnats;
                this.velocities = this.formData.velocities;
                this.index = this.formData.index;
                this.velMax = this.formData.velMax;
                this.velMin = -this.velMax;
                this.applyFiltering(this.formData.dataType);
                this.drawChart();
            }
        },
    },
    methods: {
        nextStep() {
            this.formData.x_angle_h_m = this.posAnatsArr_h;
            this.formData.y_torq_h_m = this.torquesArr_h;
            this.formData.x_angle_q_m = this.posAnatsArr_q;
            this.formData.y_torq_q_m = this.torquesArr_q;
            this.formData.viewResult = 1; 
            this.next();
        },
        previousStep() {
            this.formData.manual = 0;
            this.previous();
        },
        clearChart() {
            this.indexArr = [];
            this.torquesArr = [];
            this.timesArr = [];
            this.velocitiesArr = [];
            this.posAnatsArr = [];
            this.torquesArr_h = [];
            this.torquesArr_q = [];
            this.timesArr_h = [];
            this.timesArr_q = [];
            this.velocitiesArr_h = [];
            this.velocitiesArr_q = [];
            this.posAnatsArr_h = [];
            this.posAnatsArr_q = [];
            d3.select(this.$refs.chart1).selectAll('g').remove();
            d3.select(this.$refs.chart2).selectAll('g').remove();
            d3.select(this.$refs.chart3).selectAll('g').remove();
        },
        redraw() {
            this.clearChart();
            this.times = this.formData.times;
            this.torques = this.formData.torques;
            this.posAnats = this.formData.posAnats;
            this.velocities = this.formData.velocities;
            this.index = this.formData.index;
            this.applyFiltering(this.formData.dataType);
            this.drawChart();
        },
        drawChart() {
            const margin = { top: 20, right: 20, bottom: 30, left: 80 };
            const width = 800 - margin.left - margin.right;
            const height = 120 - margin.top - margin.bottom;

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
                .attr("y", -margin.left + 45)
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

            svg1.selectAll(".torques-h")
                .data(this.torquesArr_h)
                .enter()
                .append("circle")
                .attr("class", "torques-h")
                .attr("cx", (d, i) => x(this.timesArr_h[i]))
                .attr("cy", d => y1(d))
                .attr("r", 3)
                .attr("stroke", "#73B9D7")
                .attr("fill", "none");

            svg1.selectAll(".torques-q")
                .data(this.torquesArr_q)
                .enter()
                .append("circle")
                .attr("class", "torques-q")
                .attr("cx", (d, i) => x(this.timesArr_q[i]))
                .attr("cy", d => y1(d))
                .attr("r", 3)
                .attr("stroke", "#D79173")
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
                .attr("y", -margin.left + 45)
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

            svg2.selectAll(".posAn-h")
                .data(this.posAnatsArr_h)
                .enter()
                .append("circle")
                .attr("class", "posAn-h")
                .attr("cx", (d, i) => x(this.timesArr_h[i]))
                .attr("cy", d => y2(d))
                .attr("r", 3)
                .attr("stroke", "#73B9D7")
                .attr("fill", "none");

            svg2.selectAll(".posAn-q")
                .data(this.posAnatsArr_q)
                .enter()
                .append("circle")
                .attr("class", "posAn-q")
                .attr("cx", (d, i) => x(this.timesArr_q[i]))
                .attr("cy", d => y2(d))
                .attr("r", 3)
                .attr("stroke", "#D79173")
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
                .attr("y", -margin.left + 45)
                .attr("x", -margin.top + 20)
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
            svg3.selectAll(".velo-h")
                .data(this.velocitiesArr_h)
                .enter()
                .append("circle")
                .attr("class", "velo-h")
                .attr("cx", (d, i) => x(this.timesArr_h[i]))
                .attr("cy", d => y3(d))
                .attr("r", 3)
                .attr("stroke", "#73B9D7")
                .attr("fill", "none");

            svg3.selectAll(".velo-q")
                .data(this.velocitiesArr_q)
                .enter()
                .append("circle")
                .attr("class", "velo-q")
                .attr("cx", (d, i) => x(this.timesArr_q[i]))
                .attr("cy", d => y3(d))
                .attr("r", 3)
                .attr("stroke", "#D79173")
                .attr("fill", "none");

        },

        applyFiltering(type) {

            // apply velocity filter
            let velocityLimits = [];
            velocityLimits[0] = Number(this.velMax) + Math.abs(this.velMax * this.velTol);
            velocityLimits[1] = Number(this.velMax) - Math.abs(this.velMax * this.velTol);
            velocityLimits[2] = Number(this.velMin) + Math.abs(this.velMin * this.velTol);
            velocityLimits[3] = Number(this.velMin) - Math.abs(this.velMin * this.velTol);
            
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
                if (Math.abs(this.posAnatsArr[this.sectionPoints[i - 1]] - this.posAnatsArr[this.sectionPoints[i]]) < this.rom) {
                    this.indexArr.splice(this.sectionPoints[i - 1], this.sectionPoints[i] - this.sectionPoints[i - 1] + 1);
                    this.posAnatsArr.splice(this.sectionPoints[i - 1], this.sectionPoints[i] - this.sectionPoints[i - 1] + 1);
                    this.timesArr.splice(this.sectionPoints[i - 1], this.sectionPoints[i] - this.sectionPoints[i - 1] + 1);
                    this.torquesArr.splice(this.sectionPoints[i - 1], this.sectionPoints[i] - this.sectionPoints[i - 1] + 1);
                    this.velocitiesArr.splice(this.sectionPoints[i - 1], this.sectionPoints[i] - this.sectionPoints[i - 1] + 1);
                }
            }
            this.creatSectionData();

            // remove false datasets where vel pos and torque neg, and vice versa
            let len = this.indexArr.length;
            if (type === "concentric") {
                for (let i = 0; i < len; i++) {
                    if ((this.velocitiesArr[i] < 0 && this.torquesArr[i] >= 0) ||
                        (this.velocitiesArr[i] > 0 && this.torquesArr[i] <= 0)) {
                        this.torquesArr.splice(i, 1);
                        this.timesArr.splice(i, 1);
                        this.posAnatsArr.splice(i, 1);
                        this.velocitiesArr.splice(i, 1);
                        this.indexArr.splice(i, 1);
                        i--; // decrement i to check the same index again in the next iteration
                        len--; // decrement len to account for the removed element
                    }
                }
            } else {
                for (let i = 0; i < len; i++) {
                    if (this.velocitiesArr[i] < 0) {
                        this.torquesArr.splice(i, 1);
                        this.timesArr.splice(i, 1);
                        this.posAnatsArr.splice(i, 1);
                        this.velocitiesArr.splice(i, 1);
                        this.indexArr.splice(i, 1);
                        i--; // decrement i to check the same index again in the next iteration
                        len--; // decrement len to account for the removed element
                    }
                }
            }

            this.creatSectionData();

            //Filter according to the torque tolerance
            if (type === "concentric") {
                //for hamstring 
                let hamIndices = [];
                for (let i = 0; i < this.numSections * 2; i += 2) {
                    if (this.posAnatsArr[this.sectionPoints[i]] < this.posAnatsArr[this.sectionPoints[i + 1]]) {
                        hamIndices.push(this.sectionPoints[i], this.sectionPoints[i + 1]);
                    }
                }
                this.updateMinMax();
                //For each section in hamIndices, the code checks if the minimum torque in that section is 
                //within 10% of the minimum torque of the entire dataset.
                for (let i = hamIndices.length - 1; i >= 1; i -= 2) {
                    if (Math.min(...this.torquesArr.slice(hamIndices[i - 1], hamIndices[i] + 1)) > (1 - this.torTol) * this.minTorque) {
                        this.indexArr.splice(hamIndices[i - 1], hamIndices[i] - hamIndices[i - 1] + 1);
                        this.timesArr.splice(hamIndices[i - 1], hamIndices[i] - hamIndices[i - 1] + 1);
                        this.velocitiesArr.splice(hamIndices[i - 1], hamIndices[i] - hamIndices[i - 1] + 1);
                        this.torquesArr.splice(hamIndices[i - 1], hamIndices[i] - hamIndices[i - 1] + 1);
                        this.posAnatsArr.splice(hamIndices[i - 1], hamIndices[i] - hamIndices[i - 1] + 1);
                        hamIndices.splice(i - 1, 2);
                    }
                }
                this.updateMinMax();

                //Filter according to range of motion wrt max torque peak.
                //Get ROM for max hamstring peak
                let maxROMHam = 0;
                for (let i = hamIndices.length - 1; i >= 1; i -= 2) {
                    if (hamIndices[i - 1] < this.minIndex && hamIndices[i] > this.minIndex) {
                        maxROMHam = Math.abs(this.posAnatsArr[hamIndices[i]] - this.posAnatsArr[hamIndices[i - 1]]);
                        break;
                    }
                }

                //Discard sections where outside tolerance wrt max ROM
                for (let i = hamIndices.length - 1; i >= 1; i -= 2) {
                    if (Math.abs(this.posAnatsArr[hamIndices[i]] - this.posAnatsArr[hamIndices[i - 1]]) < (1 - this.romTol) * maxROMHam) {
                        this.indexArr.splice(hamIndices[i - 1], hamIndices[i] - hamIndices[i - 1] + 1);
                        this.timesArr.splice(hamIndices[i - 1], hamIndices[i] - hamIndices[i - 1] + 1);
                        this.velocitiesArr.splice(hamIndices[i - 1], hamIndices[i] - hamIndices[i - 1] + 1);
                        this.posAnatsArr.splice(hamIndices[i - 1], hamIndices[i] - hamIndices[i - 1] + 1);
                        this.torquesArr.splice(hamIndices[i - 1], hamIndices[i] - hamIndices[i - 1] + 1);
                        hamIndices.splice(i, 1);
                        hamIndices.splice(i - 1, 1);
                    }
                }

                for (let i = 0; i < hamIndices.length; i += 2) {
                    this.torquesArr_h.push(...this.torquesArr.slice(hamIndices[i], hamIndices[i + 1] + 1));
                    this.timesArr_h.push(...this.timesArr.slice(hamIndices[i], hamIndices[i + 1] + 1));
                    this.posAnatsArr_h.push(...this.posAnatsArr.slice(hamIndices[i], hamIndices[i + 1] + 1));
                    this.velocitiesArr_h.push(...this.velocitiesArr.slice(hamIndices[i], hamIndices[i + 1] + 1));
                }

                this.creatSectionData();
                // repeat for quadriceps
                let quadIndices = [];
                for (let i = 0; i < this.numSections * 2; i += 2) {
                    if (this.posAnatsArr[this.sectionPoints[i]] > this.posAnatsArr[this.sectionPoints[i + 1]]) {
                        quadIndices.push(this.sectionPoints[i], this.sectionPoints[i + 1]);
                    }
                }
                this.updateMinMax();
                //For each section in quadIndices, the code checks if the max torque in that section is 
                //within 10% of the max torque of the entire dataset.
                for (let i = quadIndices.length - 1; i >= 1; i -= 2) {
                    if (Math.max(...this.torquesArr.slice(quadIndices[i - 1], quadIndices[i] + 1)) < (1 - this.torTol) * this.maxTorque) {
                        this.indexArr.splice(quadIndices[i - 1], quadIndices[i] - quadIndices[i - 1] + 1);
                        this.timesArr.splice(quadIndices[i - 1], quadIndices[i] - quadIndices[i - 1] + 1);
                        this.velocitiesArr.splice(quadIndices[i - 1], quadIndices[i] - quadIndices[i - 1] + 1);
                        this.torquesArr.splice(quadIndices[i - 1], quadIndices[i] - quadIndices[i - 1] + 1);
                        this.posAnatsArr.splice(quadIndices[i - 1], quadIndices[i] - quadIndices[i - 1] + 1);
                        quadIndices.splice(i - 1, 2);
                    }
                }
                this.updateMinMax();

                //Filter according to range of motion wrt max torque peak.
                //Get ROM for max quads peak
                let maxROMQuad = 0;
                for (let i = quadIndices.length - 1; i >= 1; i -= 2) {
                    if (quadIndices[i - 1] < this.maxIndex && quadIndices[i] > this.maxIndex) {
                        maxROMQuad = Math.abs(this.posAnatsArr[quadIndices[i]] - this.posAnatsArr[quadIndices[i - 1]]);
                        break;
                    }
                }
                //Discard sections where outside tolerance wrt max ROM
                for (let i = quadIndices.length - 1; i >= 1; i -= 2) {
                    if (Math.abs(this.posAnatsArr[quadIndices[i]] - this.posAnatsArr[quadIndices[i - 1]]) < (1 - this.romTol) * maxROMQuad) {
                        this.indexArr.splice(quadIndices[i - 1], quadIndices[i] - quadIndices[i - 1] + 1);
                        this.timesArr.splice(quadIndices[i - 1], quadIndices[i] - quadIndices[i - 1] + 1);
                        this.velocitiesArr.splice(quadIndices[i - 1], quadIndices[i] - quadIndices[i - 1] + 1);
                        this.posAnatsArr.splice(quadIndices[i - 1], quadIndices[i] - quadIndices[i - 1] + 1);
                        this.torquesArr.splice(quadIndices[i - 1], quadIndices[i] - quadIndices[i - 1] + 1);
                        quadIndices.splice(i, 1);
                        quadIndices.splice(i - 1, 1);
                    }
                    
                    
                }
                for (let i = 0; i < quadIndices.length; i += 2) {
                    this.torquesArr_q.push(...this.torquesArr.slice(quadIndices[i], quadIndices[i + 1] + 1));
                    this.timesArr_q.push(...this.timesArr.slice(quadIndices[i], quadIndices[i + 1] + 1));
                    this.posAnatsArr_q.push(...this.posAnatsArr.slice(quadIndices[i], quadIndices[i + 1] + 1));
                    this.velocitiesArr_q.push(...this.velocitiesArr.slice(quadIndices[i], quadIndices[i + 1] + 1));
                }

            } else {
                let hamIndices = this.sectionPoints;
                this.minTorque = Math.min(...this.torquesArr);
                this.minIndex = this.torquesArr.indexOf(this.minTorque);
                for (let i = hamIndices.length - 1; i >= 1; i -= 2) {
                    if (Math.min(...this.torquesArr.slice(hamIndices[i - 1], hamIndices[i] + 1)) > (1 - this.torTol) * this.minTorque) {
                        this.indexArr.splice(hamIndices[i - 1], hamIndices[i] - hamIndices[i - 1] + 1);
                        this.timesArr.splice(hamIndices[i - 1], hamIndices[i] - hamIndices[i - 1] + 1);
                        this.velocitiesArr.splice(hamIndices[i - 1], hamIndices[i] - hamIndices[i - 1] + 1);
                        this.torquesArr.splice(hamIndices[i - 1], hamIndices[i] - hamIndices[i - 1] + 1);
                        this.posAnatsArr.splice(hamIndices[i - 1], hamIndices[i] - hamIndices[i - 1] + 1);
                        hamIndices.splice(i - 1, 2);
                    }
                }
                this.minTorque = Math.min(...this.torquesArr);
                this.minIndex = this.torquesArr.indexOf(this.minTorque);

                let maxROMHam = 0;
                for (let i = hamIndices.length - 1; i >= 1; i -= 2) {
                    if (hamIndices[i - 1] < this.minIndex && hamIndices[i] > this.minIndex) {
                        maxROMHam = Math.abs(this.posAnatsArr[hamIndices[i]] - this.posAnatsArr[hamIndices[i - 1]]);
                        break;
                    }
                }

                for (let i = hamIndices.length - 1; i >= 1; i -= 2) {
                    if (Math.abs(this.posAnatsArr[hamIndices[i]] - this.posAnatsArr[hamIndices[i - 1]]) < (1 - this.romTol) * maxROMHam) {
                        this.indexArr.splice(hamIndices[i - 1], hamIndices[i] - hamIndices[i - 1] + 1);
                        this.timesArr.splice(hamIndices[i - 1], hamIndices[i] - hamIndices[i - 1] + 1);
                        this.velocitiesArr.splice(hamIndices[i - 1], hamIndices[i] - hamIndices[i - 1] + 1);
                        this.posAnatsArr.splice(hamIndices[i - 1], hamIndices[i] - hamIndices[i - 1] + 1);
                        this.torquesArr.splice(hamIndices[i - 1], hamIndices[i] - hamIndices[i - 1] + 1);
                        hamIndices.splice(i, 1);
                        hamIndices.splice(i - 1, 1);
                    }
                }

            }
        },
        updateMinMax() {
            this.maxTorque = Math.max(...this.torquesArr);
            this.maxIndex = this.torquesArr.indexOf(this.maxTorque);
            this.minTorque = Math.min(...this.torquesArr);
            this.minIndex = this.torquesArr.indexOf(this.minTorque);
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

    }
}
</script>