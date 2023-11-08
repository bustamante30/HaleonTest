import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import { createApp } from "vue";
import "primevue/resources/primevue.min.css";
import "primevue/resources/themes/lara-light-blue/theme.css";
import "primeicons/primeicons.css";
import "./assets/styles/main.sass";
import App from "./App.vue";
import router from "./router";
import Button from "@/components/ui/Button.vue";
import Mask from "@/components/ui/Mask.vue";
import ScrollPanel from "@/components/ui/ScrollPanel.vue";
import Panel from "@/components/ui/Panel.vue";
import Spinner from "@/components/ui/Spinner.vue";

// Prime Components
import AutoComplete from "primevue/autocomplete";
import Calendar from "primevue/calendar";
import Checkbox from "primevue/checkbox";
import Dialog from "primevue/dialog";
import Dropdown from "primevue/dropdown";
import Image from "primevue/image";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";
import InputSwitch from "primevue/inputswitch";
import Listbox from "primevue/listbox";
import Menu from "primevue/menu";
import MultiSelect from "primevue/multiselect";
import OverlayPanel from "primevue/overlaypanel";
import Tooltip from "primevue/tooltip";
import BadgeDirective from "primevue/badgedirective";
import Message from "primevue/message";
import ToastService from "primevue/toastservice";
import Paginator from "primevue/paginator";
import Textarea from "primevue/textarea";
import Toast from "primevue/toast";
import RadioButton from "primevue/radiobutton";

import ConfirmationService from "primevue/confirmationservice";
import ConfirmDialog from "primevue/confirmdialog";
import Menubar from "primevue/menubar";
import ToggleButton from "primevue/togglebutton";
import { ImageMagnifier } from "vue-image-magnifier";

const app = createApp(App);

app.use(createPinia());
app.use(PrimeVue);
app.use(router);
app.use(ToastService);
app.use(ConfirmationService);

// UI Components - No Business Logic
app.component("SgsButton", Button);
app.component("SgsMask", Mask);
app.component("SgsScrollpanel", ScrollPanel);
app.component("SgsPanel", Panel);
app.component("SgsSpinner", Spinner);
// Prime Components & Directives
app.directive("tooltip", Tooltip);
app.directive("badge", BadgeDirective);
app.component("PrimeAutoComplete", AutoComplete);
app.component("PrimeCalendar", Calendar);
app.component("PrimeCheckbox", Checkbox);
app.component("PrimeDialog", Dialog);
app.component("PrimeDropdown", Dropdown);
app.component("PrimeListbox", Listbox);
app.component("PrimeInputtext", InputText);
app.component("PrimeInputSwitch", InputSwitch);
app.component("PrimeInputnumber", InputNumber);
app.component("PrimeMenu", Menu);
app.component("PrimeMultiSelect", MultiSelect);
app.component("PrimePanel", Panel);
app.component("PrimeOverlayPanel", OverlayPanel);
app.component("PrimeImage", Image);
app.component("PrimeMessage", Message);
app.component("PrimePagination", Paginator);
app.component("PrimeTextarea", Textarea);
app.component("PrimeToast", Toast);
app.component("PrimeRadiobutton", RadioButton);
app.component("PrimeConfirmDialog", ConfirmDialog);
app.component("PrimeMenubar", Menubar);
app.component("PrimeToggleButton", ToggleButton);
app.component("ImageMagnifier", ImageMagnifier);
app.mount("#app");
