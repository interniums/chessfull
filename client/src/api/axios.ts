// @ts-nocheck

import axios from 'axios'
const BASE_URL = 'https://chessfull-production.up.railway.app'

export default axios.create({
  baseURL: BASE_URL,
})

export const axiosPrivate = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})
