import { createRouter, createWebHistory } from 'vue-router'

import AdminDashboard from '../views/AdminDashboard.vue'
import RegisterUser from '../admin/UserRegistration.vue'
import LoginUser from '../admin/UserLogin.vue'
import UsersList from '../admin/UsersList.vue'
import MDepartments from '../admin/departments/MDepartments.vue'
import DeptEdit from '../admin/departments/DeptEdit.vue'
import DeptDelete from '../admin/departments/DeptDelete.vue'
import AddDoctor from '../admin/doctors/AddDoctor.vue'
import EditDoctor from '../admin/doctors/EditDoctor.vue'
import DeleteDoctor from '../admin/doctors/DeleteDoctor.vue'
import DoctorsDashboard from '../admin/doctors/DoctorsDashboard.vue'
import DoctorsAvailability from '../admin/doctors/DoctorsAvailability.vue'
import DoctorsView from '../admin/doctors/DoctorsView.vue'
import PatientDashboard from '../admin/patients/PatientDashboard.vue'
import PatientHistory from '../admin/patients/PatientHistory.vue'
import PatientHistoryDoctor from '../admin/patients/PatientHistoryDoctor.vue'
import UpdatePatientHistory from '../admin/patients/UpdatePatientHistory.vue'
import EditPatient from '../admin/patients/EditPatient.vue'
import DeletePatient from '../admin/patients/DeletePatient.vue'
import DoctorAppointment from '../admin/patients/DoctorAppointment.vue'
import CancelAppointment from '../admin/patients/CancelAppointment.vue'
import PatientTreatment from '../admin/patients/PatientTreatment.vue'
import DepartmentView from '../admin/DepartmentView.vue'
import NotFound from '../views/NotFound.vue'
import AddPatient from '../admin/patients/AddPatient.vue'

function isAuthenticated() {
  return !!localStorage.getItem('access_token')
}

function getUserRole() {
  try {
    const userInfo = JSON.parse(localStorage.getItem('user_info'))
    return userInfo && userInfo.role ? userInfo.role : null
  } catch {
    return null
  }
}

function getUserId() {
  try {
    const userInfo = JSON.parse(localStorage.getItem('user_info'))
    return userInfo?.id || null
  } catch {
    return null
  }
}

function getDashboardPath(role, id) {
  if (role === 'admin')   return '/admin'
  if (role === 'doctor')  return `/doctors/doctors_dashboard/${id}`
  if (role === 'patient') {
    try {
      const userInfo = JSON.parse(localStorage.getItem('user_info'))
      return `/patient/patient_dashboard/${userInfo?.patient_id}`
    } catch {
      return `/login`
    }
  }
  return null
}

const routes = [
  {
    path: '/',
    redirect: () => {
      if (!isAuthenticated()) return '/login'
      const path = getDashboardPath(getUserRole(), getUserId())
      return path || '/login'
    }
  },

  // Auth / public
  { path: '/register',   name: 'RegisterUser',   component: RegisterUser,   meta: { guestOnly: true } },
  { path: '/login',      name: 'LoginUser',       component: LoginUser,      meta: { guestOnly: true } },
  { path: '/logout', name: 'logout' },

  // Admin
  { path: '/users',      name: 'UsersList',       component: UsersList,      meta: { requiresAuth: true, roles: ['admin'] } },
  { path: '/departments/add',        name: 'DepartmentAdd',  component: MDepartments, meta: { requiresAuth: true, roles: ['admin'] } },
  { path: '/departments/edit/:id',   name: 'DeptEdit',       component: DeptEdit,     meta: { requiresAuth: true, roles: ['admin'] } },
  { path: '/departments/delete/:id', name: 'DeptDelete',     component: DeptDelete,   meta: { requiresAuth: true, roles: ['admin'] } },
  { 
    path: '/admin',
    name: 'DashboardAdmin',
    component: AdminDashboard,
    meta: { requiresAuth: true, roles: ['admin'] }
  },

  // Doctors management
  { path: '/doctors/add',            name: 'AddDoctor',      component: AddDoctor,    meta: { requiresAuth: true, roles: ['admin'] } },
  { path: '/doctors/edit/:id',       name: 'EditDoctor',     component: EditDoctor,   meta: { requiresAuth: true, roles: ['admin'] } },
  { path: '/doctors/delete/:id',     name: 'DeleteDoctor',   component: DeleteDoctor, meta: { requiresAuth: true, roles: ['admin'] } },
  {
    path: '/doctors/doctors_dashboard/:id',
    name: 'DoctorsDashboard',
    component: DoctorsDashboard,
    props: true,
    meta: { requiresAuth: true, roles: ['admin', 'doctor'] }
  },
  {
    path: '/doctors/doctors_availability/:id',
    name: 'DoctorsAvailability',
    component: DoctorsAvailability,
    props: route => ({ doctorId: Number(route.params.id) }),
    meta: { requiresAuth: true, roles: ['admin', 'doctor'] }
  },
  {
    path: '/doctors/doctor_view/:id',
    name: 'DoctorsView',
    component: DoctorsView,
    props: true,
    meta: { requiresAuth: true, roles: ['admin', 'doctor'] }
  },

  // Patient routes
  {
    path: '/patient/patient_dashboard/:id',
    name: 'PatientDashboard',
    component: PatientDashboard,
    props: true,
    meta: { requiresAuth: true, roles: ['admin', 'doctor', 'patient'] }
  },
  {
    path: '/patient_history/:id',
    name: 'patient_history',
    component: PatientHistory,
    props: route => ({ id: Number(route.params.id) }),
    meta: { requiresAuth: true, roles: ['patient', 'admin'] }
  },
  {
    path: '/patient_history_doctor/:doctorId/:patientId',
    name: 'PatientHistoryDoctor',
    component: PatientHistoryDoctor,
    props: true,
    meta: { requiresAuth: true, roles: ['doctor', 'admin'] }
  },
  {
    path: '/doctors/update_history/:id',
    name: 'UpdatePatientHistory',
    component: UpdatePatientHistory,
    props: true,
    meta: { requiresAuth: true, roles: ['doctor', 'admin'] }
  },
  {
    path: '/patient/edit/:id',
    name: 'EditPatient',
    component: EditPatient,
    props: true,
    meta: { requiresAuth: true, roles: ['doctor', 'patient', 'admin'] }
  },
  {
    path: '/patient/delete/:id',
    name: 'DeletePatient',
    component: DeletePatient,
    props: true,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/appointment/:doctorId',
    name: 'DoctorAppointment',
    component: DoctorAppointment,
    props: route => ({ doctorId: Number(route.params.doctorId) }),
    meta: { requiresAuth: true, roles: ['patient', 'admin'] }
  },
  {
    path: '/patient/cancel-appointment/:id',
    name: 'CancelAppointment',
    component: CancelAppointment,
    props: true,
    meta: { requiresAuth: true, roles: ['patient', 'admin'] }
  },
  {
    path: '/patient/treatment/:id',
    name: 'PatientTreatment',
    component: PatientTreatment,
    props: true,
    meta: { requiresAuth: true, roles: ['patient', 'doctor', 'admin'] }
  },
  {
    path: '/department/:id',
    name: 'DepartmentView',
    component: DepartmentView,
    props: true,
    meta: { requiresAuth: true, roles: ['admin', 'doctor', 'patient'] }
  },
  {
    path: '/patient/add',
    name: 'AddPatient',
    component: AddPatient,
    meta: { requiresAuth: true, roles: ['patient'] }
  },

  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  // Handle logout
  if (to.name === 'logout') {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_info')
    return next('/login')
  }

  const authenticated = isAuthenticated()
  const role = getUserRole()
  const id   = getUserId()
  const dashboard = getDashboardPath(role, id)

  if (to.meta.guestOnly && authenticated) {
    if (!dashboard) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user_info')
      return next('/login')
    }
    return next(dashboard)
  }

  if (to.meta.requiresAuth && !authenticated) {
    return next('/login')
  }

  if (to.meta.roles && role && !to.meta.roles.includes(role)) {
    if (!dashboard) return next('/login')
    return next(dashboard)
  }

  next()
})

export default router
