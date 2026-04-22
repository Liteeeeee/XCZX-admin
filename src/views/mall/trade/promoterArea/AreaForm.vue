<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="负责地区" prop="areaIds">
        <el-cascader
          v-model="formData.areaIds"
          :options="areaTree"
          :props="defaultProps"
          clearable
          placeholder="请选择地区"
          class="w-full"
        />
      </el-form-item>

      <el-form-item label="主管人员" prop="promoterId">
        <el-select
          v-model="formData.promoterId"
          placeholder="请选择主管人员"
          clearable
          filterable
          class="w-full"
        >
          <el-option
            v-for="item in promoterList"
            :key="item.id"
            :label="item.name + ' (' + item.mobile + ')'"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <!-- 下面为预留字段（若接口不支持将被忽略） -->
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="成员数量" prop="memberCount">
        <el-input-number v-model="formData.memberCount" :min="0" class="w-full" />
      </el-form-item>

      <el-form-item label="地区描述" prop="description">
        <el-input v-model="formData.description" type="textarea" placeholder="请输入地区描述" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import * as PromoterApi from '@/api/mall/trade/promoter'
import * as AreaApi from '@/api/system/area'

const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('新增地图管理人员') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中
const formType = ref('') // 表单的类型：create - 新增；update - 修改

const areaTree = ref<any[]>([]) // 地区树
const promoterList = ref<any[]>([]) // 推广员列表

const defaultProps = {
  checkStrictly: true,
  value: 'id',
  label: 'name',
  children: 'children'
}

const formData = reactive({
  id: undefined,
  areaIds: [] as number[],
  promoterId: undefined as number | undefined,
  status: 0,
  memberCount: 0,
  description: ''
})

const formRules = reactive({
  areaIds: [{ required: true, message: '地区不能为空', trigger: 'change' }],
  promoterId: [{ required: true, message: '主管人员不能为空', trigger: 'change' }]
})

const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (type: string, row?: any) => {
  dialogVisible.value = true
  dialogTitle.value = type === 'create' ? '新增地图管理人员' : '编辑地图管理人员'
  formType.value = type
  resetForm()

  if (promoterList.value.length === 0) {
    const res = await PromoterApi.getPromoterPage({ pageNo: 1, pageSize: 200 })
    promoterList.value = res.list || []
  }

  if (areaTree.value.length === 0) {
    areaTree.value = await AreaApi.getAreaTree()
  }

  // 修改时，设置数据
  if (row) {
    formData.id = row.id
    formData.promoterId = row.promoterId
    formData.status = row.status ?? 0
    formData.memberCount = row.memberCount ?? 0
    formData.description = row.description || ''

    // 设置地区回显
    if (row.parentId === 0) {
      formData.areaIds = [row.areaId]
    } else {
      // 简化的回显：假设只有两级或三级
      // 真实的级联选择需要完整的路径数组
      const paths = findAreaPaths(areaTree.value, row.areaId)
      if (paths) {
        formData.areaIds = paths
      } else {
        formData.areaIds = row.parentId ? [row.parentId, row.areaId] : [row.areaId]
      }
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

// 查找区域的完整路径
const findAreaPaths = (
  tree: any[],
  targetId: number,
  currentPath: number[] = []
): number[] | null => {
  for (const node of tree) {
    const path = [...currentPath, node.id]
    if (node.id === targetId) return path
    if (node.children) {
      const found = findAreaPaths(node.children, targetId, path)
      if (found) return found
    }
  }
  return null
}

// 获取节点信息
const getAreaNode = (tree: any[], targetId: number): any => {
  for (const node of tree) {
    if (node.id === targetId) return node
    if (node.children) {
      const found = getAreaNode(node.children, targetId)
      if (found) return found
    }
  }
  return null
}

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  if (!formRef.value) return
  const valid = await formRef.value.validate()
  if (!valid) return

  // 提交请求
  formLoading.value = true
  try {
    const selectedAreaId = formData.areaIds[formData.areaIds.length - 1]
    const areaNode = getAreaNode(areaTree.value, selectedAreaId)

    let parentId = 0
    let parentName = ''
    if (formData.areaIds.length > 1) {
      parentId = formData.areaIds[formData.areaIds.length - 2]
      const parentNode = getAreaNode(areaTree.value, parentId)
      parentName = parentNode?.name || ''
    }

    const submitData = {
      id: formData.id,
      promoterId: formData.promoterId,
      areaId: selectedAreaId,
      areaName: areaNode?.name || '',
      parentId: parentId,
      parentName: parentName,
      // 扩展字段
      status: formData.status,
      memberCount: formData.memberCount,
      description: formData.description
    }

    // 虽然只有添加接口，但因为业务是“绑定”，如果已有ID且接口不支持更新，通常直接重新添加来覆盖
    await PromoterApi.createPromoterArea(submitData)
    message.success(formType.value === 'create' ? '添加成功' : '修改成功')
    dialogVisible.value = false
    emit('success')
  } catch (error) {
    console.error(error)
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  Object.assign(formData, {
    id: undefined,
    areaIds: [],
    promoterId: undefined,
    status: 0,
    memberCount: 0,
    description: ''
  })
  formRef.value?.resetFields()
}
</script>
