import axios from "axios";
const url = "/api/patient";

export default class API {
    // to get all the patients
    static async getAllPatient(){
        const res = await axios.get(url);
        return res.data;
    }


    // to get the patient by id
    static async getPatientByID(id){
        const res = await axios.get(`${url}/${id}`);
        return res.data;
    }

    // to add a patient in database
    static async addPatient(patient){
        const res = await axios.post(url, patient);
        return res.data;
    }

    // to upload data file
    // static async uploadData(data){
    //     const res = await axios.post(`${url}/dataUpload`, data);
    //     return res.data;
    // }


    // to update a patient in database
    static async updatePatient(id, patient){
        const res = await axios.patch(`${url}/${id}`, patient);
        return res.data;
    }

    // to delete a patient in database
    static async deletePatient(id){
        const res = await axios.delete(`${url}/${id}`);
        return res.data;
    }

}