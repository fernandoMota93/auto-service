<template>
  <div class="d-flex align-items-center">

    <!-- Botões de ação -->
       <b-button
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
      variant="outline-success"
      size="sm"
      class="ml-2"
      @click="$emit('download', item)"
    >
      <b-icon icon="download"></b-icon>
    </b-button>
  </div>
</template>

<script>
export default {
  name: 'actions',
  props: {
    item: {
      type: Object,
      required: true
    }
  }
}
</script>

<style scoped>
.ml-2 {
  margin-left: 0.5rem;
}
</style>
