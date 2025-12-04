<template>
  <div class="d-flex align-items-center">
    <!-- Visualizar -->
    <b-button v-if="type != 'client'" variant="outline-info" size="sm" class="ml-2"
      v-b-tooltip.hover.bottom="'Visualizar detalhes'" @click="$emit('view', item)">
      <b-icon icon="eye"></b-icon>
    </b-button>

    <!-- Editar -->
    <b-button variant="outline-primary" size="sm" class="ml-2" v-b-tooltip.hover.bottom="'Editar registro'"
      @click="$emit('edit', item)">
      <b-icon icon="pencil"></b-icon>
    </b-button>

    <!-- Excluir -->
    <b-button variant="outline-danger" size="sm" class="ml-2" v-b-tooltip.hover.bottom="'Excluir registro'"
      @click="$emit('delete', item)">
      <b-icon icon="trash"></b-icon>
    </b-button>

    <!-- Download -->
    <b-button v-if="type != 'client' && item.status === 'done'" variant="outline-success" size="sm" class="ml-2"
      v-b-tooltip.hover.bottom="'Ta pronto!'" @click="$emit('sendServiceDone', item)">
      <b-icon icon="phone"></b-icon>
    </b-button>

    <!-- Veículos do Cliente -->
    <b-button v-if="type === 'client'" variant="outline-warning" size="sm" class="ml-2"
      v-b-tooltip.hover.bottom="'Ver veículos do cliente'" @click="$emit('openVehicles', item)">
      <b-icon icon="truck"></b-icon>
    </b-button>

    <!-- Recuperar Senha -->
    <b-button v-if="type === 'client'" variant="outline-info" size="sm" class="ml-2"
      v-b-tooltip.hover.bottom="'Enviar link de recuperação de senha'" @click="$emit('recoverPassword', item)">
      <b-icon icon="envelope"></b-icon>
    </b-button>

    <!-- Ver OS -->
    <b-button v-if="type === 'client'" variant="outline-primary" size="sm" class="ml-2"
      v-b-tooltip.hover.bottom="'Ver OS'" @click="$router.push({
        path: '/admin/ordersClient',
        query: { uid: item.uid, admin:true }
      })">
      <b-icon icon="clipboard-data"></b-icon>
    </b-button>

    <!-- Enviar Mensagem -->
    <b-button v-if="type === 'client'" variant="outline-success" size="sm" class="ml-2"
      v-b-tooltip.hover.bottom="'Enviar mensagem / WhatsApp'" @click="$emit('sendMessage', item)">
      <b-icon icon="phone"></b-icon>
    </b-button>
  </div>
</template>


<script>
export default {
  name: 'actions',
  props: {
    item: {
      type: Object,
      required: true,
    },
    type: {
      type: String,
      required: false,
    },
  },
};
</script>

<style scoped>
.ml-2 {
  margin-left: 0.5rem;
}
</style>
