<script setup>
defineEmits(['click']);
const layouts = [];

for (let rows = 1; rows <= 3; ++rows) {
    for (let columns = 1; columns <= 3; ++columns) {
        layouts.push([rows, columns]);
    }
}
</script>

<template>
    <div class="dropdown">
        <button class="btn dropdown-toggle" data-bs-toggle="dropdown">
            <img src="../assets/layout.png" />
        </button>
        <ul class="dropdown-menu">
            <li class="dropdown-item" v-for="layout in layouts" @click="$emit('click', layout)">
                {{ layout[0] }}x{{ layout[1] }}
            </li>
        </ul>
    </div>
</template>
