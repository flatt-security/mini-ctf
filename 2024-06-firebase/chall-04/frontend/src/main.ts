import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import { VueFire, VueFireAuth } from 'vuefire';
import { firebaseApp } from './firebase';
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

const app = createApp(App);
app.use(VueFire, {
  firebaseApp,
  modules: [VueFireAuth()],
});

const vuetify = createVuetify({
  components,
  directives,
});
app.use(vuetify);

app.mount('#app');
