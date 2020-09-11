<template lang="pug">
q-layout(view='lHh Lpr lFf')
  q-header(elevated='')
    q-toolbar
      q-btn(flat='', dense='', round='', icon='menu', aria-label='Menu', @click='leftDrawerOpen = !leftDrawerOpen')
      q-toolbar-title CH Setup
      .q-gutter-sm.row.items-center.no-wrap
        q-btn(round to="/builder" dense flat label="Builder")
          q-tooltip Builder
  q-drawer(v-model='leftDrawerOpen', show-if-above='', bordered='', content-class='bg-grey-1')
    q-list
      q-item-label.text-grey-8(header='') 
      EssentialLink(v-for='link in essentialLinks', :key='link.title', v-bind='link')
  q-page-container
    router-view
</template>

<script>
import EssentialLink from 'components/EssentialLink.vue'

export default {
  name: 'MainLayout',

  components: {
    EssentialLink
  },

  data() {
    return {
      leftDrawerOpen: false,
      essentialLinks: [
        {
          title: 'Инструкция',
          caption: 'quasar.dev',
          icon: 'school',
          link: 'https://quasar.dev'
        },
        {
          title: 'Статус',
          caption: 'github.com/quasarframework',
          icon: 'code',
          link: 'https://github.com/quasarframework'
        },
        {
          title: 'DIO',
          caption: 'github.com/quasarframework',
          icon: 'code',
          link: 'https://github.com/quasarframework'
        }
      ]
    }
  }
}
</script>
