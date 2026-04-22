<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="姓名" prop="name">
        <el-input v-model="formData.name" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="手机号" prop="mobile">
        <el-input v-model="formData.mobile" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="省份" prop="provinceId">
        <el-select
          v-model="formData.provinceId"
          placeholder="请选择省份"
          clearable
          @change="handleProvinceChange"
        >
          <el-option
            v-for="item in provinceList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="城市" prop="cityId">
        <el-select
          v-model="formData.cityId"
          placeholder="请选择城市"
          clearable
          @change="handleCityChange"
          :disabled="!formData.provinceId"
        >
          <el-option
            v-for="item in cityList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
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
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" type="textarea" placeholder="请输入备注" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import * as PromoterApi from '@/api/mall/trade/promoter'
import * as AreaApi from '@/api/system/area'

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改

const formData = reactive({
  id: undefined,
  name: '',
  mobile: '',
  provinceId: undefined as number | undefined,
  provinceName: '',
  cityId: undefined as number | undefined,
  cityName: '',
  status: 0,
  remark: ''
})
const formRules = reactive({
  mobile: [{ required: true, message: '手机号不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref

const areaList = ref<any[]>([]) // 省市树形列表
const provinceList = computed(() => areaList.value)
const cityList = computed(() => {
  const province = areaList.value.find((item) => item.id === formData.provinceId)
  return province ? province.children : []
})

const handleProvinceChange = (val: number) => {
  formData.cityId = undefined
  formData.cityName = ''
  const province = areaList.value.find((item) => item.id === val)
  formData.provinceName = province ? province.name : ''
}

const handleCityChange = (val: number) => {
  const city = cityList.value.find((item: any) => item.id === val)
  formData.cityName = city ? city.name : ''
}

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 加载区域数据
  if (areaList.value.length === 0) {
    areaList.value = await AreaApi.getAreaTree()
  }
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      const res = await PromoterApi.getPromoter(id)
      Object.assign(formData, res)
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

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
    const data = { ...formData }
    if (formType.value === 'create') {
      await PromoterApi.createPromoter(data)
      message.success(t('common.createSuccess'))
    } else {
      await PromoterApi.updatePromoter(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  Object.assign(formData, {
    id: undefined,
    name: '',
    mobile: '',
    provinceId: undefined,
    provinceName: '',
    cityId: undefined,
    cityName: '',
    status: 0,
    remark: ''
  })
  formRef.value?.resetFields()
}
</script>
