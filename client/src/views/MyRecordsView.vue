<template>
  <v-container>
    <v-alert border="left" close-text="Close Alert" color="green accent-4" dark dismissible
      v-if="this.$route.params.message">
      {{ this.$route.params.message }}
    </v-alert>
    <v-card>
      <v-card-title>
        Records
        <router-link style="text-decoration: none; color: inherit;" to="/steps">
          <v-icon small class="ml-2">
            mdi-plus-circle-outline
          </v-icon>
        </router-link>
        <v-spacer></v-spacer>
        <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details></v-text-field>
      </v-card-title>
      <v-data-table :headers="headers" :items="new_records" :search="search" class="elevation-1">
        <template v-slot:item.actions="{ item }">
          <v-icon @click="test(item._id)" small class="mr-2">
            mdi-eye
          </v-icon>
          <v-icon small @click="removeRecord(item._id)">
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
      records: [],
      patients: [],
      new_records: [],
      headers: [
        { text: 'Time', value: 'time' },
        { text: 'Patient', value: 'patient' },
        { text: 'Joint', value: 'joint' },
        { text: 'Type', value: 'data_type' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
    };
  },
  // 可以作为论文素材
  async created() {
    this.records = await API.getAllRecord();
    this.patients = await API.getAllPatient();
    this.processRecords();
    this.new_records=this.records;
  },
  methods: {
    test(id) {
      console.log(id);
    },
    async removeRecord(id) {
      const response = API.deleteRecord(id);
      this.$router.go();
    },
    async getFirstName(patientId) {
      const targetPatient = await this.patients.find(obj => obj._id === patientId);
      if (targetPatient == undefined) return 'Unknown';
      return targetPatient.firstName || 'Unknown';
    },
    async processRecords() {
      for (let record of this.records) {
        const patientId = record.patient;
        const firstName = await this.getFirstName(patientId);
        record.patient = firstName;
      }
    },
  }


  }
</script>
  
  