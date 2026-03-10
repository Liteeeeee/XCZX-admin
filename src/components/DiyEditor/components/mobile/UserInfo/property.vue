<template>
  <ComponentContainerProperty v-model="formData.style">
    <el-form label-width="80px" :model="formData">
      <el-card header="内容设置" class="property-group" shadow="never">
        <el-form-item label="标题" prop="title">
          <el-input v-model="formData.title" />
        </el-form-item>
        <Draggable v-model="formData.items">
          <template #default="{ element }">
            <el-form-item label="名称" prop="name" class="m-b-8px!">
              <el-input v-model="element.name" />
            </el-form-item>
            <el-form-item label="图标" prop="icon" class="m-b-8px!">
              <IconSelect v-model="element.icon" />
            </el-form-item>
            <el-form-item label="链接" prop="url" class="m-b-8px!">
              <AppLinkInput v-model="element.url" />
            </el-form-item>
          </template>
        </Draggable>
      </el-card>
    </el-form>
  </ComponentContainerProperty>
</template>

<script setup lang="ts">
import { UserInfoProperty } from './config'
import { useVModel } from '@vueuse/core'

// 用户信息属性面板
defineOptions({ name: 'UserInfoProperty' })

const props = defineProps<{ modelValue: UserInfoProperty }>()
const emit = defineEmits(['update:modelValue'])
const formData = useVModel(props, 'modelValue', emit)
</script>

<style scoped lang="scss"></style>
