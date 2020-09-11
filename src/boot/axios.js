import Vue from 'vue'
import axios from 'axios'

const http = axios.create({
  // baseURL: 'http://api.home.bi.group:1337'
  // baseURL: 'https://strapi.home.bi.group',
  baseURL:'http://localhost:8080/api/'
})
export default ({ Vue }) => {
  Vue.prototype.$axios = http
}
export { http }
