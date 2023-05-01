<template>
    <v-container>
        <v-row no-gutters>
            <v-col sm="8" class="mx-auto">
                <v-card class="pa-8">
                    <router-link to="/all_patients" style="text-decoration: none; color: inherit;"><v-icon>
                            mdi-arrow-left-bold-circle-outline
                        </v-icon></router-link>
                    <v-card-title>
                        <v-avatar>
                            <v-img :src="`/${patient.image}`"></v-img>
                        </v-avatar>
                        <p class="ml-3 mt-3 mr-2">{{ patient.firstName }} {{ patient.lastName }}</p>
                        <v-dialog v-model="dialog" max-width="500px">
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn icon color="#0f6e2f" v-bind="attrs" v-on="on" @click="edit">
                                    <v-icon small>
                                        mdi-pencil
                                    </v-icon>
                                </v-btn>
                            </template>
                            <v-card>
                                <v-form ref="form" @submit.prevent="updateForm" enctype="multipart/form-data">
                                    <v-card-title>
                                        <span class="text-h5">Edit Patient Info</span>
                                    </v-card-title>
                                    <v-card-text>
                                        <v-container>

                                            <v-row class="pt-5">
                                                <v-col cols="12" md="6">
                                                    <v-text-field v-model="changedPatient.firstName" :rules="nameRules"
                                                        :counter="10" label="First Name" required></v-text-field>
                                                </v-col>

                                                <v-col cols="12" md="6">
                                                    <v-text-field v-model="changedPatient.lastName" :rules="nameRules"
                                                        :counter="10" label="Last Name" required></v-text-field>
                                                </v-col>
                                            </v-row>
                                            <v-text-field v-model="changedPatient.email" :rules="emailRules" label="E-mail"
                                                required></v-text-field>
                                            <v-row class="d-flex align-center">
                                                <v-col cols="12" md="6">
                                                    <v-menu ref="menu" v-model="menu" :close-on-content-click="false"
                                                        transition="scale-transition" offset-y min-width="auto">
                                                        <template v-slot:activator="{ on, attrs }">
                                                            <v-text-field v-model="date" label="Birthday date"
                                                                prepend-icon="mdi-calendar" readonly v-bind="attrs"
                                                                v-on="on"></v-text-field>
                                                        </template>
                                                        <v-date-picker v-model="date" :active-picker.sync="activePicker"
                                                            :max="(new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10)"
                                                            min="1950-01-01" @change="save"></v-date-picker>
                                                    </v-menu>
                                                </v-col>
                                                <v-col cols="12" md="6" class="pt-7">
                                                    <v-select v-model="changedPatient.gender" :items="genders"
                                                        label="Gender" dense></v-select>
                                                </v-col>
                                            </v-row>
                                            <v-file-input @change="selectFile" show-size counter multiple
                                                label="Upload new photo"></v-file-input>
                                            <v-img :src="`/${patient.image}`" width="50"></v-img>

                                        </v-container>
                                    </v-card-text>
                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn color="blue darken-1" text @click="close">
                                            Cancel
                                        </v-btn>
                                        <v-btn type="submit" color="blue darken-1" text @click="updateForm">
                                            Save
                                        </v-btn>
                                    </v-card-actions>
                                </v-form>
                            </v-card>

                        </v-dialog>
                    </v-card-title>
                    <v-divider></v-divider>
                    <v-card-text>
                        <div class="font-weight-bold ml-8 mb-2">
                            Email: {{ patient.email }}
                        </div>
                        <div class="font-weight-bold ml-8 mb-2">
                            Birthday: {{ patient.birthday }}
                        </div>
                        <div class="font-weight-bold ml-8 mb-2">
                            Gender: {{ patient.gender }}
                        </div>
                    </v-card-text>
                    <v-divider></v-divider>
                    <v-data-table :headers="headers" :items="records" class="elevation-1">
                        <template v-slot:item.actions="{ item }">
                            <v-icon small class="mr-2">
                                mdi-eye
                            </v-icon>
                            <v-icon small @click="removeRecord(item._id)">
                                mdi-delete
                            </v-icon>

                        </template>
                    </v-data-table>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import API from '@/api';
export default {
    data() {
        return {
            nameRules: [
                v => !!v || 'Name is required',
                v => v.length <= 10 || 'Name must be less than 10 characters',
            ],
            emailRules: [
                v => !!v || 'E-mail is required',
                v => /.+@.+/.test(v) || 'E-mail must be valid',
            ],
            patient: {
                firstName: "",
                lastName: "",
                email: "",
                image: "",
                birthday: "",
                gender: "",
                records: "",
            },
            changedPatient: {
                firstName: "",
                lastName: "",
                email: "",
                image: "",
                birthday: "",
                gender: "",
                records: "",
            },
            headers: [
                { text: 'Data Type', value: 'data_type' },
                { text: 'Joint', value: 'joint' },
                { text: 'Test time', value: 'time' },
                { text: 'Actions', value: 'actions', sortable: false },
            ],
            menu: false,
            genders: ['female', 'male', '(blank)'],
            dialog: false,
            image: "",
            activePicker: null,
            date: null,
            records: [],
            records_ids: [],
        };
    },
    watch: {
        menu(val) {
            val && setTimeout(() => (this.activePicker = 'YEAR'))
        },
    },
    async created() {
        const response = await API.getPatientByID(this.$route.params.id);
        this.patient = response;
        this.date = this.patient.birthday;
        this.reports = this.patient.reports;
        this.records_ids = this.patient.records;
        this.processRecords();
    },
    methods: {
        async removeRecord(id) {
            const formData1 = new FormData();
            formData1.append("record", id);
            await API.removePatientRecord(this.$route.params.id, formData1);
            const response = API.deleteRecord(id);
            this.$router.go();
        },
        async processRecords() {
            console.log(this.records_ids)
            for (let id of this.records_ids) {
                let record = await API.getRecordByID(id);
                this.records.push(record);
            }
        },
        edit() {
            this.changedPatient = Object.assign({}, this.patient);
            console.log(this.changedPatient.firstName);
        },
        selectFile(file) {
            this.image = file[0];
        },
        async updateForm() {
            const formData = new FormData();
            formData.append("image", this.image);
            formData.append("old_image", this.patient.image);
            formData.append("firstName", this.changedPatient.firstName);
            formData.append("lastName", this.changedPatient.lastName);
            formData.append("email", this.changedPatient.email);
            const dt = new Date(this.date);
            console.log(dt.toISOString().substr(0, 10));
            formData.append('birthday', dt.toISOString().substr(0, 10));
            formData.append("gender", this.changedPatient.gender);
            if (this.$refs.form.validate()) {
                const response = await API.updatePatient(this.$route.params.id, formData);
                this.$router.go();
            }
        },
        save(date) {
            this.$refs.menu.save(date);
            console.log(date);
        },
        close() {
            this.dialog = false
        },
    },
}
</script>