<template>
  <div class="form-container">
    <h2>Update Patient History</h2>

    <form @submit.prevent="saveHistory">
      <!-- Patient Info -->
      <div class="form-group">
        <label>Patient Name:</label>
        <span>{{ patient.name }}</span>
      </div>

      <div class="form-group">
        <label>Department:</label>
        <span>{{ patient.department }}</span>
      </div>

      <!-- Visit Type -->
      <div class="form-group">
        <label for="visit_type">Visit Type:</label>
        <input
          type="text"
          id="visit_type"
          v-model="history.visit_type"
          required
        />
      </div>

      <!-- Test Done -->
      <div class="form-group">
        <label for="test_done">Test Done:</label>
        <input
          type="text"
          id="test_done"
          v-model="history.test_done"
        />
      </div>

      <!-- Diagnosis -->
      <div class="form-group">
        <label for="diagnosis">Diagnosis:</label>
        <textarea
          id="diagnosis"
          v-model="history.diagnosis"
        ></textarea>
      </div>

      <!-- Prescription -->
      <div class="form-group">
        <label for="prescription">Prescription:</label>
        <textarea
          id="prescription"
          v-model="history.prescription"
        ></textarea>
      </div>

      <!-- Medicines -->
      <h3>Medicines</h3>
      <table class="medicine-table">
        <tbody>
          <tr>
            <td>
              <input
                type="text"
                v-model="medicines"
              />
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Save Button -->
      <button type="submit" class="btn btn-success">Save</button>
    </form>
  </div>
</template>

<script>
export default {
  name: "UpdatePatientHistory",
  data() {
    return {
      patient: {
        id: 1,
        name: "John Doe",
        department: "Cardiology",
      },
      history: {
        visit_type: "Consultation",
        test_done: "Blood Test",
        diagnosis: "Hypertension",
        prescription: "Lifestyle changes",
      },
      medicines: "Amlodipine, Aspirin",
    };
  },
  methods: {
    saveHistory() {
      console.log("Saving patient history:", {
        patient_id: this.patient.id,
        ...this.history,
        medicines: this.medicines,
      });
    },
  },
};
</script>

<style scoped>
.form-container {
  max-width: 600px;
  margin: auto;
}
.form-group {
  margin-bottom: 1rem;
}
.medicine-table {
  width: 100%;
  margin-bottom: 1rem;
}
</style>
