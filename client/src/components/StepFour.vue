<template>
    <v-container class="pl-10 pr-10">
        <v-card class="mb-8 pl-8" height="550px">
            <v-row>
                <v-col md="8" class="pr-7">
                    <v-select v-model="selectedRecords" @change="select" :items="records" label="Select histories"
                        item-value="_id" :item-text="concatenatedText" multiple chips class="select-right"> <template
                            v-slot:selection="{ item, index }">
                            <v-chip v-if="index < 2">
                                <span>{{ concatenatedText(item) }}</span>
                            </v-chip>
                            <span v-if="index === 2" class="text-grey text-caption align-self-center">
                                (+{{ selectedRecords.length - 2 }} others)
                            </span>
                        </template></v-select>
                    <div ref="pics">
                        <svg ref="chart2"></svg>
                        <svg ref="chart1"></svg>
                        <svg ref="chart3"></svg>
                    </div>


                </v-col>
                <v-col md="4">
                    <v-row class="d-flex justify-center pr-10 pt-10">
                        <p>The max torque of Quadriceps is {{ this.formData.maxTorque }} at {{ this.formData.maxTorqueAn }}
                            degree.</p>
                        <p>The max torque of Hamstring is {{ this.formData.minTorque }} at {{ this.formData.minTorqueAn }}
                            degree.
                        </p>
                        <v-textarea v-model="note" rows="8" class="px-3" label="Add Notes to the report"
                            variant="solo"></v-textarea>
                        <v-dialog v-model="dialog" width="auto">
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn rounded outlined color="#0f6e2f" v-bind="attrs" v-on="on">download
                                    report</v-btn></template>
                            <v-card>
                                <v-card-text>
                                    <div class="pt-10 text-h5">
                                        Please confirm to download the pdf report.
                                    </div>

                                </v-card-text>
                                <v-card-actions class="justify-end">
                                    <v-btn text @click="dialog = false">cancle</v-btn>
                                    <v-btn color="primary" @click="download">download</v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                    </v-row>

                </v-col>
            </v-row>

        </v-card>

        <v-row class="text-center">
            <v-col md="6" class="d-flex justify-left">
                <v-btn color="primary" @click="previousStep">back</v-btn>
            </v-col>
            <v-col md="6" class="d-flex justify-end">
                <v-btn color="primary" @click="submit">submit</v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>
<style>
.select-right {
    /* width: 200px; */
    margin-left: auto;
}
</style>
<script>
import * as d3 from "d3";
import jsPDF from "jspdf";
import * as html2canvas from "html2canvas";
import API from '@/api';
import loess from 'loess';




export default {
    data() {
        return {
            x_h: [],
            y_h: [],
            x_q: [],
            y_q: [],
            dialog: false,
            report: '',
            patients: '',
            patient_o: '',
            note: '',
            doc: '',
            blob: '',
            avg_h: '',
            avg_q: '',
            records: [], // Array to store the queried items
            selectedRecords: [], // Array to store the selected items
            xScale1: '',
            xScale2: '',
            yScale1: '',
            yScale2: '',
            svg1: '',
            svg2: '',
            colors: ["rgba(77,10,54, 0.8)", "rgba(110,15,78, 0.7)", "rgba(168,111,148, 0.8)", "rgba(226,207,219, 0.9)"],

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
                this.y_h = this.formData.y_torq_h_m.map(number => -number);
                this.x_q = this.formData.x_angle_q_m;
                this.y_q = this.formData.y_torq_q_m;
            } else {
                this.x_h = this.formData.x_angle_h;
                this.y_h = this.formData.y_torq_h.map(number => -number);
                this.x_q = this.formData.x_angle_q;
                this.y_q = this.formData.y_torq_q;
            }

            if (new_view) {
                this.formData.maxTorque = Math.max(...this.y_q);
                this.formData.maxTorqueAn = this.x_q[this.y_q.indexOf(this.formData.maxTorque)];
                this.formData.minTorque = Math.max(...this.y_h);
                this.formData.minTorqueAn = this.x_h[this.y_h.indexOf(this.formData.minTorque)];
                this.loadResult();
            }
        },
    },
    computed: {
        concatenatedText() {
            return record => {
                let firstName = this.getFirstName(record.patient);
                return `${firstName} - ${record.joint} ${record.time}`;
            };
        },
    },
    async created() {
        this.patients = await API.getAllPatient();
        this.records = await API.getAllRecord();
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

        async select() {
            if (this.selectedRecords.length > 4) {
                this.selectedRecords = this.selectedRecords.slice(0, 4);
            }
            console.log(this.selectedRecords)
            d3.selectAll(".add").remove();
            let record = '';
            let records = [];
            let color = '';
            for (let e of this.selectedRecords) {
                record = await API.getRecordByID(e);
                records.push(record);
            }
            const customComparator = (a, b) => {
                const timeA = new Date(a.time.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$2/$1/$3"));
                const timeB = new Date(b.time.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$2/$1/$3"));
                return timeB - timeA;
            };
            let sortedRecords = records.sort(customComparator);
            for (let i = 0; i < sortedRecords.length; i++) {
                color = this.colors[i % this.colors.length];
                this.svg1.append("path")
                    .datum(sortedRecords[i].hamstring)
                    .attr("d", d3.line()
                        .x(d => this.xScale1(d.x))
                        .y(d => this.yScale1(d.y)))
                    .attr("stroke", color)
                    .attr("stroke-width", 4)
                    .attr("fill", "none")
                    .attr("class", "add");
                this.svg2.append("path")
                    .datum(sortedRecords[i].quadricep)
                    .attr("d", d3.line()
                        .x(d => this.xScale2(d.x))
                        .y(d => this.yScale2(d.y)))
                    .attr("stroke", color)
                    .attr("stroke-width", 4)
                    .attr("fill", "none")
                    .attr("class", "add");;
            }

        },
        getFirstName(patientId) {
            const targetPatient = this.patients.find(obj => obj._id === patientId);
            if (targetPatient == undefined) return 'Unknown';
            return targetPatient.firstName || 'Unknown';
        },
        clearChart() {
            d3.select(this.$refs.chart1).selectAll('g').remove();
            d3.select(this.$refs.chart2).selectAll('g').remove();
            d3.select(this.$refs.chart3).selectAll('g').remove();
        },
        async submit() {
            await this.generate();
            const formData1 = new FormData();
            formData1.append('joint', this.formData.joint);
            formData1.append('time', this.formData.test_time);
            formData1.append('data_type', this.formData.dataType);
            formData1.append('patient', this.formData.patient);
            formData1.append('report', this.blob, 'report.pdf');
            formData1.append('hamstring', JSON.stringify(JSON.parse(JSON.stringify(this.avg_h))));
            formData1.append('quadricep', JSON.stringify(JSON.parse(JSON.stringify(this.avg_q))));
            const response = await API.addRecords(formData1);
            const formData2 = new FormData();
            formData2.append('record', response.recordId);
            await API.updatePatientRecord(this.formData.patient, formData2);
            this.$router.push({ name: "my_records", params: { message: response.message } })
        },
        async generate() {
            const pdfDoc = new jsPDF();
            pdfDoc.setFont('helvetica', 'bold');
            pdfDoc.setFontSize(24);
            const titleText = 'Isokinetic Measurements Report';
            const textWidth = pdfDoc.getTextWidth(titleText);
            const pageWidth = pdfDoc.internal.pageSize.width;
            const x = (pageWidth - textWidth) / 2;
            pdfDoc.text(titleText, x, 20);

            pdfDoc.setFontSize(14);
            const subtitleText = 'General information';
            pdfDoc.text(subtitleText, 20, 40);

            const createdTime = new Date().toLocaleString();
            pdfDoc.setFont('helvetica', 'normal');
            pdfDoc.setFontSize(14);
            const name = await this.getName(this.formData.patient);
            pdfDoc.text(`Name: ${name}      Birth Date: ${this.patient_o.birthday}     Gender: ${this.patient_o.gender}`, 20, 50);
            pdfDoc.text(`Created Time: ${createdTime}       Data Type: ${this.formData.dataType}`, 20, 60);
            pdfDoc.text(`Joint: ${this.formData.joint}    Fit method: averaging     Velocity:${this.formData.velMax}`, 20, 70)
            pdfDoc.line(20, 77, pageWidth - 20, 77);

            pdfDoc.setFont('helvetica', 'bold');
            pdfDoc.setFontSize(14);
            pdfDoc.text("Result", 20, 87);

            await html2canvas(this.$refs.pics, { useCORS: true }).then((canvas) => {
                const imageData = canvas.toDataURL('image/png');
                pdfDoc.addImage(imageData, 'PNG', 20, 100, 120, 90);

            });
            pdfDoc.setFont('helvetica', 'normal');
            pdfDoc.setFontSize(10);
            pdfDoc.text("Quadriceps max point:", 131, 104);
            pdfDoc.text(`The max torque is ${this.formData.maxTorque} at ${this.formData.maxTorqueAn} degree.`, 131, 109);

            pdfDoc.text("Hamstring max point:", 131, 137);
            pdfDoc.text(`The min torque is ${this.formData.minTorque} at ${this.formData.minTorqueAn} degree.`, 131, 142);

            pdfDoc.line(20, 200, pageWidth - 20, 200);
            pdfDoc.setFont('helvetica', 'bold');
            pdfDoc.setFontSize(14);
            pdfDoc.text("Added notes", 20, 210);
            pdfDoc.setFont('helvetica', 'normal');
            pdfDoc.setFontSize(14);

            var paragraph = this.note;
            var lines = pdfDoc.splitTextToSize(paragraph, 170);
            pdfDoc.text(20, 220, lines);
            // pdfDoc.text(this.note, 20, 220);
            this.doc = pdfDoc;
            this.report = pdfDoc.output('arraybuffer');
            this.blob = pdfDoc.output('blob');

        },
        async download() {
            await this.generate();
            this.doc.save('report.pdf');
            this.dialog = false;
        },
        async getName(patientId) {
            const targetPatient = await this.patients.find(obj => obj._id === patientId);
            if (targetPatient == undefined) return 'Unknown';
            this.patient_o = targetPatient;
            return targetPatient.firstName.concat(" ", targetPatient.lastName) || 'Unknown';
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
                const data = {
                    y: averagedYh,
                    x: averagedXh,
                };
                var options = { span: 0.5, band: 0.8, degree: 1 }
                var model = new loess(data, options)
                var fit = model.predict();
                averagedYh = fit.fitted;
            }
            this.avg_h = averagedXh.map(function (d, i) { return { x: d, y: averagedYh[i] }; });

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
                const data = {
                    y: averagedYq,
                    x: averagedXq,
                };
                var options = { span: 0.5, band: 0.8, degree: 1 }
                var model = new loess(data, options)
                var fit = model.predict();
                averagedYq = fit.fitted;
            }
            this.avg_q = averagedXq.map(function (d, i) { return { x: d, y: averagedYq[i] }; });
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
            const width = 650 - margin.left - margin.right;
            const height = 130 - margin.top - margin.bottom;

            this.svg1 = d3.select(this.$refs.chart1)
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', `translate(${margin.left}, ${margin.top})`);

            this.svg2 = d3.select(this.$refs.chart2)
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
            this.xScale1 = d3.scaleLinear().domain([d3.min(this.x_h), d3.max(this.x_h)]).range([0, width]);
            this.yScale1 = d3.scaleLinear().domain([d3.min(this.y_h), d3.max(this.y_h)]).range([height, 0]);
            this.xScale2 = d3.scaleLinear().domain([d3.min(this.x_q), d3.max(this.x_q)]).range([0, width]);
            this.yScale2 = d3.scaleLinear().domain([d3.min(this.y_q), d3.max(this.y_q)]).range([height, 0]);
            const xScale3 = d3.scaleLinear().domain([d3.min(commonX), d3.max(commonX)]).range([0, width]);
            const yScale3 = d3.scaleLinear().domain([d3.min(ratio), d3.max(ratio)]).range([height, 0]);

            // create the axes for x and y
            const xAxis1 = d3.axisBottom(this.xScale1);
            const yAxis1 = d3.axisLeft(this.yScale1);
            const xAxis2 = d3.axisBottom(this.xScale2);
            const yAxis2 = d3.axisLeft(this.yScale2);


            // add the x and y axes to the chart
            this.svg1.append('g').attr('class', 'x axis').attr('transform', `translate(0,${height})`).call(xAxis1).append("text")
                .style("fill", "black")
                .attr('text-anchor', 'end')
                .attr('x', width)
                .attr('y', margin.bottom - 3)
                .text('Angle (degree)');
            this.svg1.append('g').attr('class', 'y axis').call(yAxis1).append("text")
                .attr("text-anchor", "end")
                .attr("transform", "rotate(-90)")
                .attr("y", -margin.left + 20)
                .attr("x", -margin.top + 8)
                .attr("fill", "black")
                .text("Hamstrings Torque (N*m)");

            // add the scatter points to the chart
            // svg1.selectAll('circle')
            //     .data(this.x_h)
            //     .enter()
            //     .append('circle')
            //     .attr('cx', (d, i) => xScale1(this.x_h[i]))
            //     .attr('cy', (d, i) => yScale1(this.y_h[i]))
            //     .attr('r', 2)
            //     .attr("stroke", "#73B9D7")
            //     .attr("fill", "none");

            this.svg1.append("path")
                .datum(this.avg_h)
                .attr("d", d3.line()
                    .x(d => this.xScale1(d.x))
                    .y(d => this.yScale1(d.y))
                )
                .attr("stroke", "rgba(7,55,23,0.8)")
                .attr("stroke-width", 3)
                .attr("fill", "none");


            // add the x and y axes to the chart
            this.svg2.append('g').attr('class', 'x axis').attr('transform', `translate(0,${height})`).call(xAxis2).append("text")
                .style("fill", "black")
                .attr('text-anchor', 'end')
                .attr('x', width)
                .attr('y', margin.bottom - 3)
                .text('Angle (degree)');
            this.svg2.append('g').attr('class', 'y axis').call(yAxis2).append("text")
                .attr("text-anchor", "end")
                .attr("transform", "rotate(-90)")
                .attr("y", -margin.left + 20)
                .attr("x", -margin.top + 8)
                .attr("fill", "black")
                .text("Quadricep Torque (N*m)");

            // add the scatter points to the chart
            // svg2
            //     .selectAll('circle')
            //     .data(this.x_q)
            //     .enter()
            //     .append('circle')
            //     .attr('cx', (d, i) => xScale2(this.x_q[i]))
            //     .attr('cy', (d, i) => yScale2(this.y_q[i]))
            //     .attr('r', 2)
            //     .attr("stroke", "#73B9D7")
            //     .attr("fill", "none");
            this.svg2.append("path")
                .datum(this.avg_q)
                .attr("d", d3.line()
                    .x(d => this.xScale2(d.x))
                    .y(d => this.yScale2(d.y)))
                .attr("stroke", "rgba(7,55,23,0.8)")
                .attr("stroke-width", 4)
                .attr("fill", "none");
            // d3.select(this.$refs.chart2)
            //     .node()
            //     .appendChild(this.svg2.node());

            // add the line to the SVG element
            svg3.append("path")
                .datum(ratio)
                .attr("d", d3.line()
                    .x(function (d, i) { return xScale3(commonX[i]); })
                    .y(function (d, i) { return yScale3(ratio[i]); }))
                .attr("stroke", "rgba(7,55,23,0.8)")
                .attr("stroke-width", 4)
                .attr("fill", "none");

            // add the x-axis
            svg3.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(xScale3))
                .append("text")
                .style("fill", "black")
                .attr('text-anchor', 'end')
                .attr('x', width)
                .attr('y', margin.bottom - 3)
                .text('Angle (degree)');

            // add the y-axis
            svg3.append("g")
                .call(d3.axisLeft(yScale3))
                .append("text")
                .attr("text-anchor", "end")
                .attr("transform", "rotate(-90)")
                .attr("y", -margin.left + 20)
                .attr("x", -margin.top)
                .attr("fill", "black")
                .text("Ratio");


        },
        moving(y, span) {
            span = Math.floor(span);
            var n = y.length;
            span = Math.min(span, n);
            var width = span - 1 + (span % 2); // force it to be odd
            var c = new Array(n).fill(0);
            c[0] = y[0];
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
                    for (var j = 0; j <= 2 * i; j++) {
                        if (j < n) {
                            sum += y[j];
                        }
                    }
                    c[i] = sum / (2 * i + 1);
                }

            }
            return c;
        },

    }
}
</script>