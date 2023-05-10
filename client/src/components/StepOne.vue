<template>
    <v-container>
        <v-form ref="form" @submit.prevent="submitForm" enctype="multipart/form-data">
            <v-row no-gutters>
                <v-col sm="8" class="mx-auto">
                    <v-card class="mb-8 pa-8" height="380px">
                        <v-card-title class="pt-0">Upload a data file</v-card-title>
                        <v-divider></v-divider>
                        <v-row class="pt-5">
                            <v-col cols="12" md="6">
                                <v-select :rules="rules" @change="changePatient" v-model="patient" :items="filteredPatients"
                                    :item-text="concatenatedText" item-value="_id" label="Select the patient"
                                    :filterable="true">
                                    <template v-slot:item="{ item }">
                                        <div>
                                            <div>{{ item.firstName }} {{ item.lastName }} - {{ item.email }}</div>
                                        </div>
                                    </template>
                                </v-select>
                            </v-col>

                            <v-col cols="12" md="6">
                                <v-text-field v-model="searchQuery" label="Search a patient" clearable>
                                    <template v-slot:append>
                                        <v-tooltip bottom>
                                            <template v-slot:activator="{ on }">
                                                <v-icon v-on="on" size="24">mdi-help-circle-outline</v-icon>
                                            </template>
                                            <span>Enter a patient name or email address to search for a patient.</span>
                                        </v-tooltip>
                                    </template>
                                </v-text-field>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="12" md="6">
                                <v-file-input @change="selectFile" :rules="rules" show-size counter multiple
                                    label="Upload data">
                                </v-file-input>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-select :rules="rules" @change="changeJoint" v-model="joint" :items="joints" label="Joint" class="pt-5"
                                    dense></v-select>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="12">
                                <v-radio-group @change="changeType" v-model="dataType" row :rules="rules">
                                    <template v-slot:label>
                                        <v-tooltip bottom>
                                            <template v-slot:activator="{ on }">
                                                <div v-on="on">Data type: </div>
                                            </template>
                                            <span>Concentric is when the muscle shortens and eccentric is when it
                                                lengthens.</span>
                                        </v-tooltip>
                                    </template>
                                    <v-radio label="Concentric" value="concentric"></v-radio>
                                    <v-radio label="Eccentric" value="eccentric"></v-radio>
                                </v-radio-group>
                            </v-col>
                        </v-row>
                    </v-card>

                </v-col>
                
            </v-row>
            <v-row no-gutters class="d-flex justify-center">
                <v-col class="d-flex justify-end" sm="8">
                    <v-btn type="submit" color="primary">
                        Continue
                    </v-btn>
                </v-col>
            </v-row>
        </v-form>
    </v-container>
</template>

<script>
import API from "../api";
import 'vue-select/dist/vue-select.css';

export default {
    data() {
        return {
            rules: [(value) => !!value || "This field is required!"],
            patients: [],
            searchQuery: '',
            joints: ['left knee', 'right knee','left shoulder','right shoulder','hip', 'left waist', 'right waist', 'Others'],
            joint: '',
            patient: '',
            dataType: '',
        }
    },
    computed: {
        filteredPatients() {
            if (this.searchQuery === '' || this.searchQuery === null) return this.patients;
            else {
                return this.patients.filter(patient => {
                    const searchRegex = new RegExp(this.searchQuery, 'i');
                    return searchRegex.test(patient.firstName) ||
                        searchRegex.test(patient.lastName) ||
                        searchRegex.test(patient.email);
                });
            }

        },
        concatenatedText() {
            return patient => `${patient.firstName} ${patient.lastName} - ${patient.email}`;
        },

    },

    props: {
        next: Function,
        formData: {
            type: Object,
            required: true
        },
    },

    methods: {
        async submitForm() {
            // const formData = new FormData();
            // formData.append("data", this.dataFile);
            if (this.$refs.form.validate()) {
                // const response = await API.uploadData(formData);
                this.next();
                
            }
        },
        async getPatients() {
            this.patients = await API.getAllPatient();
        },
        selectFile(file) {
            this.formData.dataFile = file[0];
        },
        changeType() {
            this.formData.dataType = this.dataType;
        },
        changePatient() {
            this.formData.patient = this.patient;
        },
        changeJoint() {
            this.formData.joint = this.joint;
        },

    },
    mounted() {
        this.getPatients();
    },
}
</script>