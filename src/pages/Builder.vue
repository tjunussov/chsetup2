<template lang="pug">
  q-page.q-px-md
    q-btn-dropdown.q-mx-sm(split='', color='orange', label='Build' @click="exportToFile")
      q-list
        q-item
          q-item-section(avatar='')
            q-avatar(icon='folder', color='primary', text-color='white')
          q-item-section
            q-item-label 1 Room - 1 Living
            q-item-label(caption='') Business
          q-item-section(side='')
            q-icon(name='info', color='amber')
    q-btn(label="Check Config" color="green")
    q-btn(label="Restart" color="red")

    q-btn(label="Check BaseUrl" @click="checkBaseUrl")
    q-btn(label="Test" @click="test")
    
    p [{{baseUrl}}]

    //- h5 ChSetup.yaml
    //- pre {{setupYaml}}
    h5 Package.yaml
    Packager(@extract="test" ref="tost" :setup="setup")
</template>

<script>
import chsetupYamlFileText from './../chsetup.yaml'
import cyrillicToTranslit from 'cyrillic-to-translit-js'
import Packager from 'components/Packager'

import yaml from 'js-yaml'
import qs from 'querystring'
import { Notify } from 'quasar'

export default {
  name: 'Builder',
  components: {
    Packager
  },
  data() {
    return {
      setup: null,
      setupYaml:null,
      packageYaml:null,
      baseUrl:null,
      salt: null
    }
  },
  mounted() {
    this.loadFile()
  },
  methods: {
    loadFile() {
      this.setupYaml = chsetupYamlFileText;
      this.setup = yaml.load(this.setupYaml)
      console.log(this.setup)
    },
    checkBaseUrl(){
      this.$axios.get('file',{params:{filename:'/configs/base_url.yaml'}}).then((resp)=>{
        if(resp.data == "File not found"){
          console.log("File not found, creating");
          this.saveFile(this.baseUrl.url);
        } else {
          console.log("Checking",resp.data,this.baseUrl.id);
        }
      })
    },
    saveFile(data){
      return this.$axios.post('save', qs.stringify(data), {headers: { 'Content-Type': 'application/x-www-form-urlencoded' }})
    },
    test(packageYaml){
      this.packageYaml = packageYaml
      console.log(this.packageYaml)
    },
    exportToFile() {
      // var setup = this.$refs.yaml.innerText
      var setup = this.packageYaml
      // console.log(this.$refs.pre)
      setup = yaml.load(setup)
      this.baseUrl = setup.base_url;
      setup = yaml.dump(setup.chsetup)      

      var data = { filename: '/configs/package.yaml', text: setup }

      console.log('data',data);

      return;

      this.saveFile(data).then(resp => {
          if (resp.data.error) throw new Error(resp)

          console.log('Good', resp)
          Notify.create({
            color: 'green',
            textColor: 'white',
            icon: 'info',
            message: `${resp.data.file} ${resp.data.message}`
          })
        })
        .catch(error => {
          Notify.create({
            color: 'red',
            textColor: 'white',
            icon: 'error',
            message:
              error.response.config.url + ' ' + error.response.data.message
          })
        })
    }
  }
}
</script>