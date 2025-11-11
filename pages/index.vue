<template>
  <b-container class="mt-5">
    <b-row class="justify-content-center">
      <b-col cols="12" md="6">
        <b-card>
          <h3 class="text-center header-brand">
            {{ $config.APP_NAME || 'Grilo Mecânica' }}
          </h3>
          <b-form @submit.prevent="onLogin">
            <b-form-group label="Email">
              <b-form-input
                v-model="email"
                type="email"
                required
              ></b-form-input>
            </b-form-group>
            <b-form-group label="Senha">
              <b-form-input
                v-model="password"
                type="password"
                required
              ></b-form-input>
            </b-form-group>
            <b-button type="submit" variant="primary" block>Entrar</b-button>
          </b-form>
          <p class="mt-3">
            Ainda não tem conta?
            <nuxt-link to="/register">Cadastre-se</nuxt-link>
          </p>
        </b-card>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
export default {
  data() {
    return { email: '', password: '' };
  },
  methods: {
    async onLogin() {
      try {
        await this.$store.dispatch('user/login', {
          email: this.email,
          password: this.password,
        });
        const profile = this.$store.state.user.profile;
        if (profile && profile.role === 'admin') this.$router.push('/admin');
        else this.$router.push('/dashboard');
      } catch (e) {
        alert(e.message);
      }
    },
  },
};
</script>
