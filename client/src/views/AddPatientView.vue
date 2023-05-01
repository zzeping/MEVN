<template>
    <v-container>
        <v-row no-gutters>
            <v-col sm="8" class="mx-auto">
                <v-card class="pa-8">
                    <router-link to="/all_patients" style="text-decoration: none; color: inherit;"><v-icon>
                            mdi-arrow-left-bold-circle-outline
                        </v-icon></router-link>
                    <v-card-title>Add New Patient</v-card-title>
                    <v-divider></v-divider>
                    <v-form ref="form" @submit.prevent="submitForm" enctype="multipart/form-data">
                        <v-row class="pt-5">
                            <v-col cols="12" md="6">
                                <v-text-field v-model="patient.firstName" :rules="nameRules" :counter="10"
                                    label="First Name" required></v-text-field>
                            </v-col>

                            <v-col cols="12" md="6">
                                <v-text-field v-model="patient.lastName" :rules="nameRules" :counter="10"
                                    label="Last Name" required></v-text-field>
                            </v-col>
                        </v-row>
                        <v-text-field v-model="patient.email" :rules="emailRules" label="E-mail"
                            required></v-text-field>

                        <v-row class="d-flex align-center">
                            <v-col cols="12" md="6">
                                <v-menu ref="menu" v-model="menu" :close-on-content-click="false"
                                    transition="scale-transition" offset-y min-width="auto">
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-text-field v-model="date" label="Birthday date" prepend-icon="mdi-calendar"
                                            readonly v-bind="attrs" v-on="on"></v-text-field>
                                    </template>
                                    <v-date-picker v-model="date" :active-picker.sync="activePicker"
                                        :max="(new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10)"
                                        min="1950-01-01" @change="save"></v-date-picker>
                                </v-menu>
                            </v-col>
                            <v-col cols="12" md="6" class="pt-7">
                                <v-select v-model="gender" :items="genders" label="Gender" dense></v-select>
                            </v-col>
                        </v-row>
                        <!-- <v-file-input @change="selectFile" show-size counter multiple
                            label="Upload photo"></v-file-input> -->
                        <v-text-field v-model="patient.fileNumber" label="File Number"></v-text-field>
                        <v-btn type="submit" class="mt-3 white--text" color="#0f6e2f">Add Patient</v-btn>
                    </v-form>
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
            activePicker: null,
            date: null,
            menu: false,
            genders: ['female', 'male', '(blank)'],
            patient: {
                firstName: "",
                lastName: "",
                email: "",
                image: "",
                birthday: "",
                gender: "",
                fileNumber: "",
            },
            image: "",
            gender: "",
        };
    },
    watch: {
        menu(val) {
            val && setTimeout(() => (this.activePicker = 'YEAR'))
        },
    },
    methods: {
        save(date) {
            this.$refs.menu.save(date)
        },
        selectFile(file) {
            this.image = file[0];
        },
        
        async submitForm() {
            const formData = new FormData();
            // formData.append('image', this.image);
            formData.append('firstName', this.patient.firstName);
            formData.append('lastName', this.patient.lastName);
            formData.append('email', this.patient.email);
            formData.append('fileNumber', this.patient.fileNumber);
            const dt = new Date(this.date);
            formData.append('birthday', dt.toISOString().substr(0, 10));
            formData.append('gender', this.gender);
            if (this.$refs.form.validate()) {
                const response = await API.addPatient(formData);
                this.$router.push({ name: "all_patients", params: { message: response.message } })
            }
        }
    },
}
</script>