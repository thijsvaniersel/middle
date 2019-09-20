<template>
    <div class="buttons">
        <a @click="switchShow('addresses')" :class="show == 'addresses' ? 'active' : ''">Addresses</a>
        <a @click="switchShow('suggestions')" :class="show == 'suggestions' ? 'active' : ''">Meet here</a>
        <div class="clear"></div>
    </div>
</template>

<script>
export default {
    name: 'buttons',

    computed: {
        show: function() {
            return this.$store.state.user.show
        }    
    },

    methods: {
        switchShow: function(type){

            // switch view in the sidebar
            this.$store.dispatch('user/changeShow', type)
        }        
    }
}
</script>

<style>

</style>