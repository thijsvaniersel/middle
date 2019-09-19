import Vue from 'vue'
import * as VueGoogleMaps from 'vue2-google-maps'
 
Vue.use(VueGoogleMaps, {
  load: {
    key: 'AIzaSyBZ_o2hsYM5ebWw8nXSTtv-u_Y8A7-wNhs',
    libraries: 'places',
  },
  autobindAllEvents: true,
})