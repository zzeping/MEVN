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
                        </v-col>
                        <v-col class="d-flex">
                            <v-row class="text-center justify-start pt-3">
                                <v-btn @click="redraw">apply velocity</v-btn>
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
            torquesArr_all: [],
            timesArr_all: [],
            posAnatsArr_all: [],
            velocitiesArr_all: [],
            indexArr_all: [],
            selectedTrials: [],
            initialStrokeColors: [],
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
            this.select();
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
            this.torquesArr_all = [];
            this.timesArr_all = [];
            this.posAnatsArr_all = [];
            this.velocitiesArr_all = [];
            this.indexArr_all = [];
            this.initialStrokeColors = [];
            this.selectedTrials = [];
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
            let vm = this;

            svg1.selectAll(".torques")
                .data(this.torquesArr)
                .enter()
                .append("circle")
                .attr("class", "torques")
                .attr("cx", (d, i) => x(this.timesArr[i]))
                .attr("cy", d => y1(d))
                .attr("r", 3)
                .attr("stroke", "#cdcdcd")
                .attr("fill", "none")
                .on("mouseover", function (d, i) {
                    d3.select(this);

                    var [mouseX, mouseY] = d3.pointer(event, this);
                    var xVal = x.invert(mouseX);

                    var closestIndex = 0;
                    var closestDiff = Math.abs(xVal - vm.timesArr[0]);
                    for (var i = 1; i < vm.timesArr.length; i++) {
                        var diff = Math.abs(xVal - vm.timesArr[i]);
                        if (diff < closestDiff) {
                            closestIndex = i;
                            closestDiff = diff;
                        }
                    }
                    var closestTime = vm.timesArr[closestIndex];
                    let pos = vm.timesArr.indexOf(closestTime);
                    let section = vm.getSectionForIndex(pos);

                    vm.initialStrokeColors = [];
                    d3.selectAll(".torques").each(function (d, j) {
                        vm.initialStrokeColors[j] = d3.select(this).attr("stroke");
                    });

                    d3.selectAll(".torques")
                        .attr("stroke", (d, j) => {
                            if (j >= vm.sectionPoints[section] && j <= vm.sectionPoints[section + 1]) {
                                return "red";
                            } else {
                                return vm.initialStrokeColors[j];
                            }
                        });
                    d3.selectAll(".posAn")
                        .attr("stroke", (d, j) => {
                            if (j >= vm.sectionPoints[section] && j <= vm.sectionPoints[section + 1]) {
                                return "red";
                            } else {
                                return vm.initialStrokeColors[j];
                            }
                        });
                    d3.selectAll(".velo")
                        .attr("stroke", (d, j) => {
                            if (j >= vm.sectionPoints[section] && j <= vm.sectionPoints[section + 1]) {
                                return "red";
                            } else {
                                return vm.initialStrokeColors[j];
                            }
                        });

                })
                .on("mouseout", function (d, i) {

                    d3.select(this);

                    var [mouseX, mouseY] = d3.pointer(event, this);
                    var xVal = x.invert(mouseX);

                    var closestIndex = 0;
                    var closestDiff = Math.abs(xVal - vm.timesArr[0]);
                    for (var i = 1; i < vm.timesArr.length; i++) {
                        var diff = Math.abs(xVal - vm.timesArr[i]);
                        if (diff < closestDiff) {
                            closestIndex = i;
                            closestDiff = diff;
                        }
                    }
                    var closestTime = vm.timesArr[closestIndex];
                    let pos = vm.timesArr.indexOf(closestTime);
                    let section = vm.getSectionForIndex(pos);
                    d3.selectAll(".torques")
                        .attr("stroke", (d, j) => {
                            return vm.initialStrokeColors[j];
                        });
                    d3.selectAll(".posAn")
                        .attr("stroke", (d, j) => {
                            return vm.initialStrokeColors[j];
                        });
                    d3.selectAll(".velo")
                        .attr("stroke", (d, j) => {
                            return vm.initialStrokeColors[j];
                        });

                })
                .on("click", function (d, i) {
                    d3.select(this);

                    var [mouseX, mouseY] = d3.pointer(event, this);
                    var xVal = x.invert(mouseX);

                    var closestIndex = 0;
                    var closestDiff = Math.abs(xVal - vm.timesArr[0]);
                    for (var i = 1; i < vm.timesArr.length; i++) {
                        var diff = Math.abs(xVal - vm.timesArr[i]);
                        if (diff < closestDiff) {
                            closestIndex = i;
                            closestDiff = diff;
                        }
                    }
                    var closestTime = vm.timesArr[closestIndex];
                    let pos = vm.timesArr.indexOf(closestTime);
                    let section = vm.getSectionForIndex(pos);

                    if (vm.selectedTrials.includes(section)) {
                        d3.selectAll(".torques")
                            .attr("stroke", (d, j) => {
                                if (j >= vm.sectionPoints[section] && j <= vm.sectionPoints[section + 1]) {
                                    vm.initialStrokeColors[j] = "#cdcdcd";
                                    return "#cdcdcd";
                                } else {
                                    return vm.initialStrokeColors[j];
                                }
                            });
                        d3.selectAll(".posAn")
                            .attr("stroke", (d, j) => {
                                if (j >= vm.sectionPoints[section] && j <= vm.sectionPoints[section + 1]) {
                                    vm.initialStrokeColors[j] = "#cdcdcd";
                                    return "#cdcdcd";
                                } else {
                                    return vm.initialStrokeColors[j];
                                }
                            });
                        d3.selectAll(".velo")
                            .attr("stroke", (d, j) => {
                                if (j >= vm.sectionPoints[section] && j <= vm.sectionPoints[section + 1]) {
                                    vm.initialStrokeColors[j] = "#cdcdcd";
                                    return "#cdcdcd";
                                } else {
                                    return vm.initialStrokeColors[j];
                                }
                            });
                        let index = vm.selectedTrials.indexOf(section);
                        vm.selectedTrials.splice(index, 1);
                    } else {
                        d3.selectAll(".torques")
                            .attr("stroke", (d, j) => {
                                if (j >= vm.sectionPoints[section] && j <= vm.sectionPoints[section + 1]) {
                                    vm.initialStrokeColors[j] = "#0f6e2f";
                                    return "#0f6e2f";
                                } else {
                                    return vm.initialStrokeColors[j];
                                }
                            });
                        d3.selectAll(".posAn")
                            .attr("stroke", (d, j) => {
                                if (j >= vm.sectionPoints[section] && j <= vm.sectionPoints[section + 1]) {
                                    vm.initialStrokeColors[j] = "#0f6e2f";
                                    return "#0f6e2f";
                                } else {
                                    return vm.initialStrokeColors[j];
                                }
                            });
                        d3.selectAll(".velo")
                            .attr("stroke", (d, j) => {
                                if (j >= vm.sectionPoints[section] && j <= vm.sectionPoints[section + 1]) {
                                    vm.initialStrokeColors[j] = "#0f6e2f";
                                    return "#0f6e2f";
                                } else {
                                    return vm.initialStrokeColors[j];
                                }
                            });
                        vm.selectedTrials.push(section);

                    }
                    console.log(vm.selectedTrials)
                });



            // svg1.selectAll(".torques-q")
            //     .data(this.torquesArr_q)
            //     .enter()
            //     .append("circle")
            //     .attr("class", "torques-q")
            //     .attr("cx", (d, i) => x(this.timesArr_q[i]))
            //     .attr("cy", d => y1(d))
            //     .attr("r", 3)
            //     .attr("stroke", "#D79173")
            //     .attr("fill", "none");


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

            svg2.selectAll(".posAn")
                .data(this.posAnatsArr)
                .enter()
                .append("circle")
                .attr("class", "posAn")
                .attr("cx", (d, i) => x(this.timesArr[i]))
                .attr("cy", d => y2(d))
                .attr("r", 3)
                .attr("stroke", "#cdcdcd")
                .attr("fill", "none")
                .on("mouseover", function (d, i) {
                    d3.select(this);

                    var [mouseX, mouseY] = d3.pointer(event, this);
                    var xVal = x.invert(mouseX);

                    var closestIndex = 0;
                    var closestDiff = Math.abs(xVal - vm.timesArr[0]);
                    for (var i = 1; i < vm.timesArr.length; i++) {
                        var diff = Math.abs(xVal - vm.timesArr[i]);
                        if (diff < closestDiff) {
                            closestIndex = i;
                            closestDiff = diff;
                        }
                    }
                    var closestTime = vm.timesArr[closestIndex];
                    let pos = vm.timesArr.indexOf(closestTime);
                    let section = vm.getSectionForIndex(pos);

                    vm.initialStrokeColors = [];
                    d3.selectAll(".torques").each(function (d, j) {
                        vm.initialStrokeColors[j] = d3.select(this).attr("stroke");
                    });

                    d3.selectAll(".torques")
                        .attr("stroke", (d, j) => {
                            if (j >= vm.sectionPoints[section] && j <= vm.sectionPoints[section + 1]) {
                                return "red";
                            } else {
                                return vm.initialStrokeColors[j];
                            }
                        });
                    d3.selectAll(".posAn")
                        .attr("stroke", (d, j) => {
                            if (j >= vm.sectionPoints[section] && j <= vm.sectionPoints[section + 1]) {
                                return "red";
                            } else {
                                return vm.initialStrokeColors[j];
                            }
                        });
                    d3.selectAll(".velo")
                        .attr("stroke", (d, j) => {
                            if (j >= vm.sectionPoints[section] && j <= vm.sectionPoints[section + 1]) {
                                return "red";
                            } else {
                                return vm.initialStrokeColors[j];
                            }
                        });

                })
                .on("mouseout", function (d, i) {

                    d3.select(this);

                    var [mouseX, mouseY] = d3.pointer(event, this);
                    var xVal = x.invert(mouseX);

                    var closestIndex = 0;
                    var closestDiff = Math.abs(xVal - vm.timesArr[0]);
                    for (var i = 1; i < vm.timesArr.length; i++) {
                        var diff = Math.abs(xVal - vm.timesArr[i]);
                        if (diff < closestDiff) {
                            closestIndex = i;
                            closestDiff = diff;
                        }
                    }
                    var closestTime = vm.timesArr[closestIndex];
                    let pos = vm.timesArr.indexOf(closestTime);
                    let section = vm.getSectionForIndex(pos);
                    d3.selectAll(".torques")
                        .attr("stroke", (d, j) => {
                            return vm.initialStrokeColors[j];
                        });
                    d3.selectAll(".posAn")
                        .attr("stroke", (d, j) => {
                            return vm.initialStrokeColors[j];
                        });
                    d3.selectAll(".velo")
                        .attr("stroke", (d, j) => {
                            return vm.initialStrokeColors[j];
                        });

                })
                .on("click", function (d, i) {
                    d3.select(this);

                    var [mouseX, mouseY] = d3.pointer(event, this);
                    var xVal = x.invert(mouseX);

                    var closestIndex = 0;
                    var closestDiff = Math.abs(xVal - vm.timesArr[0]);
                    for (var i = 1; i < vm.timesArr.length; i++) {
                        var diff = Math.abs(xVal - vm.timesArr[i]);
                        if (diff < closestDiff) {
                            closestIndex = i;
                            closestDiff = diff;
                        }
                    }
                    var closestTime = vm.timesArr[closestIndex];
                    let pos = vm.timesArr.indexOf(closestTime);
                    let section = vm.getSectionForIndex(pos);

                    if (vm.selectedTrials.includes(section)) {
                        d3.selectAll(".torques")
                            .attr("stroke", (d, j) => {
                                if (j >= vm.sectionPoints[section] && j <= vm.sectionPoints[section + 1]) {
                                    vm.initialStrokeColors[j] = "#cdcdcd";
                                    return "#cdcdcd";
                                } else {
                                    return vm.initialStrokeColors[j];
                                }
                            });
                        d3.selectAll(".posAn")
                            .attr("stroke", (d, j) => {
                                if (j >= vm.sectionPoints[section] && j <= vm.sectionPoints[section + 1]) {
                                    vm.initialStrokeColors[j] = "#cdcdcd";
                                    return "#cdcdcd";
                                } else {
                                    return vm.initialStrokeColors[j];
                                }
                            });
                        d3.selectAll(".velo")
                            .attr("stroke", (d, j) => {
                                if (j >= vm.sectionPoints[section] && j <= vm.sectionPoints[section + 1]) {
                                    vm.initialStrokeColors[j] = "#cdcdcd";
                                    return "#cdcdcd";
                                } else {
                                    return vm.initialStrokeColors[j];
                                }
                            });
                        let index = vm.selectedTrials.indexOf(section);
                        vm.selectedTrials.splice(index, 1);
                    } else {
                        d3.selectAll(".torques")
                            .attr("stroke", (d, j) => {
                                if (j >= vm.sectionPoints[section] && j <= vm.sectionPoints[section + 1]) {
                                    vm.initialStrokeColors[j] = "#0f6e2f";
                                    return "#0f6e2f";
                                } else {
                                    return vm.initialStrokeColors[j];
                                }
                            });
                        d3.selectAll(".posAn")
                            .attr("stroke", (d, j) => {
                                if (j >= vm.sectionPoints[section] && j <= vm.sectionPoints[section + 1]) {
                                    vm.initialStrokeColors[j] = "#0f6e2f";
                                    return "#0f6e2f";
                                } else {
                                    return vm.initialStrokeColors[j];
                                }
                            });
                        d3.selectAll(".velo")
                            .attr("stroke", (d, j) => {
                                if (j >= vm.sectionPoints[section] && j <= vm.sectionPoints[section + 1]) {
                                    vm.initialStrokeColors[j] = "#0f6e2f";
                                    return "#0f6e2f";
                                } else {
                                    return vm.initialStrokeColors[j];
                                }
                            });
                        vm.selectedTrials.push(section);

                    }
                    console.log(vm.selectedTrials)
                });

            // svg2.selectAll(".posAn-q")
            //     .data(this.posAnatsArr_q)
            //     .enter()
            //     .append("circle")
            //     .attr("class", "posAn-q")
            //     .attr("cx", (d, i) => x(this.timesArr_q[i]))
            //     .attr("cy", d => y2(d))
            //     .attr("r", 3)
            //     .attr("stroke", "#D79173")
            //     .attr("fill", "none");

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
            svg3.selectAll(".velo")
                .data(this.velocitiesArr)
                .enter()
                .append("circle")
                .attr("class", "velo")
                .attr("cx", (d, i) => x(this.timesArr[i]))
                .attr("cy", d => y3(d))
                .attr("r", 3)
                .attr("stroke", "#cdcdcd")
                .attr("fill", "none")
                .on("mouseover", function (d, i) {
                    d3.select(this);

                    var [mouseX, mouseY] = d3.pointer(event, this);
                    var xVal = x.invert(mouseX);

                    var closestIndex = 0;
                    var closestDiff = Math.abs(xVal - vm.timesArr[0]);
                    for (var i = 1; i < vm.timesArr.length; i++) {
                        var diff = Math.abs(xVal - vm.timesArr[i]);
                        if (diff < closestDiff) {
                            closestIndex = i;
                            closestDiff = diff;
                        }
                    }
                    var closestTime = vm.timesArr[closestIndex];
                    let pos = vm.timesArr.indexOf(closestTime);
                    let section = vm.getSectionForIndex(pos);

                    vm.initialStrokeColors = [];
                    d3.selectAll(".torques").each(function (d, j) {
                        vm.initialStrokeColors[j] = d3.select(this).attr("stroke");
                    });

                    d3.selectAll(".torques")
                        .attr("stroke", (d, j) => {
                            if (j >= vm.sectionPoints[section] && j <= vm.sectionPoints[section + 1]) {
                                return "red";
                            } else {
                                return vm.initialStrokeColors[j];
                            }
                        });
                    d3.selectAll(".posAn")
                        .attr("stroke", (d, j) => {
                            if (j >= vm.sectionPoints[section] && j <= vm.sectionPoints[section + 1]) {
                                return "red";
                            } else {
                                return vm.initialStrokeColors[j];
                            }
                        });
                    d3.selectAll(".velo")
                        .attr("stroke", (d, j) => {
                            if (j >= vm.sectionPoints[section] && j <= vm.sectionPoints[section + 1]) {
                                return "red";
                            } else {
                                return vm.initialStrokeColors[j];
                            }
                        });

                })
                .on("mouseout", function (d, i) {

                    d3.select(this);

                    var [mouseX, mouseY] = d3.pointer(event, this);
                    var xVal = x.invert(mouseX);

                    var closestIndex = 0;
                    var closestDiff = Math.abs(xVal - vm.timesArr[0]);
                    for (var i = 1; i < vm.timesArr.length; i++) {
                        var diff = Math.abs(xVal - vm.timesArr[i]);
                        if (diff < closestDiff) {
                            closestIndex = i;
                            closestDiff = diff;
                        }
                    }
                    var closestTime = vm.timesArr[closestIndex];
                    let pos = vm.timesArr.indexOf(closestTime);
                    let section = vm.getSectionForIndex(pos);
                    d3.selectAll(".torques")
                        .attr("stroke", (d, j) => {
                            return vm.initialStrokeColors[j];
                        });
                    d3.selectAll(".posAn")
                        .attr("stroke", (d, j) => {
                            return vm.initialStrokeColors[j];
                        });
                    d3.selectAll(".velo")
                        .attr("stroke", (d, j) => {
                            return vm.initialStrokeColors[j];
                        });

                })
                .on("click", function (d, i) {
                    d3.select(this);

                    var [mouseX, mouseY] = d3.pointer(event, this);
                    var xVal = x.invert(mouseX);

                    var closestIndex = 0;
                    var closestDiff = Math.abs(xVal - vm.timesArr[0]);
                    for (var i = 1; i < vm.timesArr.length; i++) {
                        var diff = Math.abs(xVal - vm.timesArr[i]);
                        if (diff < closestDiff) {
                            closestIndex = i;
                            closestDiff = diff;
                        }
                    }
                    var closestTime = vm.timesArr[closestIndex];
                    let pos = vm.timesArr.indexOf(closestTime);
                    let section = vm.getSectionForIndex(pos);

                    if (vm.selectedTrials.includes(section)) {
                        d3.selectAll(".torques")
                            .attr("stroke", (d, j) => {
                                if (j >= vm.sectionPoints[section] && j <= vm.sectionPoints[section + 1]) {
                                    vm.initialStrokeColors[j] = "#cdcdcd";
                                    return "#cdcdcd";
                                } else {
                                    return vm.initialStrokeColors[j];
                                }
                            });
                        d3.selectAll(".posAn")
                            .attr("stroke", (d, j) => {
                                if (j >= vm.sectionPoints[section] && j <= vm.sectionPoints[section + 1]) {
                                    vm.initialStrokeColors[j] = "#cdcdcd";
                                    return "#cdcdcd";
                                } else {
                                    return vm.initialStrokeColors[j];
                                }
                            });
                        d3.selectAll(".velo")
                            .attr("stroke", (d, j) => {
                                if (j >= vm.sectionPoints[section] && j <= vm.sectionPoints[section + 1]) {
                                    vm.initialStrokeColors[j] = "#cdcdcd";
                                    return "#cdcdcd";
                                } else {
                                    return vm.initialStrokeColors[j];
                                }
                            });
                        let index = vm.selectedTrials.indexOf(section);
                        vm.selectedTrials.splice(index, 1);
                    } else {
                        d3.selectAll(".torques")
                            .attr("stroke", (d, j) => {
                                if (j >= vm.sectionPoints[section] && j <= vm.sectionPoints[section + 1]) {
                                    vm.initialStrokeColors[j] = "#0f6e2f";
                                    return "#0f6e2f";
                                } else {
                                    return vm.initialStrokeColors[j];
                                }
                            });
                        d3.selectAll(".posAn")
                            .attr("stroke", (d, j) => {
                                if (j >= vm.sectionPoints[section] && j <= vm.sectionPoints[section + 1]) {
                                    vm.initialStrokeColors[j] = "#0f6e2f";
                                    return "#0f6e2f";
                                } else {
                                    return vm.initialStrokeColors[j];
                                }
                            });
                        d3.selectAll(".velo")
                            .attr("stroke", (d, j) => {
                                if (j >= vm.sectionPoints[section] && j <= vm.sectionPoints[section + 1]) {
                                    vm.initialStrokeColors[j] = "#0f6e2f";
                                    return "#0f6e2f";
                                } else {
                                    return vm.initialStrokeColors[j];
                                }
                            });
                        vm.selectedTrials.push(section);

                    }
                });

            // svg3.selectAll(".velo-q")
            //     .data(this.velocitiesArr_q)
            //     .enter()
            //     .append("circle")
            //     .attr("class", "velo-q")
            //     .attr("cx", (d, i) => x(this.timesArr_q[i]))
            //     .attr("cy", d => y3(d))
            //     .attr("r", 3)
            //     .attr("stroke", "#D79173")
            //     .attr("fill", "none");

        },
        getSectionForIndex(index) {
            for (let i = 0; i < this.sectionPoints.length - 1; i += 2) {
                let sectionStart = this.sectionPoints[i];
                let sectionEnd = this.sectionPoints[i + 1];
                if (index >= sectionStart && index <= sectionEnd) {
                    return i;
                }
            }
            // The index is in the last section
            return this.sectionPoints.length - 1;
        },

        applyFiltering(type) {
            console.log(this.velocities)
            // apply velocity filter
            let velocityLimits = [];
            velocityLimits[0] = Number(this.velMax) + Math.abs(this.velMax * this.velTol);
            velocityLimits[1] = Number(this.velMax) - Math.abs(this.velMax * this.velTol);
            velocityLimits[2] = Number(this.velMin) + Math.abs(this.velMin * this.velTol);
            velocityLimits[3] = Number(this.velMin) - Math.abs(this.velMin * this.velTol);

            for (let i = 0; i < this.times.length; i++) {
                if ((this.velocities[i] >= velocityLimits[1]) ||
                    (this.velocities[i] <= velocityLimits[2])) {
                    this.torquesArr.push(this.torques[i]);
                    this.timesArr.push(this.times[i]);
                    this.posAnatsArr.push(this.posAnats[i]);
                    this.velocitiesArr.push(this.velocities[i]);
                    this.indexArr.push(this.index[i]);
                }
            }
            this.creatSectionData();
        },

        select() {
            this.torquesArr_h = [];
            this.timesArr_h = [];
            this.posAnatsArr_h = [];
            this.velocitiesArr_h = [];
            this.torquesArr_q = [];
            this.timesArr_q = [];
            this.posAnatsArr_q = [];
            this.velocitiesArr_q = [];
            this.selectedTrials.sort((a, b) => a - b);
            // for (let i = 0; i < this.selectedTrials.length; i++) {
            //     this.indexArr_all.push(...this.indexArr.slice(this.sectionPoints[this.selectedTrials[i]], this.sectionPoints[this.selectedTrials[i] + 1] + 1));
            //     this.torquesArr_all.push(...this.torquesArr.slice(this.sectionPoints[this.selectedTrials[i]], this.sectionPoints[this.selectedTrials[i] + 1] + 1));
            //     this.timesArr_all.push(...this.timesArr.slice(this.sectionPoints[this.selectedTrials[i]], this.sectionPoints[this.selectedTrials[i] + 1] + 1));
            //     this.posAnatsArr_all.push(...this.posAnatsArr.slice(this.sectionPoints[this.selectedTrials[i]], this.sectionPoints[this.selectedTrials[i] + 1] + 1));
            //     this.velocitiesArr_all.push(...this.velocitiesArr.slice(this.sectionPoints[this.selectedTrials[i]], this.sectionPoints[this.selectedTrials[i] + 1] + 1));
            // };
            console.log(this.selectedTrials)
            let hamIndices = [];
            for (let i = 0; i < this.selectedTrials.length; i++) {
                if (this.posAnatsArr[this.sectionPoints[this.selectedTrials[i]]] < this.posAnatsArr[this.sectionPoints[this.selectedTrials[i] + 1]]) {
                    hamIndices.push(this.sectionPoints[this.selectedTrials[i]], this.sectionPoints[this.selectedTrials[i] + 1]);
                }
            };
            for (let i = 0; i < hamIndices.length; i += 2) {
                this.torquesArr_h.push(...this.torquesArr.slice(hamIndices[i], hamIndices[i + 1] + 1));
                this.timesArr_h.push(...this.timesArr.slice(hamIndices[i], hamIndices[i + 1] + 1));
                this.posAnatsArr_h.push(...this.posAnatsArr.slice(hamIndices[i], hamIndices[i + 1] + 1));
                this.velocitiesArr_h.push(...this.velocitiesArr.slice(hamIndices[i], hamIndices[i + 1] + 1));
            };
            let quadIndices = [];
            for (let i = 0; i < this.selectedTrials.length; i++) {
                if (this.posAnatsArr[this.sectionPoints[this.selectedTrials[i]]] > this.posAnatsArr[this.sectionPoints[this.selectedTrials[i] + 1]]) {
                    quadIndices.push(this.sectionPoints[this.selectedTrials[i]], this.sectionPoints[this.selectedTrials[i] + 1]);
                }
            };
            for (let i = 0; i < quadIndices.length; i += 2) {
                this.torquesArr_q.push(...this.torquesArr.slice(quadIndices[i], quadIndices[i + 1] + 1));
                this.timesArr_q.push(...this.timesArr.slice(quadIndices[i], quadIndices[i + 1] + 1));
                this.posAnatsArr_q.push(...this.posAnatsArr.slice(quadIndices[i], quadIndices[i + 1] + 1));
                this.velocitiesArr_q.push(...this.velocitiesArr.slice(quadIndices[i], quadIndices[i + 1] + 1));
            };

        },

        // create section data, sectionPoints stores the starts and ends of all sections. 
        creatSectionData() {
            this.numSections = 1;
            this.sectionPoints = [0];
            console.log(this.indexArr)
            console.log(this.velocitiesArr)
            //Look for non-contiguous values in the index column
            for (let i = 0; i < this.indexArr.length - 1; i++) {
                while (this.indexArr[i + 1] - this.indexArr[i] !== 1) {
                    this.numSections++;
                    this.sectionPoints.push(i, i + 1);
                    break;
                }
            }
            this.sectionPoints.push(this.indexArr.length - 1);
            console.log(this.numSections)
            console.log(this.sectionPoints);
        },

    }
}
</script>