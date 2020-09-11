<template>
<pre><template v-if = "room != 'global'" v-for = "(room_config, room, i) in roomList">
    {{ room | english }}:
      name: "{{ room }}"
      icon: mdi:dashboard
      entities: <template v-for = "device in room_config"><template v-for = "(device_pin, device_type) in device">
        - {{ device_type | device }}.{{ room }}{{ device_type | subname }}</template></template></template>
</pre>
</template>

<script>
import cyrillicToTranslit from 'cyrillic-to-translit-js'

export default {
  name: 'PackagerGroups',
  props: ['roomList'],
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
  mounted() {
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