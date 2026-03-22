<template>
  <div>
    <div class="d-flex align-items-center mb-3">
      <h2 class="me-3">Patient History</h2>
    </div>

    <div class="container mt-4">
      <div class="card mb-4 shadow-sm">
        <div class="card-body">
          <p><strong>Patient Name:</strong> {{ patient.name }}</p>
          <p><strong>Doctor:</strong> {{ doctor.name }}</p>
          <p><strong>Department:</strong> {{ doctor.specialization }}</p>
        </div>
      </div>

      <div class="card card-outline shadow-sm mt-4">
        <div class="card-body">
          <h5 class="mb-3">Patient History</h5>

          <div class="table-responsive">
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
                <tr v-for="(visit, index) in enrichedTreatments" :key="visit.id">
                  <td>{{ index + 1 }}</td>
                  <td>{{ visit.date || '-' }}</td>
                  <td>{{ visit.type || '-' }}</td>
                  <td>{{ visit.tests || '-' }}</td>
                  <td>
                    <span v-if="!visit.diagnosis" class="text-warning fw-semibold">Pending</span>
                    <span v-else>{{ visit.diagnosis }}</span>
                  </td>
                  <td>{{ visit.prescription || '-' }}</td>
                  <td>
                    <ul class="mb-0 ps-3">
                      <template v-if="visit.medicines && visit.medicines.length > 0">
                        <li v-for="(med, mIndex) in visit.medicines" :key="mIndex">
                          {{ med.name || med }}
                        </li>
                      </template>
                      <li v-else class="text-muted">No medicines prescribed</li>
                    </ul>
                  </td>
                </tr>
                <tr v-if="enrichedTreatments.length === 0">
                  <td colspan="7" class="text-muted text-center">No visits found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div v-if="errorMessage" class="alert alert-danger mt-3">
      {{ errorMessage }}
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
      patient:      {},
      doctor:       {},
      appointments: [],
      treatments:   [],
      errorMessage: null
    };
  },

  computed: {
    enrichedTreatments() {
      return this.treatments.map(t => {
        const appt = this.appointments.find(a => a.id === t.appointment_id);
        return {
          ...t,
          date: appt?.date || '-',
          type: appt?.type || '-'
        };
      });
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
      this.errorMessage = "Invalid route. Doctor or Patient ID is missing.";
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
        console.error("Error fetching patient history:", err);
        this.errorMessage = "Could not load patient history. Please try again later.";
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