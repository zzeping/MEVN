<template>
    <v-container class="pl-10 pr-10">
        <v-card class="mb-8 pl-8" height="490px">
            <svg ref="chart1"></svg>
            <svg ref="chart2"></svg>
            <svg ref="chart3"></svg>

        </v-card>

        <v-row class="text-center">
            <v-col md="6" class="d-flex justify-left">
                <v-btn color="primary" @click="previousStep">back</v-btn>
            </v-col>
            <v-col md="6" class="d-flex justify-end">
                <v-btn color="primary" @click="nextStep">view result</v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
export default {
    props: {
        next: Function,
        previous: Function,
        formData: {
            type: Object,
            required: true
        },
    },
    methods: {
        nextStep() {
            this.next();
        },
        previousStep() {
            this.previous();
        },

    }
}
</script>