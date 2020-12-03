<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link>
      <span v-if="is_logged_in"> | <a @click="logout">Logout {{ auth_user }}</a></span>
    </div>
    <router-view/>
  </div>
</template>

<script>
  export default {
    computed : {
      is_logged_in : function(){ return this.$store.getters.is_logged_in },
      auth_user : function(){ return this.$store.getters.auth_user }
    },
    methods: {
      logout: function () {
        this.$store.dispatch('logout')
        .then(() => {
          this.$router.push('/login')
        })
      }
    },
    created: function () {
      this.$http.interceptors.response.use(undefined, function (err) {
        return new Promise(function (/*resolve, reject*/) {
          if (err.status === 401 && err.config && !err.config.__isRetryRequest) {
            this.$store.dispatch('logout')
          }
          throw err;
        });
      });
    }
  }
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
  cursor: pointer;
}

#nav a:hover {
  text-decoration: underline;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

</style>
