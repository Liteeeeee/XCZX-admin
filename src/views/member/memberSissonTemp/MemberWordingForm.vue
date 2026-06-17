<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="780">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="110px"
      v-loading="formLoading"
    >
      <el-row>
        <el-col :span="12">
          <el-form-item label="话术名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入话术名称" class="!w-240px" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="话术编码" prop="code">
            <el-input v-model="formData.code" placeholder="请输入话术编码" class="!w-240px" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="话术分类" prop="categoryCode">
            <el-select
              v-model="formData.categoryCode"
              filterable
              placeholder="请选择话术分类"
              class="!w-240px"
              @change="handleCategoryChange"
            >
              <el-option
                v-for="item in categoryOptions"
                :key="item.id"
                :label="`${item.name}（${item.code}）`"
                :value="item.code"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="话术类型" prop="typeCode">
            <el-input v-model="formData.typeName" disabled class="!w-240px" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="短信模板" prop="templateId">
        <el-select
          v-model="formData.templateId"
          filterable
          placeholder="请选择短信模板"
          class="!w-full"
          @change="handleSmsTemplateChange"
        >
          <el-option
            v-for="item in smsTemplateOptions"
            :key="item.id"
            :label="`${item.name}（${item.code}）`"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item v-if="paramMappings.length > 0" label="参数映射" prop="params">
        <el-table :data="paramMappings" :stripe="true" class="w-full">
          <el-table-column label="参数名" prop="paramName" width="180px" align="center" />
          <el-table-column label="常量编码" min-width="240px" align="center">
            <template #default="scope">
              <el-select
                v-model="scope.row.constantCode"
                filterable
                placeholder="请选择模板变量"
                class="!w-full"
              >
                <el-option
                  v-for="opt in templateVariableOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>

      <el-form-item label="模板内容">
        <el-input
          v-model="templateContent"
          type="textarea"
          :rows="6"
          placeholder="请选择短信模板后自动返显"
          readonly
        />
      </el-form-item>

      <el-row>
        <el-col :span="12">
          <el-form-item label="每日上限" prop="dailyLimit">
            <el-input-number
              v-model="formData.dailyLimit"
              :min="0"
              :precision="0"
              placeholder="0=不限"
              class="!w-240px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="涉及商品" prop="requireProduct">
            <el-switch v-model="formData.requireProduct" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="涉及优惠券" prop="requireCoupon">
        <el-switch v-model="formData.requireCoupon" />
      </el-form-item>

      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" type="textarea" :rows="2" placeholder="请输入备注" />
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :value="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
import * as WordingApi from '@/api/member/wording'
import * as SmsTemplateApi from '@/api/system/sms/smsTemplate'
import * as CategoryApi from '@/api/member/wordingCategory'

defineOptions({ name: 'MemberWordingForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref<'create' | 'update'>('create')
const formRef = ref()

type ParamMapping = { paramName: string; constantCode: string }

type FormModel = Pick<
  WordingApi.MemberWordingVO,
  | 'id'
  | 'name'
  | 'code'
  | 'categoryCode'
  | 'categoryName'
  | 'typeCode'
  | 'typeName'
  | 'templateId'
  | 'templateCode'
  | 'dailyLimit'
  | 'requireProduct'
  | 'requireCoupon'
  | 'status'
  | 'remark'
  | 'params'
>

const formData = ref<FormModel>({
  id: undefined,
  name: undefined,
  code: undefined,
  categoryCode: undefined,
  categoryName: undefined,
  typeCode: 'SMS',
  typeName: '短信',
  templateId: undefined,
  templateCode: undefined,
  params: undefined,
  dailyLimit: 0,
  requireProduct: false,
  requireCoupon: false,
  status: CommonStatusEnum.ENABLE,
  remark: undefined
})

const formRules = reactive({
  name: [{ required: true, message: '话术名称不能为空', trigger: 'blur' }],
  code: [{ required: true, message: '话术编码不能为空', trigger: 'blur' }],
  categoryCode: [{ required: true, message: '话术分类不能为空', trigger: 'change' }],
  templateId: [{ required: true, message: '短信模板不能为空', trigger: 'change' }],
  templateCode: [
    {
      validator: (_: any, value: any, callback: any) => {
        if (!formData.value.templateId) {
          callback()
          return
        }
        if (!value) {
          callback(new Error('模板编码不能为空'))
          return
        }
        callback()
      },
      trigger: 'change'
    }
  ],
  params: [
    {
      validator: (_: any, value: any, callback: any) => {
        if (!formData.value.templateId) {
          callback()
          return
        }
        if (!paramMappings.value || paramMappings.value.length === 0) {
          callback()
          return
        }
        const invalid = paramMappings.value.some((item) => !item.paramName || !item.constantCode)
        if (invalid) {
          callback(new Error('参数映射未填写完整'))
          return
        }
        callback()
      },
      trigger: 'change'
    }
  ],
  status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
})

const smsTemplateOptions = ref<SmsTemplateApi.SmsTemplateVO[]>([])
const categoryOptions = ref<CategoryApi.MemberWordingCategoryVO[]>([])
const templateVariableOptions = ref<Array<{ label: string; value: string }>>([])
const templateContent = ref<string>()
const paramMappings = ref<ParamMapping[]>([])

watch(
  paramMappings,
  (val) => {
    if (!val || val.length === 0) {
      formData.value.params = undefined
      return
    }
    formData.value.params = JSON.stringify(val)
  },
  { deep: true }
)

const buildConstantCodeOptions = (data: any) => {
  const map = new Map<string, string>()
  const add = (value: any, label?: any) => {
    if (value === undefined || value === null || value === '') return
    const v = String(value)
    map.set(v, label !== undefined && label !== null && label !== '' ? String(label) : v)
  }
  if (Array.isArray(data)) {
    data.forEach((item) => {
      if (typeof item === 'string' || typeof item === 'number') {
        add(item)
        return
      }
      if (item && typeof item === 'object') {
        add(item.constantCode ?? item.code ?? item.key ?? item.value, item.name ?? item.label)
      }
    })
  } else if (data && typeof data === 'object') {
    if (Array.isArray(data.list)) {
      data.list.forEach((item: any) => {
        if (item && typeof item === 'object') {
          add(item.constantCode ?? item.code ?? item.key ?? item.value, item.name ?? item.label)
        }
      })
    } else {
      Object.entries(data).forEach(([k, v]) => {
        if (v && typeof v === 'object') add(k, (v as any).name ?? (v as any).label ?? k)
        else add(k)
      })
    }
  }
  templateVariableOptions.value = Array.from(map.entries()).map(([value, label]) => ({
    value,
    label
  }))
}

const parseSmsTemplateParams = (params: any) => {
  if (!params) return []
  const arr = Array.isArray(params) ? params : String(params).split(',')
  return arr
    .map((s: any) => String(s).trim())
    .filter((s: string) => s.length > 0)
    .map((paramName: string) => ({ paramName, constantCode: '' }))
}

const loadSmsTemplateOptions = async () => {
  const data = await SmsTemplateApi.getSmsTemplatePage({ pageNo: 1, pageSize: 200 } as any)
  smsTemplateOptions.value = data.list || []
}

const loadCategoryOptions = async () => {
  const data = await CategoryApi.getMemberWordingCategorySimpleList()
  categoryOptions.value = data || []
}

const loadTemplateVariableOptions = async () => {
  const data = await WordingApi.getMemberWordingTemplateVariableList()
  buildConstantCodeOptions(data)
}

const handleSmsTemplateChange = async (id: number) => {
  if (!id) return
  formLoading.value = true
  try {
    const tpl = await SmsTemplateApi.getSmsTemplate(id)
    formData.value.templateCode = tpl?.code
    templateContent.value = tpl?.content
    const existing = new Map(paramMappings.value.map((p) => [p.paramName, p.constantCode]))
    const next = parseSmsTemplateParams(tpl?.params)
    paramMappings.value = next.map((p) => ({
      ...p,
      constantCode: existing.get(p.paramName) || ''
    }))
  } finally {
    formLoading.value = false
  }
}

const handleCategoryChange = (code: string) => {
  if (!code) return
  const item = categoryOptions.value.find((x) => x.code === code)
  formData.value.categoryName = item?.name
}

const resetForm = () => {
  formData.value = {
    id: undefined,
    name: undefined,
    code: undefined,
    categoryCode: undefined,
    categoryName: undefined,
    typeCode: 'SMS',
    typeName: '短信',
    templateId: undefined,
    templateCode: undefined,
    params: undefined,
    dailyLimit: 0,
    requireProduct: false,
    requireCoupon: false,
    status: CommonStatusEnum.ENABLE,
    remark: undefined
  }
  templateContent.value = undefined
  paramMappings.value = []
  formRef.value?.resetFields()
}

const open = async (type: 'create' | 'update', id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  formLoading.value = true
  try {
    await Promise.all([
      loadSmsTemplateOptions(),
      loadCategoryOptions(),
      loadTemplateVariableOptions()
    ])
    if (type !== 'update' || !id) return
    const data = await WordingApi.getMemberWording(id)
    formData.value = { ...formData.value, ...(data || {}) }
    if (formData.value.params) {
      try {
        const parsed = JSON.parse(formData.value.params) as ParamMapping[]
        paramMappings.value = Array.isArray(parsed) ? parsed : []
      } catch {
        paramMappings.value = []
      }
    }
    if (formData.value.categoryCode) {
      handleCategoryChange(formData.value.categoryCode)
    }
    if (formData.value.templateId) {
      await handleSmsTemplateChange(formData.value.templateId as any)
    }
  } finally {
    formLoading.value = false
  }
}
defineExpose({ open })

const emit = defineEmits(['success'])
const submitForm = async () => {
  await formRef.value.validate()
  formLoading.value = true
  try {
    const data: any = { ...formData.value }
    delete data.paramMetas
    delete data.createTime
    if (formType.value === 'create') {
      await WordingApi.createMemberWording(data)
      message.success(t('common.createSuccess'))
    } else {
      await WordingApi.updateMemberWording(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}
</script>
