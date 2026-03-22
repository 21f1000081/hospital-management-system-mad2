<template>
  <div>
    <div class="d-flex align-items-center mb-3">
      <h2 class="me-3">Update Patient History</h2>
      <small class="text-muted">Manage appointments and medical history of patient</small>
    </div>

    <p>
      <strong>Patient Name:</strong> {{ patient.name }} |
      <strong>Department:</strong> {{ doctor.specialization }}
    </p>
    <hr />

    <form @submit.prevent="saveHistory">
      <!-- Visit Type -->
      <label class="form-label" for="type">Visit Type:</label>
      <input class="form-control" type="text" id="type" v-model="appointment.type" />

      <!-- Tests -->
      <label class="form-label" for="tests">Test Done:</label>
      <input class="form-control" type="text" id="tests" v-model="treatment.tests" />

      <!-- Diagnosis -->
      <label class="form-label" for="diagnosis">Diagnosis:</label>
      <input class="form-control" type="text" id="diagnosis" v-model="treatment.diagnosis" />

      <!-- Prescription -->
      <label class="form-label" for="prescription">Prescription:</label>
      <input class="form-control" type="text" id="prescription" v-model="treatment.prescription" />
      <br />
      <hr />

      <!-- Medicines -->
      <h5>Medicines</h5>
      <div v-for="(med, i) in medicines" :key="i" class="row g-2 align-items-end mb-2">
        <div class="col-12 col-md-4">
          <label :for="'medicine_name_' + i" class="form-label">Medicine name {{ i + 1 }}</label>
          <input type="text" :id="'medicine_name_' + i" v-model="med.name" class="form-control" />
        </div>
        <div class="col-4 col-md-2">
          <label :for="'dose_m_' + i" class="form-label">Morning</label>
          <input type="text" :id="'dose_m_' + i" v-model="med.dosage_morning" class="form-control" />
        </div>
        <div class="col-4 col-md-2">
          <label :for="'dose_d_' + i" class="form-label">Day</label>
          <input type="text" :id="'dose_d_' + i" v-model="med.dosage_day" class="form-control" />
        </div>
        <div class="col-4 col-md-2">
          <label :for="'dose_e_' + i" class="form-label">Evening</label>
          <input type="text" :id="'dose_e_' + i" v-model="med.dosage_night" class="form-control" />
        </div>
      </div>

      <button
        type="button"
        class="btn btn-outline-primary mb-3"
        @click="addMedicine"
        :disabled="medicines.length >= 5"
      >
        Add Medicine
      </button>

      <hr />
      <button type="submit" class="btn btn-success float-right">Save</button>
    </form>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "UpdatePatientHistory",
  data() {
    return {
      patient:       { name: "" },
      doctor:        { specialization: "" },
      appointment:   { type: "" },
      treatment:     { tests: "", diagnosis: "", prescription: "" },
      medicines:     [{ name: "", dosage_morning: "", dosage_day: "", dosage_night: "" }],
      appointmentId: null,
      doctorId:      null
    };
  },
  async mounted() {
    const token = localStorage.getItem("access_token");
    this.appointmentId = this.$route.params.id;

    if (!this.appointmentId) {
      alert("Appointment ID is missing from the route.");
      return;
    }

    try {
      const res = await axios.get(
        `http://127.0.0.1:5000/doctors/update_history/${this.appointmentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      this.patient     = res.data.patient     || { name: "" };
      this.doctor      = res.data.doctor      || { specialization: "" };
      this.appointment = res.data.appointment || { type: "" };

      const t = res.data.treatment || {};
      this.treatment = {
        tests:        t.tests        || "",
        diagnosis:    t.diagnosis    || "",
        prescription: t.prescription || ""
      };

      this.medicines = res.data.medicines?.length > 0
        ? res.data.medicines.map(m => ({
            name:           m.name           || "",
            dosage_morning: m.dosage_morning || "",
            dosage_day:     m.dosage_day     || "",
            dosage_night:   m.dosage_night   || ""
          }))
        : [{ name: "", dosage_morning: "", dosage_day: "", dosage_night: "" }];

      this.doctorId = res.data.doctor?.user_id || res.data.doctor?.id || null;

    } catch (err) {
      console.error("Failed to load appointment:", err);
      alert("Failed to load appointment data.");
    }
  },
  methods: {
    async saveHistory() {
      const token = localStorage.getItem("access_token");

      if (!this.appointmentId) {
        alert("Appointment ID is missing, cannot save.");
        return;
      }

      const payload = {
        tests:        this.treatment.tests,
        diagnosis:    this.treatment.diagnosis,
        prescription: this.treatment.prescription,
        medicines: this.medicines.filter(m => m.name.trim())
      };

      try {
        await axios.patch(
          `http://127.0.0.1:5000/doctors/update_history/${this.appointmentId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        alert("Patient history updated successfully!");

        if (this.doctorId) {
          this.$router.push(`/doctors/doctors_dashboard/${this.doctorId}`);
        } else {
          alert("Doctor ID missing, cannot redirect.");
        }
      } catch (err) {
        console.error("Error updating history:", err);
        alert("Failed to update patient history.");
      }
    },

    addMedicine() {
      if (this.medicines.length < 5) {
        this.medicines.push({ name: "", dosage_morning: "", dosage_day: "", dosage_night: "" });
      }
    }
  }
};
</script>

<style scoped>
.form-label {
  font-weight: 500;
}
</style>