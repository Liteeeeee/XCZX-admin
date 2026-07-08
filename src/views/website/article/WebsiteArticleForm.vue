<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="75%">
    <el-form ref="formRef" v-loading="formLoading" :model="formData" :rules="formRules" label-width="120px">
      <el-row>
        <el-col :span="12">
          <el-form-item label="文章标题" prop="title">
            <el-input v-model="formData.title" placeholder="请输入文章标题" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="文章分类" prop="categoryId">
            <el-select v-model="formData.categoryId" placeholder="请选择">
              <el-option v-for="item in categoryList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="关键字" prop="keyword">
            <el-input v-model="formData.keyword" placeholder="请输入关键字" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="标签" prop="tag">
            <el-input v-model="formData.tag" placeholder="请输入标签" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="文章作者" prop="author">
            <el-input v-model="formData.author" placeholder="请输入文章作者" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="排序" prop="sort">
            <el-input-number v-model="formData.sort" :min="0" clearable controls-position="right" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="文章简介" prop="introduction">
            <el-input v-model="formData.introduction" type="textarea" placeholder="请输入文章简介" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="文章封面" prop="picUrl">
            <UploadImg v-model="formData.picUrl" height="80px" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="展示状态" prop="status">
            <el-radio-group v-model="formData.status">
              <el-radio v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)" :key="dict.value" :value="dict.value">
                {{ dict.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="发布时间" prop="publishTime">
            <el-date-picker
              v-model="formData.publishTime"
              type="datetime"
              placeholder="请选择发布时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              class="w-full!"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否热门" prop="recommendHot">
            <el-radio-group v-model="formData.recommendHot">
              <el-radio v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)" :key="dict.value" :value="dict.value">
                {{ dict.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否轮播图" prop="recommendBanner">
            <el-radio-group v-model="formData.recommendBanner">
              <el-radio v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)" :key="dict.value" :value="dict.value">
                {{ dict.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="轮播图 URL" prop="bannerPicUrl">
            <UploadImg v-model="formData.bannerPicUrl" height="80px" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="商品关联" prop="spuId">
            <el-tag v-if="formData.spuId" class="mr-10px">
              {{ spuList.find((item) => item.id === formData.spuId)?.name }}
            </el-tag>
            <el-button @click="spuSelectRef?.open()">选择商品</el-button>
            <el-button v-if="formData.spuId" class="ml-10px" @click="formData.spuId = undefined">清除</el-button>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="SKU ID" prop="skuId">
            <el-input-number v-model="formData.skuId" :min="0" clearable controls-position="right" class="w-full!" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="文章内容" prop="content">
            <Editor v-model="formData.content" height="300px" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
  <SpuSelect ref="spuSelectRef" @confirm="selectSpu" />
</template>

<script lang="ts" setup>
import { DICT_TYPE, getBoolDictOptions, getIntDictOptions } from '@/utils/dict'
import * as WebsiteArticleApi from '@/api/mall/promotion/websiteArticle'
import * as ArticleCategoryApi from '@/api/mall/promotion/articleCategory'
import * as ProductSpuApi from '@/api/mall/product/spu'
import { SpuSelect } from '@/views/mall/promotion/components'

defineOptions({ name: 'WebsiteArticleForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('')

const formData = ref({
  id: undefined as number | undefined,
  title: undefined as string | undefined,
  categoryId: undefined as number | undefined,
  keyword: undefined as string | undefined,
  tag: undefined as string | undefined,
  author: undefined as string | undefined,
  introduction: undefined as string | undefined,
  picUrl: undefined as string | undefined,
  sort: 0,
  status: 0,
  recommendHot: false,
  recommendBanner: false,
  bannerPicUrl: undefined as string | undefined,
  spuId: undefined as number | undefined,
  skuId: undefined as number | undefined,
  content: undefined as string | undefined,
  publishTime: undefined as string | undefined
})

const formRules = reactive({
  categoryId: [{ required: true, message: '文章分类不能为空', trigger: 'blur' }],
  title: [{ required: true, message: '文章标题不能为空', trigger: 'blur' }],
  sort: [{ required: true, message: '排序不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '展示状态不能为空', trigger: 'blur' }],
  recommendHot: [{ required: true, message: '是否热门不能为空', trigger: 'blur' }],
  recommendBanner: [{ required: true, message: '是否轮播图不能为空', trigger: 'blur' }],
  content: [{ required: true, message: '文章内容不能为空', trigger: 'blur' }]
})

const formRef = ref()
const spuSelectRef = ref()
const selectSpu = (spuId: number) => {
  formData.value.spuId = spuId
}

const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  if (!id) return
  formLoading.value = true
  try {
    const data = (await WebsiteArticleApi.getWebsiteArticle(id)) as any
    if (data.publishTime === 0 || data.publishTime === '0') {
      data.publishTime = undefined
    }
    formData.value = data
  } finally {
    formLoading.value = false
  }
}

defineExpose({ open })

const emit = defineEmits(['success'])
const submitForm = async () => {
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  formLoading.value = true
  try {
    const data = {
      ...formData.value,
      publishTime:
        !formData.value.publishTime || formData.value.publishTime === (0 as any) || formData.value.publishTime === ('0' as any)
          ? null
          : formData.value.publishTime
    } as unknown as WebsiteArticleApi.WebsiteArticleVO
    if (formType.value === 'create') {
      await WebsiteArticleApi.createWebsiteArticle(data)
      message.success(t('common.createSuccess'))
    } else {
      await WebsiteArticleApi.updateWebsiteArticle(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}

const resetForm = () => {
  formData.value = {
    id: undefined,
    title: undefined,
    categoryId: undefined,
    keyword: undefined,
    tag: undefined,
    author: undefined,
    introduction: undefined,
    picUrl: undefined,
    sort: 0,
    status: 0,
    recommendHot: false,
    recommendBanner: false,
    bannerPicUrl: undefined,
    spuId: undefined,
    skuId: undefined,
    content: undefined,
    publishTime: undefined
  }
  formRef.value?.resetFields()
}

const categoryList = ref<ArticleCategoryApi.ArticleCategoryVO[]>([])
const spuList = ref<ProductSpuApi.Spu[]>([])
onMounted(async () => {
  categoryList.value =
    (await ArticleCategoryApi.getSimpleArticleCategoryList()) as ArticleCategoryApi.ArticleCategoryVO[]
  spuList.value = (await ProductSpuApi.getSpuSimpleList()) as ProductSpuApi.Spu[]
})
</script>
