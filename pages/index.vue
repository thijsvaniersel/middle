<template>
  <no-ssr>
    <div 
      class="middle" 
      :class="show == 'addresses' ? 'small' : 'wide'" 
      :id="Object.keys(markers.addressOne).length === 0 && Object.keys(markers.addressTwo).length === 0 ? 'start' : ''">

      <nav class="sidebar">
        <div class="sidebarInner">
          
          <top />

          <div class="buttons">
            <a @click="switchShow('addresses')" :class="show == 'addresses' ? 'active' : ''">Addresses</a>
            <a @click="switchShow('suggestions')" :class="show == 'suggestions' ? 'active' : ''">Meet here</a>
            <div class="clear"></div>
          </div>

          <addresses />

          <section class="suggestions" v-show="show === 'suggestions'">

            <p v-if="markers.suggestions.length == 0" class="error">No suggestions for a place to meet yet...</p>

            <div
              v-if="markers.suggestions.length > 0"
              class="suggestion"
              v-for="(marker, index) in markers.suggestions"
              :key="marker.position.lat"
              :class="infoWinOpen === true && currentMidx == index ? 'active' : ''"
              @click="toggleInfoWindow(marker,index)">

                <div
                  class="headerImage"
                  :style="{ backgroundImage: `url(${marker.photos[0].getUrl()})` }"
                  v-if="marker.photos && infoWinOpen === true && currentMidx == index">
                </div>

                <div class="info">
                  <h4>{{ marker.name }}</h4>
                  <p class="suggestionAddress" v-if="marker.vicinity">{{ marker.vicinity }}</p>
                  <p v-if="marker.opening_hours">{{ marker.opening_hours.open_now === true ? 'Is open' : 'Closed'}}</p>
                </div>
            </div>
          </section>
        </div>
      </nav>

      <main role="main">
        <GmapMap
          :zoom="10"
          :center="{
            lat: 52.3545362,
            lng: 4.7638781
          }"
          id="googleMap"
          ref="mapRef"
          map-type-id="terrain"
          >

          <GmapMarker
            v-if="markers.suggestions.length > 0"
            v-for="(marker, index) in markers.suggestions"
            :key="index"
            :position="marker.position"
            @click="toggleInfoWindow(marker,index)"
            :icon="{ url: require('@/assets/images/suggestion.png')}"
          />

          <GmapMarker
            v-if="Object.keys(markers.addressOne).length !== 0"
            :position="{
              lat: this.markers.addressOne.position.lat,
              lng: this.markers.addressOne.position.lng
            }"
            :icon="{ url: require('@/assets/images/addressOne.png')}"            
          />

          <GmapMarker
            v-if="Object.keys(markers.addressTwo).length !== 0"
            :position="{
              lat: this.markers.addressTwo.position.lat,
              lng: this.markers.addressTwo.position.lng
            }"
            :icon="{ url: require('@/assets/images/addressTwo.png')}"
          />

          <gmap-info-window
            :options="infoOptions"
            :position="infoWindowPos"
            :opened="infoWinOpen"
            @closeclick="infoWinOpen=false"
          >
            <div v-html="infoContent"></div>
          </gmap-info-window>
        </GmapMap>
      </main>
    </div>
  </no-ssr>
</template>

<script>
import top from '@/components/top'
import addresses from '@/components/addresses'

export default {

  components: {
    top,
    addresses
  },

  data(){
    return {
      infoContent: '',
      infoWindowPos: {
        lat: 0,
        lng: 0
      },
      infoWinOpen: false,
      currentMidx: null,
      infoOptions: {
        pixelOffset: {
          width: 0,
          height: -35
        }
      },
    }
  },

  computed: {
    addressOne: function() {
      return this.$store.state.map.addressOne
    },
    addressTwo: function() {
      return this.$store.state.map.addressTwo
    },
    markers: function() {
      return this.$store.state.map.markers
    },
    midPoint: function() {
      return this.$store.state.map.midPoint
    },
    show: function() {
      return this.$store.state.user.show
    }    
  },

  methods: {

    calculateMidPoint() {

      // calculate midPoint for lat and lng
      // set in store
      let payload = {
        lat: (this.addressOne.geometry.location.lat() + this.addressTwo.geometry.location.lat()) / 2,
        lng: (this.addressOne.geometry.location.lng() + this.addressTwo.geometry.location.lng()) / 2
      }
      this.$store.dispatch('map/changeMidPoint', payload)

      // after this, find the suggestions
      this.findSuggestions('5000')

    },

    findSuggestions(radius){

      // call naar google places voor bars etc in de buurt
      this.$refs.mapRef.$mapPromise.then((map) => {

        // calculate distance
        // if this is less then the default radius of 5K, make the radius smaller
        let distance = this.calculateDistance(this.addressOne.geometry.location, this.addressTwo.geometry.location);        
        if(distance < 5000) {
          radius = 500
        }

        // parameters
        let request = {
          location: new google.maps.LatLng(this.midPoint.latitude,this.midPoint.longitude),
          radius: radius,
          type: ['restaurant']
        };

        // init Google places
        let service = new google.maps.places.PlacesService(map);

        // perform API to Google places
        service.nearbySearch(request, (results, status) => {

          // when no results, expand the radius
          if(results.length == 0 || results == null){
            this.findSuggestions('20000')
            return
          }

          // map results in new array
          let suggestions = results.map(el => {
            return {
              position: {
                lat: el.geometry.location.lat(),
                lng: el.geometry.location.lng()
              },
              icon: el.icon,
              name: el.name,
              opening_hours: el.opening_hours,
              photos: el.photos,
              plus_code: el.plus_code,
              vicinity: el.vicinity,
              types: el.types
            }
          })

          // store suggestions
          this.$store.dispatch('map/changeSuggestions', suggestions)

          // change map position to the middle
          map.panTo(request.location)

          // zoom to the suggested markers
          this.smoothZoom(map, 12, map.getZoom());

          // fit bounds with all markers
          this.fitBounds()
        })
      })
    },

    calculateDistance(p1, p2){

      var rad = function(x) {
        return x * Math.PI / 180;
      };

      var R = 6378137; // Earth’s mean radius in meter
      var dLat = rad(p2.lat() - p1.lat());
      var dLong = rad(p2.lng() - p1.lng());
      var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
        Math.sin(dLong / 2) * Math.sin(dLong / 2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      var d = R * c;
      return Math.round(d); // returns the distance in meter
    },

    fitBounds(){
      //set bounds of the map
      this.$refs.mapRef.$mapPromise.then((map) => {
        const bounds = new google.maps.LatLngBounds()

        // add bounds of all suggestions
        if(this.markers.suggestions.length > 0){
          for (let m of this.markers.suggestions) {
            bounds.extend(m.position)
          }
        }

        // add to addresses
        if(this.markers.addressOne.position !== undefined){
          bounds.extend(this.markers.addressOne.position)
        }

        if(this.markers.addressTwo.position !== undefined){
          bounds.extend(this.markers.addressTwo.position)
        }

        // change bounds
        map.fitBounds(bounds);

        // If there's one marker, prevent zooming in too much
        if (map.getZoom() > 10) {
          map.setZoom(10)
        }

      });
    },

    smoothZoom (map, max, cnt) {

      // recursive loop to zoom till zoomlevel is reached
      if (cnt >= max) {
          return;
      } else {
        let z = google.maps.event.addListener(map, 'zoom_changed', (event) => {
        google.maps.event.removeListener(z);
        this.smoothZoom(map, max, cnt + 1);
      });
        setTimeout(() =>{map.setZoom(cnt)}, 80);
      }
    },

    toggleInfoWindow: function (marker, idx) {

      // toggle infowindow for each marker
      this.infoWindowPos = marker.position;
      this.infoContent = this.getInfoWindowContent(marker);

      //check if its the same marker that was selected if yes toggle
      if (this.currentMidx == idx) {
        this.infoWinOpen = !this.infoWinOpen;
      }

      //if different marker set infowindow to open and reset current marker index
      else {
        this.infoWinOpen = true;
        this.currentMidx = idx;
      }
    },

    getInfoWindowContent: function (marker) {

      // infowindow content
      return (`<div class="infoWindow">
        <h6 class="">${marker.name}</h6>
        <p>${marker.vicinity}</p>
      </div>`);
    },

    checkBothAddresses(){

      // do this check when an address changes
      if(Object.keys(this.addressOne).length !== 0 && Object.keys(this.addressTwo).length !== 0){
        return true
      }

      return false
    },

    switchShow: function(type){

      // switch view in the sidebar
      this.$store.dispatch('user/changeShow', type)
    },

    changeAddress(){
      // adjust map bounds
      this.fitBounds();

      // close any open infowindow
      this.infoWinOpen = false

      // check when addressone changes
      if(this.checkBothAddresses()){

        // change show in store
        this.$store.dispatch('user/changeShow', 'suggestions')

        // (re)calculate midPoint
        this.calculateMidPoint()
      }
    }
  },

  watch: {

    addressOne: function(){
      
      // all sorts of actions when an address changes
      this.changeAddress()
    },

    addressTwo: function(){

      // all sorts of actions when an address changes
      this.changeAddress()
    }
  }
}
</script>

<style lang="scss" scoped>
.middle {
  width: 100%;
  height: 100vh;
  
  &.small {
    #googleMap {
      width: 70%;
    }

    .sidebar {
      width: 30%;
    }

    .buttons {
      opacity: 1;
      display: block;
    }    
  }

  &.wide {
    #googleMap {
      width: 50%;
    }

    .sidebar {
      width: 50%;
    }
  }

  &#start {
    #googleMap {
      width: 0%;
    }

    .sidebar {
      width: 100%;
    }

    .buttons {
      opacity: 0;
      display: none;
    }
  }

  #googleMap {
    height: 100vh;
    display: block;
    position: absolute;
    top: 0;
    right: 0;
    transition: .3s all ease;
  }

  .sidebar {
    position: fixed;
    overflow-y: auto;
    height: 100vh;
    left: 0;
    top: 0;
    transition: .3s all ease;

    .sidebarInner {
      -webkit-user-select: none; /* Safari */
      -moz-user-select: none; /* Firefox */
      -ms-user-select: none; /* IE10+/Edge */
      user-select: none; /* Standard */

      .buttons {
        width: 100%;
        display: block;
        transition: .3s all ease;

        a {
          float: left;
          padding: 2%;
          width: 50%;
          background: $dark-blue;
          color: white;
          text-transform: uppercase;
          font-size: 18px;
          text-align: center;
          margin: 0;
          opacity: .5;
          cursor: pointer;
          transition: .3s all ease;

          &.active,
          &:hover {
            opacity: 1;
          }
        }
      }
      
      .suggestions {
        margin: 0 0 2em 0;

        .error {
          padding: 0 1em;
          text-align: center;
        }

        .suggestion {
          border-top: 1px solid #dedede;
          border-bottom: 1px solid #dedede;
          padding: .5em;
          clear: both;
          transition: .3s all ease;
          cursor: pointer;

          &.active,
          &:hover {
            background: $light-green;
            padding: 0 0 1em 0;
          }

          .headerImage {
            background-size: cover;
            background-position: 50% 50%;
            height: 400px;
          }

          .info {
            padding: 1em 1em 0 1em;

            .suggestionAddress {
              color: $dark-blue;
            }

            p {
              color: $green;
            }
          }
        }
      }
    }
  } // end sidebar

  // common style
  .clear {
    clear: both;
  }
}
</style>
