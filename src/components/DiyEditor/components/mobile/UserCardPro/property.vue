<template>
  <ComponentContainerProperty v-model="formData.style">
    <el-form label-width="80px" :model="formData">
      <el-card header="内容设置" class="property-group" shadow="never">
        <el-form-item label="用户名" prop="nickname">
          <el-input v-model="formData.nickname" />
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="formData.mobile" />
        </el-form-item>
        <el-form-item label="等级名称" prop="levelName">
          <el-input v-model="formData.levelName" />
        </el-form-item>
        <Draggable v-model="formData.stats">
          <template #default="{ element }">
            <el-form-item label="名称" prop="label" class="m-b-8px!">
              <el-input v-model="element.label" />
            </el-form-item>
            <el-form-item label="数值" prop="value" class="m-b-8px!">
              <el-input v-model="element.value" />
            </el-form-item>
          </template>
        </Draggable>
      </el-card>
    </el-form>
  </ComponentContainerProperty>
</template>

<script setup lang="ts">
import { UserCardProProperty } from './config'
import { useVModel } from '@vueuse/core'

// 用户卡片Pro属性面板
defineOptions({ name: 'UserCardProProperty' })

const props = defineProps<{ modelValue: UserCardProProperty }>()
const emit = defineEmits(['update:modelValue'])
const formData = useVModel(props, 'modelValue', emit)
</script>

<style scoped lang="scss"></style>
