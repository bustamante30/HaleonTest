import { genLocations, genPrinters } from '@/data/mock/printers'
import { genUsers } from '@/data/mock/users'
import { faker } from '@faker-js/faker'
import { defineStore } from 'pinia'
import { chunk } from 'lodash'
import router from '@/router'

export const useUsersStore = defineStore('users', {
  state: () => ({
    all: [] as any[], // Mock all printers in db
    printers: {
      page: 0,
      perPage: 20,
      data: [] as any[]
    } as any,
    selected: null as any,
    loading: {
      printers: false,
      printer: false
    },
    options: {
      locations: [
        { label: 'Lancaster', value: 1 },
        { label: 'Concord NH', value: 2 },
        { label: 'Neenah, WI', value: 3 }
      ]
    },
    user: null as any
  }),
  actions: {
    async getPrinters(page: number, perPage: number = 20) {
      const total = 301
      if (!this.all.length) {
        const all = genPrinters(total)
        this.all = chunk(all, 20)
      }
      this.printers = {
        page,
        perPage,
        total,
        data: this.all && this.all[page] ? this.all[page] : []
      }
      this.selected = this.printers.data[0]
      if (this.selected) this.getPrinterById(this.selected?.id)
    },
    async getPrinterById(id: string) {
      const printer = this.printers.data.find((p: any) => p.id === id)
      // const locations = genLocations(printer.summary.locations)
      const locations = genLocations()
      const printerDetails = {
        ...printer,
        locations,
        users: [
          ...genUsers(printer.summary.admins, printer.name, locations, true),
          ...genUsers(printer.summary.users, printer.name, locations),
        ],
        internalUsers: [
          ...genUsers(printer.summary.internalUsers, 'sgsco'),
        ],
        identityProvider: {
          type: 'google',
          tenantId: null,
          admin: null,
          email: null
        }
      }
      this.selectPrinter(printerDetails)
    },
    selectPrinter(printer: any) {
      this.selected = { ...printer }
    },
    createUser() {
      if (this.selected) {
        this.user = this.user || {
          firstName: null,
          lastName: null,
          email: null,
          isAdmin: false
        }
      }
      router.push('/users/new')
    },
    getUser(id: string) {
      const users = this.selected.users
      const user = users?.find((u: any) => u.id === id)
      if (user) this.editUser(user)
    },
    editUser(user: any) {
      console.log(user)
      if (this.selected && user) {
        this.user = { ...user}
      }
      // router.push(`/users/${user.id}`)
    },
    saveUser() {
      console.log('Save user', this.user)
      this.user = null
      router.push('/users')
    }
  },
});