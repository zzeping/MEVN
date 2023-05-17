<template>
  <v-container>
    <v-alert border="left" close-text="Close Alert" color="green accent-4" dark dismissible
      v-if="this.$route.params.message">
      {{ this.$route.params.message }}
    </v-alert>
    <v-card>
      <v-card-title>
        Patients
        <router-link style="text-decoration: none; color: inherit;" to="/add_patient">
          <v-icon small class="ml-2">
            mdi-plus-circle-outline
          </v-icon>
        </router-link>
        <v-spacer></v-spacer>
        <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details></v-text-field>
      </v-card-title>
      <v-data-table :headers="headers" :items="patients" :search="search" class="elevation-1">
        <!-- <template v-slot:item.image="{ item }">
          <v-avatar>
            <v-img :src="`/${item.image}`"></v-img>
          </v-avatar>
        </template> -->
        <template v-slot:item.actions="{ item }">
          <router-link style="text-decoration: none; color: inherit;" :to="{ name: 'patient', params: { id: item._id } }">
            <v-icon small class="mr-2">
              mdi-eye
            </v-icon>
          </router-link>
          <router-link style="text-decoration: none; color: inherit;"
            :to="{ name: 'steps', params: { value: item._id } }">
            <v-icon small class="mr-2">
              mdi-plus
            </v-icon>
          </router-link>
          <v-icon small @click="removePatient(item._id)">
            mdi-delete
          </v-icon>
        </template>
      </v-data-table>

    </v-card>
  </v-container>
</template>


<script>
import API from "../api";
export default {
  data() {
    return {
      search: '',
      patients: [],
      headers: [
        // { text: 'Patient', value: 'image' },
        { text: 'First Name', value: 'firstName' },
        { text: 'Last Name', value: 'lastName' },
        { text: 'Birthday', value: 'birthday' },
        { text: 'File Number', value: 'fileNumber' },
        { text: 'Gender', value: 'gender' },
        { text: 'Email', value: 'email' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
    };
  },
  async created() {
    this.patients = await API.getAllPatient();
  },
  methods: {
    async removePatient(id) {
      const response1 = await API.getPatientByID(id);
      this.patient = response1;
      this.records_ids = this.patient.records;
      for (const element of this.records_ids) {
        await API.deleteRecord(element);
      }
      const response2 = await API.deletePatient(id);
      this.$router.go();
    }
  }

}
</script>

