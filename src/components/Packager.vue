<template>
<pre v-if="setup" ref="pre" @click="xextract">
chsetup:
  group:<template v-if = "room != 'global'" v-for = "(room_config, room, i) in setup.rooms">
    {{ room | english }}:
      name: "{{ room }}"
      icon: mdi:dashboard
      entities: <template v-for = "device in room_config"><template v-for = "(device_pin, device_type) in device">
        - {{ device_type | device }}.{{ room }}{{ device_type | subname }}</template></template></template>
    security_sensors:
      name: 'Security Sensors'
      entities:<template v-for = "(room_config, room, i) in setup.rooms"><template v-for = "device in room_config"><template v-for = "(device_pin, device_type) in device" v-if = "isSecuritySensor(device_type)">
        - {{ device_type | security_sensors }}.{{ room | english }}{{ device_type | subname }}</template></template></template><template v-if = "setup.class == 'business'">
    turn_off_lights:
      name: "Turn off all"
      entities:<template v-for = "(room_config, room, i) in setup.rooms"><template v-for = "device in room_config"><template v-for = "(device_pin, device_type) in device" v-if = "isLight(device_type)">
        - {{ device_type | turn_off_lights }}.{{ room | english }}{{ device_type | subname }}</template></template></template></template>
    scenarios:
      name: "Scenarios"
      entities:<template v-if = "setup.class == 'business'">
        - input_boolean.home_alone</template><template v-if = "setup.class == 'business'">
        - input_boolean.hallway_pir_mode</template>
        - input_boolean.turn_off_all<template v-if = "setup.class == 'business'">
        - input_boolean.hallway_reed_mode</template><template v-if = "setup.class == 'business'">
        - input_boolean.sos</template>
    all_modules:
      name: "All Modules"
      entities:<template v-for = "(room_config, room, i) in setup.rooms"><template v-for = "device in room_config"><template v-for = "(device_pin, device_type) in device" v-if = "isAllModules(device_type)">
      - {{ device_type | turn_off_lights | security_sensors }}.{{ room | english }}{{ device_type | subname }}</template></template></template>
  binary_sensor:<template v-for = "(room_config, room, i) in setup.rooms"><template v-for = "device in room_config"><template v-for = "(device_pin, device_type) in device" v-if = "isBinarySensor(device_type)">
    - platform: mqtt
      name: {{ room | english }}{{ device_type | subname }}
      state_topic: mb/1/02/{{device_pin - 1}}<template v-if = "isInverted(device_type)">
      payload_on: 'OFF'
      payload_off: 'ON'</template>
      device_class: {{ device_type | device_class }}</template></template></template><template v-if = "setup.class == 'business'">
  light:<template v-for = "(room_config, room, i) in setup.rooms"><template v-for = "device in room_config"><template v-for = "(device_pin, device_type) in device" v-if = "setup.class == 'business'">
    - platform: mqtt
      name: {{ room | english }}{{ device_type | subname }}
      command_topic: mb/1/15/{{device_pin - 1}}
      state_topic: mb/1/02/{{device_pin - 1 + 16}}</template></template></template></template>
  switch:<template v-for = "(room_config, room, i) in setup.rooms"><template v-for = "device in room_config"><template v-for = "(device_pin, device_type) in device" v-if = "isSwitch(device_type)">
    - platform: mqtt
      name: {{ room | english }}{{ device_type | subname }}
      command_topic: mb/1/15/{{device_pin - 1}}
      state_topic: mb/1/02/{{device_pin - 1 + 16}} </template></template></template>
<!-- <template v-if = "setup.class == 'business'">
  input_boolean: !include type/business/input_booleans.yaml
  input_number: !include type/business/input_numbers.yaml
  timer: !include type/business/timers.yaml
  automation old: !include type/business/automations_old.yaml
  automation: !include type/business/automations.yaml
  script: !include type/business/scripts/1_room.yaml</template>
<template v-if = "setup.class == 'optimus'">
  input_boolean: !include type/optimus/input_booleans.yaml
  automation old: !include type/optimus/automations_old.yaml
  automation: !include type/optimus/automations.yaml
  script: !include type/optimus/scripts.yaml</template> -->
base_url:
  url: https://{{ setup.name.flat }}-{{salt}}.{{ setup.name.zhk.toLowerCase() | zhk_name }}.home.bi.group
  id: {{ setup.name.flat }}.{{ setup.name.zhk.toLowerCase() | zhk_name }} 
</pre>
</template>

<script>
import cyrillicToTranslit from 'cyrillic-to-translit-js'
import PackagerGroup from 'components/PackagerGroup'

export default {
  name: 'Packager',
  components: { PackagerGroup },
  props: ['setup'],
  data() {
    return {
      salt: null
    }
  },
  filters: {
    english(value) {
      return cyrillicToTranslit()
        .transform(value)
        .toLowerCase()
    },
    device(value) {
      var start = value.indexOf('_')
      if (helper.isBinarySensor(value)) value = 'binary_sensor'
      else if (helper.isLight(value)) value = 'light'
      else if (value == 'curtain' || value == 'valve') value = 'cover'
      return value
    },
    subname(value) {
      var start = value.indexOf('_')
      if (start >= 0) {
        if (value.substring(0, start) == 'light') return value.substring(start)
        return '_' + value
      }
      if (value == 'light') return ''
      return '_' + value
    },
    security_sensors(value) {
      value = helper.cutTheRest(value)
      if (helper.isBinarySensor(value)) value = 'binary_sensor'
      return value
    },
    turn_off_lights(value) {
      value = helper.cutTheRest(value)
      if (helper.isLight(value)) value = 'light'
      return value
    },
    device_class(value) {
      value = helper.cutTheRest(value)
      const map = {
        leak: 'moisture',
        pir: 'motion',
        reed: 'door',
        smoke: 'smoke',
        sos: 'problem'
      }
      return map[value] ? map[value] : 'window'
    },
    zhk_name(value) {
      var chunk = value.split(' ')
      if (chunk.length == 1) {
        if (chunk[0].length > 8) chunk[0] = chunk[0].substring(0, 8)
        return chunk[0]
      } else if (chunk.length == 2) {
        if (chunk[0].length + chunk[1].length > 8)
          chunk[0] = chunk[0].substring(0, 8 - chunk[1].length)
        return chunk[0] + chunk[1]
      } else if (chunk.length == 3) {
        if (chunk[0].length + chunk[1].length + chunk[2].length > 8)
          chunk[0] = chunk[0].substring(
            0,
            (8 - chunk[2].length) % 2 == 0
              ? (8 - chunk[2].length) / 2
              : (8 - chunk[2].length + 1) / 2
          )
        chunk[1] = chunk[1].substring(
          0,
          (8 - chunk[2].length) % 2 == 0
            ? (8 - chunk[2].length) / 2
            : (8 - chunk[2].length - 1) / 2
        )
        return chunk[0] + chunk[1] + chunk[2]
      }
    }
  },
  created() {
    this.createSalt()
  },
  methods: {
    createSalt() {
      let text = ''
      let chars = 'abcdefghijklmnopqrstuvwxyz'

      for (let i = 0; i < 3; i++) {
        text += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      this.salt = text
    },
    xextract(){
      console.log('Extract',this.$refs.pre.innerText);
      this.$emit('extract',this.$refs.pre.innerText);
    },
    isBinarySensor(value) {
      return helper.isBinarySensor(value)
    },
    isLight(value) {
      return helper.isLight(value)
    },
    isInverted(value) {
      return helper.isInverted(value)
    },
    isSwitch(value) {
      return helper.isSwitch(value)
    },
    isAllModules(value) {
      return helper.isAllModules(value)
    },
    isSecuritySensor(value) {
      return helper.isSecuritySensor(value)
    }
  }
}

const helper = {
  isBinarySensor(value) {
    value = this.cutTheRest(value)
    return (
      value == 'leak' ||
      value == 'pir' ||
      value == 'smoke' ||
      value == 'reed' ||
      value == 'sos'
    )
  },
  isLight(value) {
    value = this.cutTheRest(value)
    return value == 'light' || value == 'vent'
  },
  isInverted(value) {
    value = this.cutTheRest(value)
    return value == 'smoke' || value == 'pir' || value == 'reed'
  },
  isSwitch(value) {
    value = this.cutTheRest(value)
    return value == 'contactor' || value == 'switch'
  },
  isSecuritySensor(value) {
    value = this.cutTheRest(value)
    return (
      value == 'leak' || value == 'pir' || value == 'smoke' || value == 'reed'
    )
  },
  isAllModules(value) {
    return value != 'sos' && value != 'contactor'
  },
  cutTheRest(value) {
    var start = value.indexOf('_')
    if (start >= 0) value = value.substring(0, start)
    return value
  }
}
</script>