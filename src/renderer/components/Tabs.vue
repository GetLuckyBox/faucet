<script setup lang="ts">
import { ref, reactive, toRefs } from 'vue'
import { ElMessage } from 'element-plus'
const showList = ref([])
const areaList = ref([])
const areaData = ref([])
const editableTabsValue = ref('')
const areaFormat = {
  socks5Address: '', // 必填项
  name: '',// 必填项
}
const areaForm = reactive(areaFormat)
const loadEnvJsonContent = async () => {
  const content = await window.electronAPI.loadEnvJsonContent();
  (content as object[]).forEach((item: any) => {
    const temp = Object.assign(ref(areaForm), item);
    areaData.value.push(temp as never);
    areaList.value.push(({
      value: item.name,
      label: item.name,
      tableData: []
    }) as never);
    editableTabsValue.value = item.name
  })
}
loadEnvJsonContent()

const rowFormat = {

  localPort: '', // 必填项
  remoteAddress: '',// 必填项
  jumpAddress: '',// 必填项
  appType: '',// 筛选项
  env: '',// 筛选项
  area: '',// 筛选项
  remark: '',
}
const form = reactive(rowFormat)
const loadPipeJsonContent = async () => {
  for (const areaKey in areaList.value) {
    (areaList.value[areaKey] as any).tableData = []
  }
  const content = await window.electronAPI.loadPipeJsonContent();
  (content as object[]).forEach((item: any) => {
    const temp = Object.assign({isClose: "0"}, item);
    (areaList.value as object[]).forEach((areaItem:any) => {
      if (areaItem.label == temp.area) {
        areaItem.tableData.push(temp)
      }
    })
  })
}
loadPipeJsonContent()

defineProps({
  msg: String,
})
let editItemIndex = 0
let dialogFormVisible = ref(false)
let dialogEnvVisible = ref(false)
let dialogFormTitle = ref('新增隧道')
let openAllDisabled = ref(false)
let closeAllDisabled = ref(false)
const handleEdit = (props: any) => {
  if (props.row.isClose == 1) {
    errorTips('隧道开启中不可编辑');
    return;
  }
  editItemIndex = props.$index
  const row = props.row
  dialogFormTitle.value = '编辑隧道'
  form.area = row.area
  form.appType = row.appType
  form.env = row.env
  form.localPort = row.localPort
  form.jumpAddress = row.jumpAddress
  form.remoteAddress = row.remoteAddress
  form.remark = row.remark
  dialogFormVisible.value = true
}
const errorTips = (msg: string) => {
  ElMessage({
    showClose: true,
    message: msg,
    type: 'error',
  })
}
const handleDel = (props: any) => {
  // 隧道开启中不可删除
  if (props.row.isClose == 1) {
    errorTips('隧道开启中不可删除');
    return;
  }

  const index = props.$index;
  window.electronAPI.delPipe(JSON.stringify({
    "index": index,
    "area": props.row.area
  }));
  loadPipeJsonContent()
}
const handlePipe = (row: any) => {
  const pipeConfigJsonStr = JSON.stringify(row)
  if (row.isClose == '1') {
    const startPipe = async () => {
      console.log(pipeConfigJsonStr)
     const res = await window.electronAPI.startPipe(pipeConfigJsonStr);
     console.log('startPipe res', res)
     if (!res) {
       row.isClose = 0
       ElMessage.error('开启失败')
     } else {
       setTimeout(() => {
         const isPortReachable = async () => {
           const res = await window.electronAPI.isPortReachable(row.localPort);
           console.log('isPortReachable',res)
           if (! res ) {
             row.isClose = 0
             ElMessage.error('隧道建立失败')
           }
         }
         isPortReachable()
       }, 2000)
     }
    }
    console.log(startPipe())
  } else {
    window.electronAPI.closePipe(pipeConfigJsonStr);
  }
}
const handleCancelDig = () => {
  editItemIndex = 0
  dialogFormTitle.value = '新增隧道'
  dialogFormVisible.value = false
}
const submit = () => {
  const formData = Object.assign(reactive({}), reactive(toRefs(form)));
  if (dialogFormTitle.value == '新增隧道') {
    for (const areaKey in areaList.value) {
      let areaItem = (areaList.value[areaKey] as any);
      for (const key in (areaItem.tableData as object[])) {
        if (areaItem.tableData[key].localPort == form.localPort) {
          errorTips('本地端口不可重复');
          return
        }
      }
    }
    const formDataJsonStr = JSON.stringify(formData)
    const addPipe = async () => {
      return window.electronAPI.addPipe(formDataJsonStr);
    }
    addPipe();
  } else {
    for (const areaKey in areaList.value) {
      let areaItem = (areaList.value[areaKey] as any);
      for (const key in (areaItem.tableData as object[])) {
        if (areaItem.tableData[key].localPort == form.localPort && editItemIndex != parseInt(key)) {
          errorTips('本地端口不可重复');
          return
        }
      }
    }
    const formDataJsonStr = JSON.stringify({
      index: editItemIndex,
      row: form,
      editableTabsValue: editableTabsValue.value
    })
    window.electronAPI.editPipe(formDataJsonStr);
  }
  loadPipeJsonContent()
  dialogFormTitle.value = '新增隧道'
  dialogFormVisible.value = false
}
const openAllPipe = () => {
  closeAllDisabled.value = true
  openAllDisabled.value = true
  for (const areaKey in (areaList.value as object[])) {
    for (const key in areaList.value[areaKey].tableData) {
      if (areaList.value[areaKey].tableData[key].isClose != "1") {
        areaList.value[areaKey].tableData[key].isClose = "1"
        handlePipe(areaList.value[areaKey].tableData[key])
      }
    }
  }
  setTimeout(()=> {
    closeAllDisabled.value = false
    openAllDisabled.value = false
  },6000)
}
const closeAllPipe = () => {
  closeAllDisabled.value = true
  openAllDisabled.value = true
  for (const areaKey in areaList.value) {
    for (const key in (areaList.value[areaKey] as object).tableData) {
      if (areaList.value[areaKey].tableData[key].isClose != "0") {
        areaList.value[areaKey].tableData[key].isClose = "0"
        handlePipe(areaList.value[areaKey].tableData[key])
      }
    }
  }
  setTimeout(()=>{
    closeAllDisabled.value = false
    openAllDisabled.value = false
  },5000)
}
const formLabelWidth = '80px'
</script>

<template>
  <el-button type="primary" @click="dialogFormVisible = true">新增隧道</el-button>
  <el-button type="primary" @click="dialogEnvVisible = true">socket5</el-button>
  <el-button type="primary" @click=openAllPipe() :disabled="openAllDisabled">一键开启</el-button>
  <el-button type="primary" @click=closeAllPipe() :disabled="closeAllDisabled">一键关闭</el-button>
  <el-dialog v-model="dialogFormVisible" :title=dialogFormTitle>
    <el-form :model="form">
      <el-form-item label="本地端口" :label-width="formLabelWidth">
        <el-input v-model="form.localPort" autocomplete="off" placeholder="请输入本地端口,如6379" />
      </el-form-item>
      <el-form-item label="远程地址" :label-width="formLabelWidth">
        <el-input v-model="form.remoteAddress" autocomplete="off" placeholder="请输入远程地址,如10.1.2.108:3306" />
      </el-form-item>
      <el-form-item label="跳板地址" :label-width="formLabelWidth">
        <el-input v-model="form.jumpAddress" autocomplete="off" placeholder="请输入跳板地址,如root@81.58.243.238" />
      </el-form-item>
      <el-form-item label="备注" :label-width="formLabelWidth">
        <el-input v-model="form.remark" autocomplete="off" />
      </el-form-item>
      <el-form-item label="应用类型" :label-width="formLabelWidth">
        <el-input v-model="form.appType" autocomplete="off" />
      </el-form-item>
      <el-form-item label="运行环境" :label-width="formLabelWidth">
        <el-input v-model="form.env" autocomplete="off" />
      </el-form-item>
      <el-form-item label="区域名称" :label-width="formLabelWidth">
        <el-select v-model="form.area" placeholder="Select" >
          <el-option
              v-for="item in areaList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
        <el-button @click="handleCancelDig()">取消</el-button>
        <el-button type="primary" @click="submit()">
          确定
        </el-button>
    </template>
  </el-dialog>
  <el-dialog v-model="dialogEnvVisible" title='socket5'>
    <el-table :data="areaData" style="width: 100%" max-height="250">
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="socks5Address" label="socks5" />
      <el-table-column fixed="right" align="center" label="操作" width="200px">
        <template v-slot="props">
          <el-button type="primary" @click="dialogFormVisible = true">ping百度</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>
  <el-tabs v-model="editableTabsValue" type="card"  style="margin-top: 15px">
    <el-tab-pane
        v-for="item in areaList"
        :key="item.value"
        :label="item.value"
        :name="item.value"
    >
      <el-table :data="item.tableData" style="width: 100%">
        <el-table-column type="expand">
          <template #default="props">
            <div>
              <el-row :gutter="24">
                <el-col :span="6"><p>本地端口: {{ props.row.localPort }}</p></el-col>
                <el-col :span="6"><p>应用: {{ props.row.appType }}</p></el-col>
                <el-col :span="6"><p>环境: {{ props.row.env }}</p></el-col>
                <el-col :span="6"><p>区域: {{ props.row.area }}</p></el-col>
                <el-col :span="24"><p>备注: {{ props.row.remark }}</p></el-col>
                <el-col :span="24"><p>远程地址: {{ props.row.remoteAddress }}</p></el-col>
                <el-col :span="24"><p>跳板地址: {{ props.row.jumpAddress }}</p></el-col>
              </el-row>
            </div>
            <el-button type="primary" size="small" @click="handleEdit(props)">编辑</el-button>
            <el-popconfirm title="确认删除选中配置?" @confirm="handleDel(props)">
              <template #reference>
                <el-button type="danger" size="small" style="margin-left: 20px">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
        <el-table-column prop="localPort" label="本地端口"  />
        <el-table-column prop="appType" width="100px" label="应用" />
        <el-table-column prop="env" label="环境" />
        <el-table-column prop="area" label="区域" />
        <el-table-column prop="remark" label="备注" />
        <el-table-column fixed="right" align="center" label="操作" width="200px">
          <template v-slot="props">
            <el-switch
                v-model="props.row.isClose"
                size="small"
                active-value="1"
                active-text="开"
                inactive-value="0"
                inactive-text="关"
                @click="handlePipe(props.row)"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-tab-pane>
  </el-tabs>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
