<template>
    <div>
        <v-card class="mb-12" height="400px">
            
        </v-card>

        <v-btn color="primary" @click="nextStep">
            Continue
        </v-btn>

        <v-btn text @click="previousStep">Back</v-btn>
    </div>
</template>

<script>
export default {
    data() {
        return {
            
        }
    },
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
        loadDataFile(file) {
            let reader = new FileReader()
            reader.onload = (e) => {
                this.fileContent = e.target.result
                const lines = this.fileContent.split('\n');
                this.formData.test_time = lines[1];

            };
            reader.readAsText(file);
        }
    },
    mounted() {
        if(this.formData.dataFile != null) {
            this.loadDataFile(this.formData.dataFile);
        }
    }
}
</script>