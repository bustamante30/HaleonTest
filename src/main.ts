import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import { createApp } from 'vue'

import 'primevue/resources/primevue.min.css'
import 'primevue/resources/themes/lara-light-blue/theme.css'
import 'primeicons/primeicons.css'
import './assets/styles/main.sass'

import App from './App.vue'
import router from './router'

import Button from '@/components/ui/Button.vue'
import Mask from '@/components/ui/Mask.vue'
import ScrollPanel from '@/components/ui/ScrollPanel.vue'

// Prime Components
import AutoComplete from 'primevue/autocomplete'
import Calendar from 'primevue/calendar'
import Checkbox from 'primevue/checkbox'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import Image from 'primevue/image'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Listbox from 'primevue/listbox'
import Menu from 'primevue/menu'
import MultiSelect from 'primevue/multiselect'
import OverlayPanel from 'primevue/overlaypanel'
import Panel from 'primevue/panel'
import Tooltip from 'primevue/tooltip'
import BadgeDirective from 'primevue/badgedirective';

const app = createApp(App)

app.use(createPinia())
app.use(PrimeVue)
app.use(router)

// UI Components - No Business Logic
app.component('SgsButton', Button)
app.component('SgsMask', Mask)
app.component('SgsScrollpanel', ScrollPanel)

// Prime Components & Directives
app.directive('tooltip', Tooltip)
app.directive('badge', BadgeDirective)
app.component('PrimeAutoComplete', AutoComplete)
app.component('PrimeCalendar', Calendar)
app.component('PrimeCheckbox', Checkbox)
app.component('PrimeDialog', Dialog)
app.component('PrimeDropdown', Dropdown)
app.component('PrimeListbox', Listbox)
app.component('PrimeInputtext', InputText)
app.component('PrimeInputnumber', InputNumber)
app.component('PrimeMenu', Menu)
app.component('PrimeMultiSelect', MultiSelect)
app.component('PrimePanel', Panel)
app.component('PrimeOverlayPanel', OverlayPanel)
app.component('PrimeImage', Image)

app.mount('#app')
