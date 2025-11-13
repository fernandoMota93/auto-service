<template>
  <div class="container py-5">
    <b-card style="max-width: 420px; margin: 0 auto;">
      <h4 class="mb-3 text-center">Recuperar senha</h4>

      <b-alert v-if="message" variant="success" dismissible>
        {{ message }}
      </b-alert>

      <b-alert v-if="error" variant="danger" dismissible>
        {{ error }}
      </b-alert>

      <b-form @submit.prevent="sendRecoverEmail">

        <b-form-group label="E-mail" label-for="email">
          <b-form-input
            id="email"
            v-model="email"
            type="email"
            required
            placeholder="Digite seu e-mail"
          />
        </b-form-group>

        <b-button
          type="submit"
          variant="primary"
          block
          :disabled="loading || !email"
        >
          {{ loading ? 'Enviando...' : 'Enviar link de recuperação' }}
        </b-button>

        <div class="mt-3 text-center">
          <nuxt-link to="/login">Voltar ao login</nuxt-link>
        </div>
      </b-form>
    </b-card>
  </div>
</template>

<script>
import authService from "@/services/authService";

export default {
  layout: "empty",

  data() {
    return {
      email: "",
      loading: false,
      message: null,
      error: null,
    };
  },

  methods: {
    async sendRecoverEmail() {
      this.message = null;
      this.error = null;
      this.loading = true;

      try {
        await authService.recoverPassword(this.email);

        this.message =
          "Se este e-mail estiver cadastrado, você receberá um link para redefinir sua senha.";
      } catch (err) {
        const map = {
          "auth/user-not-found": "E-mail não encontrado.",
          "auth/invalid-email": "E-mail inválido.",
        };
        this.error = map[err.code] || "Erro ao enviar e-mail de recuperação.";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
