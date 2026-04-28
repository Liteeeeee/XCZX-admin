<template>
  <Dialog title="推广码" v-model="dialogVisible" width="400px">
    <div class="flex flex-col items-center justify-center" v-loading="loading">
      <div v-if="qrcodeUrl" class="mb-4">
        <el-image
          :src="qrcodeUrl"
          class="w-250px h-250px border border-gray-200 rounded-md"
          :preview-src-list="[qrcodeUrl]"
          fit="contain"
        />
      </div>
      <div v-else-if="!loading" class="text-gray-400 mb-4 h-250px flex items-center">
        暂无推广码
      </div>
      
      <div class="text-gray-500 text-sm mb-4 text-center">
        用户通过微信扫码后，将自动与该推广员绑定<br/>
        并记录推广业绩
      </div>

      <el-button type="primary" @click="handleDownload" :disabled="!qrcodeUrl">
        <Icon icon="ep:download" class="mr-5px" /> 下载推广码
      </el-button>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import * as PromoterApi from '@/api/mall/trade/promoter'

const message = useMessage()

const dialogVisible = ref(false)
const loading = ref(false)
const qrcodeUrl = ref('')
const currentPromoterName = ref('')

/** 打开弹窗 */
const open = async (promoterId: number, promoterName: string) => {
  dialogVisible.value = true
  qrcodeUrl.value = ''
  currentPromoterName.value = promoterName
  
  loading.value = true
  try {
    const res = await PromoterApi.generateWxaQrcode({
      scene: `spm=${promoterId}.1.0.3.2`,
      path: 'pages/index/index',
      width: 430
    })
    
    // 如果返回的是 base64 字符串但没有前缀，加上前缀
    if (res && typeof res === 'string') {
      if (res.startsWith('http')) {
        qrcodeUrl.value = res
      } else if (res.startsWith('data:image')) {
        qrcodeUrl.value = res
      } else {
        qrcodeUrl.value = 'data:image/png;base64,' + res
      }
    }
  } catch (error) {
    console.error('获取推广码失败', error)
  } finally {
    loading.value = false
  }
}

/** 下载推广码 */
const handleDownload = () => {
  if (!qrcodeUrl.value) return
  
  const link = document.createElement('a')
  link.href = qrcodeUrl.value
  link.download = `推广码-${currentPromoterName.value}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

defineExpose({ open })
</script>