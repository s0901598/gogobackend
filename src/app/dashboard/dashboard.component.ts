import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder,FormGroup, Validators } from '@angular/forms';
import { presetColors } from 'ng-zorro-antd/core/color';
import { NzUploadChangeParam, NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload';
import { da_DK } from 'ng-zorro-antd/i18n';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';




//定義列表欄位
export interface Data {
  id: number;
  pdname: string;
  pdprice: number;
  picurl:string;
  disabled:boolean;
  switchstatus: boolean;
  createTime:Date;
  labels: string[]; // 新增 labels 欄位，存儲選中的標籤

}


@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
 
})
export class DashboardComponent {
  readonly presetColors = ['red', 'blue', 'green', 'yellow', 'purple']; // 可選標籤的顏色
  readonly customColors = ['#f50', '#2db7f5', '#87d068', '#108ee9'];
  availableLabels: string[] = ['促銷', '新品', '熱門', '限時', '特價']; // 可選標籤
  selectedLabels: string[] = []; // 當前選中的標籤
  checked = false;
  loading = false;
  indeterminate = false;
  listOfData:  Data[] = [];
  listOfCurrentPageData: readonly Data[] = [];
  setOfCheckedId = new Set<number>();
  isCollapsed = false; // 控制側邊欄是否收起
  selectedNav: string = 'nav1'; // 默認選中 nav1
  clickbtn = '';//點擊新增按鈕
  [x: string]: any;
  isOn = false;
  fileList: NzUploadFile[] = []//上傳圖片


  // 排序參數
  sortKey: string | null = 'createTime'; // 默認按創建時間排序
  sortValue: 'ascend' | 'descend' | null = 'descend'; // 默認降序（最新在上）

  @ViewChild('modalContent', { static: true }) modalContent!: TemplateRef<any>; // 引用模板
  form: FormGroup;
  
  
  constructor(private modal: NzModalService,private fb:FormBuilder,private message:NzMessageService,) {
    // 初始化表單
    this.form = this.fb.group({
      name: ['', Validators.required],
      price: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      switchstatus: [false],
      labels:[[]],//儲存選中的標籤
    });
  }
  
  ngOnInit(): void {
    console.log('進入')
    // 從 localStorage 讀取數據
    
    const storedData = localStorage.getItem('listOfData');
    if (storedData != null) {
      //console.log(storedData);
      this.listOfData = JSON.parse(storedData).map((item: any) => ({
        ...item,
        createTime: new Date(item.createTime),
        labels: item.labels || [], // 確保舊數據有 labels 欄位
      }));
    } else {
      console.log('執行else');
      this.listOfData = new Array(10).fill(0).map((_, index) => ({
        id: index,
        pdname: `Edward King ${index}`,
        pdprice: 80,
        picurl: `London, Park Lane no. ${index}`,
        disabled: false,
        switchstatus: false,
        createTime: new Date(), // 設置不同的日期以便排序
        labels: [], // 初始化 labels 為空陣列
      }));
      this.saveToLocalStorage();
    }
    this.sortData();
    this.setOfCheckedId.clear();
    this.checked = false;
    this.indeterminate = false;
    this.refreshCheckedStatus();
  }

   // 點擊 nav 時切換選中的 nav
   selectNav(nav: string): void {
    this.selectedNav = nav;
  }
 
  //顯示彈窗
  showModal(): void {
    // 重置表單
    this.form.reset({switchstatus:false});// 重置表單，默認狀態為 false
    this.fileList = []; // 清空 fileList，避免顯示之前的圖片
    this.selectedLabels = []; // 清空選中的標籤
    this.modal.create({
      nzTitle: '新增商品',
      nzContent: this.modalContent, // 使用模板
      nzOkText: '確定',
      nzCancelText: '取消',
      nzOnOk: () => {
        if (this.form.valid) {
          const productName = this.form.get('name')?.value;
          // 檢查商品名稱是否重複
          if (this.isProductNameExists(productName)) {
            this.message.error('此商品名稱已存在！');
            return false; // 阻止關閉彈窗
          }
          const newId = this.generateUniqueId(); // 生成唯一 ID
          const newItem: Data = {
            id: newId,
            pdname: productName,
            pdprice: this.form.get('price')?.value,
            picurl: this.fileList.length > 0 ? (this.fileList[0].url || this.fileList[0].thumbUrl || 'default-pic-url') : 'default-pic-url', // 存儲圖片 URL,
            disabled: false,
            switchstatus: this.form.get('switchstatus')?.value,
            createTime: new Date(), // 記錄創建時間
            labels: this.selectedLabels, // 存儲選中的標籤
          };
        this.listOfData = [...this.listOfData, newItem]; // 添加到列表
        this.saveToLocalStorage();
        this.sortData(); // 新增後重新排序
        this.message.success('新增商品成功！'); // 顯示成功提示
        console.log('表單數據:', this.form.value);
        return true; // 返回 true 表示關閉彈窗
      }else {
        Object.values(this.form.controls).forEach(control => {
          control.markAsDirty();
          control.updateValueAndValidity();
        });
        return false; // 表單無效，不關閉彈窗
      }
    },
    nzOnCancel: () => console.log('點擊了取消'),
  });
  }

  clicknewbtn(btn: string): void {
    this.clickbtn = btn;
    this.showModal();
  }
  // 處理 狀態開關 事件的函數
  statusclick(): void {
    
    const currentStatus = this.form.get('switchstatus')?.value;
    this.form.get('switchstatus')?.setValue(!currentStatus);
    console.log('開關狀態:', this.form.get('switchstatus')?.value ? '開啟' : '關閉');   
  }

  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }
  onCurrentPageDataChange(listOfCurrentPageData: readonly Data[]): void {
    this.listOfCurrentPageData = listOfCurrentPageData;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfCurrentPageData.every(({ id }) => this.setOfCheckedId.has(id));
    this.indeterminate = this.listOfCurrentPageData.some(({ id }) => this.setOfCheckedId.has(id)) && !this.checked;
    

}
  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }
  onAllChecked(checked: boolean): void {
    this.checked=false

    this.listOfCurrentPageData.forEach(({ id }) => this.updateCheckedSet(id, checked));
  }
 
  changeliststatus(id: number, newStatus: boolean):void{
    const item = this.listOfData.find(data => data.id === id);
    if (item) {
      item.switchstatus = newStatus;
      console.log(`ID ${id} 狀態變更為: ${newStatus ? '開啟' : '關閉'}`);
      this.listOfData = [...this.listOfData]; // 觸發變更檢測
    }
  }

  // 刪除功能
  deleteItem(id: number): void {
    const selectedItem = this.listOfData.find(data => data.id === id);
    if (selectedItem && selectedItem.switchstatus==true) {
      this.message.error('無法刪除狀態為開啟的商品！');
      return;
    }
    this.listOfData = this.listOfData.filter(data => data.id !== id);
    this.setOfCheckedId.delete(id); // 移除勾選狀態
    this.saveToLocalStorage();
    this.message.success('刪除商品成功！');
    this.refreshCheckedStatus();
 
  }

  // 批量刪除（Send Request 按鈕）
  sendRequest(): void {
    this.loading = true;
    const selectedItems = this.listOfData.filter(data => this.setOfCheckedId.has(data.id));
    
    // 檢查是否有狀態為「開」的項目
    const hasEnabledItems = selectedItems.some(item => item.switchstatus);
    if (hasEnabledItems) {
      this.message.error('無法刪除狀態為開啟的商品！');
      this.loading = false;
      return;
    }

    // 執行批量刪除
   
    if (hasEnabledItems) {
      this.message.error('無法刪除狀態為開啟的商品！');
      this.loading = false;
      return;
    }
    this.listOfData = this.listOfData.filter(data => !this.setOfCheckedId.has(data.id));
    this.setOfCheckedId.clear();
    this.saveToLocalStorage();
    this.message.success('批量刪除商品成功！');
    this.refreshCheckedStatus();
    this.loading = false;
  }


  // 儲存數據到 localStorage
  private saveToLocalStorage(): void {
    localStorage.setItem('listOfData', JSON.stringify(this.listOfData));
    console.log('數據已儲存到 localStorage:', this.listOfData);
  }

  // 檢查商品名稱是否重複
  private isProductNameExists(name: string): boolean {
    return this.listOfData.some(item => item.pdname === name);
  }

  // 新增方法：生成唯一的 ID
  private generateUniqueId(): number {
    if (this.listOfData.length === 0) {
      return 0; // 如果列表為空，從 0 開始
    }
    const maxId = Math.max(...this.listOfData.map(item => item.id));
    return maxId + 1; // 返回當前最大 ID 加 1
  }

  // 排序功能
  sortData(): void {
    if (this.sortKey && this.sortValue) {
      this.listOfData = [...this.listOfData].sort((a, b) => {
        const valueA = a[this.sortKey as keyof Data];
        const valueB = b[this.sortKey as keyof Data];
        if (this.sortValue === 'ascend') {
          return valueA > valueB ? 1 : -1;
        } else {
          return valueA < valueB ? 1 : -1;
        }
      });
    }
  }
  // 處理排序變更
  onSortChange(sort: { key: string; value: string|null}): void {
    this.sortKey = sort.key;
    // 類型斷言或檢查，確保 value 符合 'ascend' | 'descend' | null
    if (sort.value === 'ascend' || sort.value === 'descend' || sort.value === null) {
      this.sortValue = sort.value;
    } else {
      this.sortValue = null; // 如果值無效，設為 null
    }
    this.sortData();
  }

  handleChange(info: NzUploadChangeParam): void {
    let fileList = [...info.fileList];
    fileList = fileList.map(file => {
      if (file.status === 'done' && file.response) {
        file.url = file.response.url;
      } else if (file.status === 'uploading') {
        // 模擬上傳成功
        setTimeout(() => {
          file.status = 'done';
          file.url = URL.createObjectURL(file.originFileObj!); // 生成臨時 URL
        }, 1000);
      }
      return file;
    });
    this.fileList = fileList;
  }

  // 新增方法：顯示圖片預覽
  previewImage(url: string): void {
    if (url && url !== 'default-pic-url') {
      console.log('改變尺寸');
      this.modal.create({
        nzTitle: '圖片預覽',
        nzContent: `
          <div class="preview-container" >
            <img nz-image src="${url}" width="300px" height="300px"  />
          </div>
        `,
        nzFooter: null,
        
      });
    } else {
      this.message.error('無效的圖片路徑！');
    }

  }
  checkChange(label: string, checked: boolean):void{
    if (checked) {
      this.selectedLabels = [...this.selectedLabels, label];
      console.log(`選中標籤: ${label}`); // 添加選中日誌
    } else {
      this.selectedLabels = this.selectedLabels.filter(l => l !== label);
      console.log(`取消選中標籤: ${label}`); // 添加取消選中日誌
    }
    this.form.get('labels')?.setValue(this.selectedLabels);
    console.log('當前選中的標籤:', this.selectedLabels);
  }

  // 根據標籤索引返回對應的類別
  getTagClass(label: string): string {
    const index = this.availableLabels.indexOf(label) % this.presetColors.length;
    return `tag-${this.presetColors[index]}`;
  }


}
