<template>
  <div>
    <p>This is MyComponent</p>
    <p>{{ msg }}</p>
  </div>
</template>

<script>
export default {
  name: 'MyComponent',
  data() {
    return {
      msg: 'Hello!',
    };
  },
};
</script> 
