<template>
    <div>
        <v-card class="mb-12" height="200px">
            <div>
                <h2>Step Three</h2>
            </div>
        </v-card>

        <v-btn color="primary" @click="nextStep">
            Continue
        </v-btn>

        <v-btn text>Back</v-btn>
    </div>
</template>

<script>
export default {
    props: {
        next: Function
    },
    methods: {
        nextStep() {
            this.next();
        }
    }
}
</script>