<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="65%">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="120px"
    >
      <el-row>
        <el-col :span="24">
          <el-form-item label="展示名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入展示名称" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="展示图片" prop="picUrl">
            <UploadImg v-model="formData.picUrl" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="关联优惠券模板" prop="couponTemplateId">
            <el-select
              v-model="formData.couponTemplateId"
              class="w-80"
              clearable
              filterable
              placeholder="请选择优惠券模板"
            >
              <el-option
                v-for="item in couponTemplateList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="所需积分" prop="point">
            <el-input-number v-model="formData.point" :min="1" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="总可兑换次数" prop="totalCount">
            <el-input-number v-model="formData.totalCount" :min="-1" />
            <el-text class="ml-8px" type="info">-1 表示不限制</el-text>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="每人可兑换次数" prop="takeLimitCount">
            <el-input-number v-model="formData.takeLimitCount" :min="-1" />
            <el-text class="ml-8px" type="info">-1 表示不限制</el-text>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="排序" prop="sort">
            <el-input-number v-model="formData.sort" :min="0" clearable controls-position="right" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="说明" prop="description">
            <el-input
              v-model="formData.description"
              placeholder="请输入说明"
              type="textarea"
              :maxlength="2048"
              show-word-limit
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="兑换须知" prop="notice">
            <el-input
              v-model="formData.notice"
              placeholder="请输入兑换须知"
              type="textarea"
              :maxlength="2048"
              show-word-limit
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="扩展信息" prop="info">
            <el-input
              v-model="formData.info"
              placeholder="请输入扩展信息"
              type="textarea"
              :maxlength="2048"
              show-word-limit
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="formData.remark"
              placeholder="请输入备注"
              type="textarea"
              :maxlength="512"
              show-word-limit
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import * as CouponTemplateApi from '@/api/mall/promotion/coupon/couponTemplate'
import { CommonStatusEnum } from '@/utils/constants'
import { PointCouponExchangeApi, type PointCouponExchangeSaveReqVO } from '@/api/mall/promotion/point'

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref<'create' | 'update'>('create')
const formData = ref<PointCouponExchangeSaveReqVO>({
  id: undefined,
  name: undefined,
  picUrl: undefined,
  description: undefined,
  notice: undefined,
  info: undefined,
  couponTemplateId: undefined,
  point: 1,
  sort: 0,
  remark: undefined,
  totalCount: -1,
  takeLimitCount: -1
})
const formRules = reactive({
  name: [{ required: true, message: '展示名称不能为空', trigger: 'blur' }],
  couponTemplateId: [{ required: true, message: '关联优惠券模板不能为空', trigger: 'change' }],
  point: [{ required: true, message: '所需积分不能为空', trigger: 'blur' }],
  sort: [{ required: true, message: '排序不能为空', trigger: 'blur' }],
  totalCount: [{ required: true, message: '总可兑换次数不能为空', trigger: 'blur' }],
  takeLimitCount: [{ required: true, message: '每人可兑换次数不能为空', trigger: 'blur' }]
})
const formRef = ref()
const couponTemplateList = ref<CouponTemplateApi.CouponTemplateVO[]>([])

const getCouponTemplateList = async () => {
  try {
    const data = await CouponTemplateApi.getCouponTemplatePage({
      pageNo: 1,
      pageSize: 200,
      status: CommonStatusEnum.ENABLE
    } as any)
    couponTemplateList.value = data.list
  } catch (e) {
    message.error('获取优惠券模板列表失败')
  }
}

/** 打开弹窗 */
const open = async (type: 'create' | 'update', id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  await getCouponTemplateList()
  if (id) {
    formLoading.value = true
    try {
      formData.value = (await PointCouponExchangeApi.getPointCouponExchange(id)) as any
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open })

/** 提交表单 */
const emit = defineEmits(['success'])
const submitForm = async () => {
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  formLoading.value = true
  try {
    const data = formData.value as PointCouponExchangeSaveReqVO
    if (formType.value === 'create') {
      await PointCouponExchangeApi.createPointCouponExchange(data)
      message.success(t('common.createSuccess'))
    } else {
      await PointCouponExchangeApi.updatePointCouponExchange(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    name: undefined,
    picUrl: undefined,
    description: undefined,
    notice: undefined,
    info: undefined,
    couponTemplateId: undefined,
    point: 1,
    sort: 0,
    remark: undefined,
    totalCount: -1,
    takeLimitCount: -1
  }
  formRef.value?.resetFields()
}
</script>
