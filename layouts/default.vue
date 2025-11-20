<template>
  <div class="app-layout d-flex flex-column h-100">
    <div class="flex-grow-1 d-flex">
      <!-- Sidebar -->
      <b-sidebar id="sidebar" shadow bg-variant="light" text-variant="dark" :visible.sync="sidebarVisible"
        :backdrop="isMobile" class="sidebar border-right">
        <div class="p-3 d-flex flex-column h-100">
          <!-- Logo / Nome -->
          <div class="mb-4 text-center sidebar-logo-box">
            <img :src="logoImg" alt="Logo" class="sidebar-logo mb-2" />
            <h5 class="font-weight-bold mb-0 text-primary">{{ appName }}</h5>
          </div>

          <!-- Menu -->
          <b-nav vertical class="flex-grow-1">
            <b-nav-item v-for="item in menu" :key="item.to" :to="item.to" exact class="menu-item"
              :class="{ active: $route.path.startsWith(item.to) }">
              <b-icon :icon="item.icon" class="mr-2"></b-icon>
              {{ item.label }}
            </b-nav-item>
          </b-nav>

          <!-- Footer com usuário -->
          <div class="border-top pt-3 text-center small">
            <div v-if="$store.state.user.profile">
              <b-icon icon="person-circle" class="mr-1 text-secondary" />
              {{ $store.state.user.profile.name }}
            </div>
            <b-button variant="outline-danger" size="sm" class="mt-2" @click="logout">
              <b-icon icon="box-arrow-right" class="mr-1" /> Sair
            </b-button>
          </div>
        </div>
      </b-sidebar>

      <!-- Main content -->
      <div class="main flex-fill d-flex flex-column">
        <!-- Navbar superior -->
        <b-navbar type="light" variant="light" class="border-bottom shadow-sm">
          <b-container fluid class="d-flex justify-content-between align-items-center">
            <b-button size="sm" variant="outline-secondary" @click="toggleSidebar" class="mr-2">
              <b-icon icon="list"></b-icon>
            </b-button>

            <b-navbar-brand class="font-weight-bold text-primary mb-0">
              {{ currentPageTitle }}
            </b-navbar-brand>

            <div class="d-flex align-items-center">
              <span v-if="$store.state.user.profile" class="mr-2 text-muted small">
                {{ $store.state.user.profile.name }}
              </span>
              <b-button size="sm" variant="link" v-if="$store.state.user.currentUser" @click="logout">
                Logout
              </b-button>
            </div>
          </b-container>
        </b-navbar>

        <!-- Conteúdo dinâmico -->
        <div class="content flex-fill p-3">
          <Nuxt />
        </div>
      </div>
    </div>

    <!-- Footer global sticky -->
    <footer class="footer bg-light border-top text-center py-2">
      <small>
        © {{ new Date().getFullYear() }} {{ appName }} - Todos os direitos
        reservados
      </small>
    </footer>
  </div>
</template>

<script>
import logo from '@/assets/images/logo.jpg'

export default {
  data() {
    return {
      logoImg: logo,
      appName: this.$config.APP_NAME || 'Grilo Auto-Service',
      sidebarVisible: false,
      isMobile: false,
      menu: [], // vai ser populado dinamicamente no mounted
    };
  },
  computed: {
    currentPageTitle() {
      const found = this.menu.find((m) => this.$route.path.startsWith(m.to));
      return found ? found.label : this.appName;
    },
    userRole() {
      return this.$store.state.user.profile?.role || 'user';
    },
  },
  mounted() {
    this.checkMobile();
    window.addEventListener('resize', this.checkMobile);
    this.setMenuByRole();
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.checkMobile);
  },
  methods: {
    logout() {
      this.$store.dispatch('user/logout');
      this.$router.push('/');
    },
    checkMobile() {
      this.isMobile = window.innerWidth < 992;
    },
    toggleSidebar() {
      this.sidebarVisible = !this.sidebarVisible;
    },
    setMenuByRole() {
      // Menu base comum
      const baseMenu = [
        {
          label: 'Minhas OS',
          to: '/dashboard/orders/orders',
          icon: 'clipboard-data',
        },
        { label: 'Veículos', to: '/dashboard/vehicle', icon: 'truck' },
        // { label: 'Perfil', to: '/dashboard/profile', icon: 'person' }
      ];

      // Menu admin adicional
      const adminMenu = [
        { label: 'Dashboard', to: '/dashboard', icon: 'speedometer2' },
        { label: 'Clientes', to: '/admin/clients', icon: 'people' },
        { label: 'Gerir OS', to: '/admin/orders', icon: 'card-checklist' },
        // { label: 'Configurações', to: '/dashboard/settings', icon: 'gear' },
      ];

      this.menu =
        this.userRole === 'admin' ? [ ...adminMenu, ...baseMenu] : baseMenu;
    },
  },
};
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main {
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #e4e4e4;
}

.sidebar {
  width: 250px;
}

/* Menu */
.menu-item a,
.menu-item.router-link-active,
.menu-item.router-link-exact-active {
  color: inherit !important;
  text-decoration: none !important;
}

.menu-item {
  padding: 10px 15px;
  border-radius: 8px;
  color: #495057 !important;
  font-weight: 500;
  display: flex;
  align-items: center;
  transition: background 0.2s, color 0.2s;
}

.menu-item:hover {
  background-color: #e9ecef;
  color: #10479a !important;
}

.menu-item.active {
  background-color: #112e58 !important;
  color: #fff !important;
}

.menu-item.active b-icon {
  color: #fff !important;
}

.menu-item b-icon {
  color: #10479a !important;
  transition: color 0.2s;
}

.menu-item:hover b-icon {
  color: #10479a !important;

}

/* Footer */
.footer {
  flex-shrink: 0;
}

/* Responsivo */
@media (max-width: 991px) {
  .sidebar {
    width: 220px;
  }
}

.sidebar-logo-box {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.sidebar-logo {
  width: 110px;
  max-width: 80%;
  object-fit: contain;
  border-radius: 12px;

}
</style>
