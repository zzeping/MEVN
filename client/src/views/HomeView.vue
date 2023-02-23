<template>
  <v-container class="fill-height">

<v-row no-gutters>
      <v-col cols="12" md="7" class="d-flex ml-5">
        <v-row class="ml-2">
          <div class="mt-12 mr-7 ml-2">
            <h1 class="pt-5">A Tool to Perform Isokinetic Measurements and Generate Reports.</h1>
          </div>
          <v-btn class="ma-2" rounded outlined color="#0f6e2f" href="/add_patient">
            Add Patient
            <v-icon right dark>
              mdi-plus-circle
            </v-icon>
          </v-btn>
          <v-btn class="ma-2 white--text" rounded color="#0f6e2f">
            upload measurement
            <v-icon right dark>
              mdi-cloud-upload
            </v-icon>
          </v-btn>
        </v-row>
      </v-col>
      <v-col cols="12" md="4">
        <v-img contain src="./Meeting.png" height="370px" />
      </v-col>
    </v-row>
    
    
  </v-container>
</template>

<script>
export default {
  name: 'Home',
};
</script>

