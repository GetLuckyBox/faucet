<script setup lang="ts">
import Tabs from './components/Tabs.vue'
import {reactive, ref} from "vue";



window.electronAPI.sendMessage('Hello from App.vue!');

</script>

<template>
<!--  <div>-->
<!--    <a href="https://vitejs.dev" target="_blank">-->
<!--      <img src="/vite.svg" class="logo" alt="Vite logo" />-->
<!--    </a>-->
<!--    <a href="https://vuejs.org/" target="_blank">-->
<!--      <img src="/vue.svg" class="logo vue" alt="Vue logo" />-->
<!--    </a>-->
<!--  </div>-->
<!--  <HelloWorld msg="Vite + Vue" />-->
  <Tabs />

</template>

<style scoped>
</style>
