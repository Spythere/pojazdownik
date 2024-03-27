<template>
  <label>
    <input type="checkbox" v-model="model" />
    <div><slot /></div>
  </label>
</template>

<script lang="ts" setup>
const model = defineModel();
</script>

<style lang="scss" scoped>
label {
  cursor: pointer;

  text-transform: uppercase;
  transition: color 200ms;
}

div {
  padding: 0.25em 0.5em;
  color: white;

  background-color: #222;
  border-radius: 0.25em;

  user-select: none;

  &::before {
    content: '\2716';
    margin-right: 0.5em;
    color: #aaa;
  }
}

input {
  position: absolute;
  clip: rect(1px, 1px, 1px, 1px);
  padding: 0;
  border: 0;
  height: 1px;
  width: 1px;
  overflow: hidden;

  &:focus-visible + div {
    outline: 1px solid white;
  }

  &:checked + div {
    color: palegreen;

    &::before {
      color: palegreen;
      content: '\2714';
    }
  }
}
</style>
