<template>
  <div class="d-flex align-items-center">
    <!-- Botões de ação -->
    <b-button
      v-if="type != 'client'"
      variant="outline-info"
      size="sm"
      class="ml-2"
      @click="$emit('view', item)"
    >
      <b-icon icon="eye"></b-icon>
    </b-button>
    <b-button
      variant="outline-primary"
      size="sm"
      class="ml-2"
      @click="$emit('edit', item)"
    >
      <b-icon icon="pencil"></b-icon>
    </b-button>

    <b-button
      variant="outline-danger"
      size="sm"
      class="ml-2"
      @click="$emit('delete', item)"
    >
      <b-icon icon="trash"></b-icon>
    </b-button>

    <b-button
      v-if="type != 'client'"
      variant="outline-success"
      size="sm"
      class="ml-2"
      @click="$emit('download', item)"
    >
      <b-icon icon="download"></b-icon>
    </b-button>

     <b-button
      v-if="type === 'client'"
      variant="outline-info"
      size="sm"
      class="ml-2"
      @click="$emit('recoverPassword', item)"
    >
     <b-icon icon="envelope"></b-icon>
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
