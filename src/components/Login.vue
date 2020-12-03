<template>
 <div>
   <form class="login" @submit.prevent="login">
     <h1>Sign in</h1>
     <label>Name</label>
     <input required v-model="name" type="text" placeholder="Name"/>
     <br>
     <label>Password</label>
     <input required v-model="password" type="password" placeholder="Password"/>
     <hr/>
     <button type="submit">Login</button>
   </form>
 </div>
</template>
<script>
    export default {
        data(){
            return {
                name : "",
                password : ""
            }
        },
        methods: {
            login: function () {
                let name = this.name 
                let password = this.password
                this.$store.dispatch('login', { name, password })
                .then(() => this.$router.push('/'))
                .catch(err => console.log(err))
            }
        }
    }
</script>
