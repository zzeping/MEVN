import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AllPatientsView from '../views/AllPatientsView.vue'
import MyRecordsView from '../views/MyRecordsView.vue'
import AddPatientView from '../views/AddPatientView.vue'
import Patient from '../views/Patient.vue'
import Steps from '../views/Steps.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/all_patients',
    name: 'all_patients',
    component: AllPatientsView
  },
  {
    path: '/my_records',
    name: 'my_records',
    component: MyRecordsView
  },
  {
    path: '/add_patient',
    name: 'add_patient',
    component: AddPatientView
  },
  {
    path: '/patient/:id',
    name: 'patient',
    component: Patient
  },
  {
    path: '/steps',
    name: 'steps',
    component: Steps
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
