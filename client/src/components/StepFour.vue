<template>
    <div>
        <v-card class="mb-12" height="200px">
            <div>
                <h2>Step Four</h2>
            </div>
        </v-card>

        <v-btn color="primary">
            Submit
        </v-btn>

        <v-btn text @click="previousStep">Back</v-btn>
    </div>
</template>

<script>
export default {
    props: {
        previous: Function
    },
    methods: {
        previousStep() {
      this.previous();
    }
    }
}
</script>