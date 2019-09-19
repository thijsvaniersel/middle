<template>
    <section class="addresses" v-show="show === 'addresses'">
        <div class="address">
            <h2>Your location</h2>
            <p>Where are you right now?</p>
            <GmapAutocomplete @place_changed="setAddressOne" :class="Object.keys(markers.addressOne).length !== 0 ? 'filled' : 'empty'"/>
        </div>

        <div class="address">
            <h2>Your friend's location</h2>
            <p>We need another location to find the middle</p>
            <GmapAutocomplete @place_changed="setAddressTwo" :class="Object.keys(markers.addressTwo).length !== 0 ? 'filled' : 'empty'"/>
        </div>
    </section>
</template>

<script>
export default {
    name: 'addresses',

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
        show: function() {
            return this.$store.state.user.show
        }
    },

    methods: {
        setAddressOne(address) {

        // set address one in store
        let payloadAddress = {
            address: address,
            type: 'addressOne'
        }
        this.$store.dispatch('map/changeAddress', payloadAddress)

        },

        setAddressTwo(address) {

        // set address two in store
        let payloadAddress = {
            address: address,
            type: 'addressTwo'
        }
        this.$store.dispatch('map/changeAddress', payloadAddress)

        },
    }
}
</script>

<style scoped lang="scss">
.addresses {
    padding: 0 1em;

    .address {
        margin: 2em 0;
        border-bottom: 1px solid #dedede;
        padding-bottom: 2em;

        h2 {
            font-size: 16px;
            line-height: 23px;
        }

        p {
        line-height: 6px;
        color: $gray;
        }

        input {
        width: 100%;
        border: none;
        padding: 1em;
        background: $light-gray;
        color: $dark-blue;
        font-size: 18px;
        border: 1px solid $light-gray;
        transition: .3s all ease;

        &:focus {
            outline: none;
            background: none;
            border: 1px solid $light-gray;
        }

        &.filled {
            background: $light-green;
            color: $green;
        }
        }
    }
    } // end addresses
</style>