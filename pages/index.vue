<template>
  <div class="login-layout">
    <b-container fluid class="p-0 m-0">
      <b-row no-gutters class="vh-100">
        <!-- Lado esquerdo - Imagem -->
        <b-col
          md="6"
          class="login-image d-none d-md-flex"
          :style="{ backgroundImage: `url(${bgImage})` }"
          aria-label="Imagem de fundo decorativa"
        >
          <div class="overlay"></div>
          <div class="brand-section text-white">
            <img
              :src="logoImage"
              alt="Logo Grilo Mecânica"
              class="brand-logo mb-3"
            />
            <h1 class="brand-title">
              {{ $config.APP_NAME || 'Grilo Mecânica' }}
            </h1>
            <p class="brand-subtitle">Sistema de gestão</p>
          </div>
        </b-col>

        <!-- Lado direito - Formulário -->
        <b-col
          cols="12"
          md="6"
          class="d-flex align-items-center justify-content-center bg-light"
        >
          <div class="login-card text-center w-100" style="max-width: 420px;">
            <!-- Logo apenas no mobile -->
            <div class="d-md-none mb-4">
              <img
                :src="logoImage"
                alt="Logo Grilo Mecânica"
                class="logo-mobile mb-3"
              />
              <h2 class="header-brand mb-2">
                {{ $config.APP_NAME || 'Grilo Mecânica' }}
              </h2>
            </div>

            <h1 class="h3 mb-4 font-weight-normal d-none d-md-block">
              Faça login em sua conta
            </h1>

            <b-alert
              v-if="error"
              variant="danger"
              dismissible
              fade
              class="mb-3"
              :show="!!error"
              @dismissed="error = null"
            >
              {{ error }}
            </b-alert>

            <b-form @submit.prevent="onLogin" @keydown.enter="onLogin">
              <b-form-group
                label="Email:"
                label-for="email"
                label-class="form-label"
              >
                <b-form-input
                  id="email"
                  v-model="email"
                  type="email"
                  required
                  placeholder="Digite seu e-mail"
                  autocomplete="email"
                  :disabled="loading"
                  size="lg"
                />
              </b-form-group>

              <b-form-group
                label="Senha:"
                label-for="password"
                label-class="form-label"
                class="mt-3"
              >
                <b-form-input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  placeholder="Digite sua senha"
                  autocomplete="current-password"
                  :disabled="loading"
                  size="lg"
                />
                <b-form-text class="text-end">
                  <b-button
                    variant="link"
                    class="p-0 text-decoration-none"
                    @click="showPassword = !showPassword"
                  >
                    {{ showPassword ? 'Ocultar' : 'Mostrar' }} senha
                  </b-button>
                </b-form-text>
              </b-form-group>

              <b-button
                type="submit"
                variant="primary"
                size="lg"
                block
                class="mt-4 mb-3 login-button"
                :disabled="loading || !email || !password"
              >
                <b-spinner small v-if="loading" class="mr-2" />
                {{ loading ? 'Entrando...' : 'Entrar' }}
              </b-button>

              <div class="text-center mt-4">
               
                <nuxt-link
                  to="/forgot-password"
                  class="text-decoration-none small"
                >
                  Esqueceu sua senha?
                </nuxt-link>
              </div>
            </b-form>
          </div>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import logo from '@/assets/images/logo.jpg'
import bg from '@/assets/images/login-bg.jpg'

export default {
  layout: 'empty',
  data() {
    return {
      email: '',
      password: '',
      showPassword: false,
      loading: false,
      error: null,
      logoImage: logo,
      bgImage: bg,
    }
  },
  methods: {
    async onLogin() {
      if (this.loading) return

      this.loading = true
      this.error = null

      try {
        await this.$store.dispatch('user/login', {
          email: this.email,
          password: this.password,
        })
        
        const profile = this.$store.state.user.profile
        if (profile && profile.role === 'admin') {
          this.$router.push('/admin/orders')
        } else {
          this.$router.push('/dashboard')
        }
      } catch (error) {
        this.error = error.message || 'Erro ao fazer login. Tente novamente.'
        console.error('Login error:', error)
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
.login-layout {
  background-color: #f8f9fa;
}

.login-image {
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.4) 100%);
}

.brand-section {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 2rem;
}

.brand-logo {
  max-width: 120px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.brand-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.brand-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  font-weight: 300;
}

.login-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  margin: 1rem;
}

.logo-mobile {
  max-width: 80px;
  border-radius: 12px;
}

.header-brand {
  font-weight: 600;
  color: #343a40;
  font-size: 1.5rem;
}

.form-label {
  font-weight: 500;
  color: #495057;
  margin-bottom: 0.5rem;
}

.login-button {
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.login-button:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

/* Melhorias de responsividade */
@media (max-width: 767.98px) {
  .login-card {
    box-shadow: none;
    border-radius: 0;
    padding: 2rem 1.5rem;
    margin: 0;
  }
  
  .brand-title {
    font-size: 2rem;
  }
}

@media (max-width: 575.98px) {
  .login-card {
    padding: 1.5rem 1rem;
  }
  
  .brand-section {
    padding: 1rem;
  }
}

/* Animações suaves */
.login-card {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>