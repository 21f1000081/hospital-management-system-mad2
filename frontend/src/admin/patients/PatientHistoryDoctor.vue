<template>
  <div>
    <div class="d-flex align-items-center mb-3">
      <h2 class="me-3">Patient History</h2>
    </div>

    <div class="container mt-4">
      <!-- Patient & Doctor Info -->
      <div class="card mb-4 shadow-sm">
        <div class="card-body">
          <p><strong>Patient Name:</strong> {{ patient.name }}</p>
          <p><strong>Doctor:</strong> {{ doctor.name }}</p>
          <p><strong>Department:</strong> {{ doctor.specialization }}</p>
        </div>
      </div>

      <!-- Patient History Table -->
      <div class="card card-outline shadow-sm mt-4">
        <div class="card-body">
          <h5 class="mb-3">Patient History</h5>

          <div v-if="appointments.length > 0" class="table-responsive">
            <table class="table table-hover align-middle">
              <thead class="table-light">
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Visit Type</th>
                  <th>Tests Done</th>
                  <th>Diagnosis</th>
                  <th>Prescription</th>
                  <th>Medicines</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(appt, index) in appointments" :key="appt.id">
                  <td>{{ index + 1 }}</td>
                  <td>{{ appt.date }}</td>
                  <td>{{ appt.type }}</td>
                  <td>{{ getTreatment(appt.id)?.tests || '-' }}</td>
                  <td>
                    <span v-if="getTreatment(appt.id)?.diagnosis">
                      {{ getTreatment(appt.id).diagnosis }}
                    </span>
                    <span v-else class="text-warning fw-semibold">Pending</span>
                  </td>
                  <td>{{ getTreatment(appt.id)?.prescription || '-' }}</td>
                  <td>
                    <ul class="mb-0 ps-3">
                      <template v-if="getTreatment(appt.id)?.medicines?.length > 0">
                        <li v-for="(med, mIndex) in getTreatment(appt.id).medicines" :key="mIndex">
                          {{ med.name || med }}
                        </li>
                      </template>
                      <li v-else class="text-muted">No medicines prescribed</li>
                    </ul>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p v-else class="text-muted">No patient history available.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "PatientHistoryDoctor",

  props: {
    doctorId:  { type: String, required: true },
    patientId: { type: String, required: true }
  },

  data() {
    return {
      patient:      { name: "" },
      doctor:       { name: "", specialization: "" },
      appointments: [],
      treatments:   []
    };
  },

  methods: {
    getTreatment(appointmentId) {
      return this.treatments.find(t => t.appointment_id === appointmentId) || null;
    }
  },

  async mounted() {
    const token = localStorage.getItem("access_token");

    if (!token) {
      this.$router.push("/login");
      return;
    }

    if (!this.doctorId || !this.patientId) {
      console.error("Missing props — doctorId:", this.doctorId, "patientId:", this.patientId);
      return;
    }

    try {
      const res = await axios.get(
        `http://127.0.0.1:5000/patient_history_doctor/${this.doctorId}/${this.patientId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      this.patient      = res.data.patient      || {};
      this.doctor       = res.data.doctor       || {};
      this.appointments = res.data.appointments || [];
      this.treatments   = res.data.treatments   || [];

    } catch (err) {
      if (err.response?.status === 401) {
        alert("Unauthorized: Please log in as a doctor or admin.");
        this.$router.push("/login");
      } else {
        console.error("Failed to load patient history:", err);
      }
    }
  }
};
</script>

<style scoped>
.text-warning {
  color: #e6a817 !important;
}
</style>