<template>
  <b-container class="mt-4">
    <b-card>
      <h4>Cadastro</h4>
      <b-form @submit.prevent="onRegister">
        <b-form-row>
          <b-col md="6">
            <b-form-group label="Nome">
              <b-form-input v-model="profile.name" required></b-form-input>
            </b-form-group>
          </b-col>
          <b-col md="6">
            <b-form-group label="Email">
              <b-form-input v-model="email" type="email" required></b-form-input>
            </b-form-group>
          </b-col>
        </b-form-row>
        <b-form-row>
          <b-col md="6">
            <b-form-group label="Senha">
              <b-form-input v-model="password" type="password" required></b-form-input>
            </b-form-group>
          </b-col>
          <b-col md="6">
            <b-form-group label="Role">
              <b-form-select v-model="profile.role" :options="[{value:'user', text:'Usuário'},{value:'admin', text:'Mecânico (admin)'}]"></b-form-select>
            </b-form-group>
          </b-col>
        </b-form-row>
        <b-button type="submit" variant="success">Criar conta</b-button>
      </b-form>
    </b-card>
  </b-container>
</template>

<script>
export default {
  data() { return { email:'', password:'', profile: { name:'', role:'user' } } },
  methods: {
    async onRegister() {
      try {
        await this.$store.dispatch('user/register', { email: this.email, password: this.password, profile: this.profile })
        this.$router.push('/dashboard')
      } catch (e) {
        alert(e.message)
      }
    }
  }
}
</script>
