<script setup lang="ts">
import { ref, reactive, toRefs } from 'vue'
import { ElMessage } from 'element-plus'

const tableData = ref([])
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
  const content = await window.electronAPI.loadPipeJsonContent();
  (content as object[]).forEach((item) => {
    const temp = Object.assign({isClose: 0}, item);
    tableData.value.push(temp as never);
  })
}
loadPipeJsonContent()

defineProps({
  msg: String,
})
let editItemIndex = 0
let dialogFormVisible = ref(false)
let dialogFormTitle = ref('新增隧道')

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
  window.electronAPI.delPipe(index);
  (tableData.value as object[]).splice(index, 1);
}

const handlePipe = (row: any) => {
  console.log(row)
  const pipeConfigJsonStr = JSON.stringify(row)
  if (row.isClose == 1) {
    window.electronAPI.startPipe(pipeConfigJsonStr);
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
  for (const key in tableData.value) {
    if ((tableData.value[key] as any).localPort == form.localPort) {
      errorTips('本地端口不可重复');
      return
    }
  }
  const formData = Object.assign(reactive({}), reactive(toRefs(form)));
  if (dialogFormTitle.value == '新增隧道') {

    const formDataJsonStr = JSON.stringify(formData)
    const addPipe = async () => {
      return window.electronAPI.addPipe(formDataJsonStr);
    }
    addPipe();
    (tableData.value as object[]).push(formData);
  } else {
    const formDataJsonStr = JSON.stringify({
      index: editItemIndex,
      row: form
    })
    window.electronAPI.editPipe(formDataJsonStr);
    (tableData.value as object[])[editItemIndex] = formData;
  }
  dialogFormTitle.value = '新增隧道'
  dialogFormVisible.value = false
}

const formLabelWidth = '80px'

</script>

<template>
  <el-button type="primary" @click="dialogFormVisible = true">新增隧道</el-button>
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
        <el-input v-model="form.area" autocomplete="off" />
      </el-form-item>
    </el-form>
    <template #footer>
        <el-button @click="handleCancelDig()">Cancel</el-button>
        <el-button type="primary" @click="submit()">
          Confirm
        </el-button>
    </template>
  </el-dialog>
  <el-tabs model-value="first">
    <el-tab-pane  label="隧道列表" name="first">
      <el-table :data="tableData" style="width: 100%">
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
          <template #default="props">
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
      <div class="example-pagination-block" style="float: right;margin-top: 15px">
        <el-pagination layout="prev, pager, next" :total="50" />
      </div>
    </el-tab-pane>
  </el-tabs>

</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
