import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import { VueFire, VueFireAuth } from 'vuefire';
import { firebaseApp } from './firebase';

const app = createApp(App);
app.use(VueFire, {
  firebaseApp,
  modules: [VueFireAuth()],
});

app.mount('#app');
