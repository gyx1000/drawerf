<template>
  <div id="app">
    <Workspace></Workspace>
  </div>
</template>

<script>
  import Workspace from './components/Workspace.vue';

  export default {
    components: {
      Workspace
    }
  }

</script>

<style>
html, body {
  margin: 0px;
  padding: 0px;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100vh;
  background-color:#212121;
}
</style>
