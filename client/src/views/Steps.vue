<template>
    <v-container>
        <v-stepper style="background-color: rgba(255, 255, 255, 0.7);" v-model="e1">
            <v-stepper-header style="background-color: white">
                <v-stepper-step :complete="e1 > 1" step="1">Upload data</v-stepper-step>

                <v-divider></v-divider>

                <v-stepper-step :complete="e1 > 2" step="2">Auto select</v-stepper-step>

                <v-divider></v-divider>

                <v-stepper-step :complete="e1 > 3" step="3">Manual select <small>Optional</small></v-stepper-step>

                <v-divider></v-divider>

                <v-stepper-step step="4">View result</v-stepper-step>
            </v-stepper-header>

            <v-stepper-items>
                <v-stepper-content step="1">
                    <StepOne :next="nextStep" :formData="formData" />
                </v-stepper-content>

                <v-stepper-content step="2">
                    <StepTwo :next="nextStep" :result="resultStep" :previous="previousStep" :formData="formData" />
                </v-stepper-content>

                <v-stepper-content step="3">
                    <StepThree :next="nextStep" :previous="previousStep" :formData="formData" />
                </v-stepper-content>

                <v-stepper-content step="4">
                    <StepFour :previous="previousStep" :auto="autoStep" :formData="formData" />
                </v-stepper-content>
            </v-stepper-items>
        </v-stepper>

    </v-container>
</template> 
  
<script>
import StepOne from '@/components/StepOne.vue'
import StepTwo from '@/components/StepTwo.vue'
import StepThree from '@/components/StepThree.vue'
import StepFour from '@/components/StepFour.vue'


export default {
    components: {
        StepOne,
        StepTwo,
        StepThree,
        StepFour
    },

    data() {
        return {
            e1: 1,
            formData: {
                dataFile: null,
                patientID: '',
                joint: '',
                test_time: '',
                dataType: null,
                x_angle_h: [],
                y_torq_h: [],
                x_angle_q: [],
                y_torq_q: [],
                x_angle_h_m: [],
                y_torq_h_m: [],
                x_angle_q_m: [],
                y_torq_q_m: [],
                viewResult: 0,
                manual: 0,
                index: [],
                torques: [],
                times: [],
                posAnats: [],
                velocities: [],
                velMax: 0,
            }
        }
    },
    methods: {
        nextStep() {
            this.e1++;
        },
        previousStep() {
            this.e1--;
        },
        resultStep() {
            this.e1 = 4;
        },
        autoStep() {
            this.e1 = 2;
        }
    },
}
</script>