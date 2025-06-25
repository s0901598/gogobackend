import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectOptionInterface } from 'ng-zorro-antd/select';
import { NzUploadFile, NzUploadChangeParam } from 'ng-zorro-antd/upload';
import { HttpService } from '../share/service/http.service';

//定義列表欄位
export interface Data {
  id: number;
  pdname: string;
  pdprice: number;
  picurl:string[];
  disabled:boolean;
  switchstatus: boolean;
  createTime:Date;
  labels: string[]; // 新增 labels 欄位，存儲選中的標籤
}
@Component({
  selector: 'app-productlist',
  standalone: false,
  templateUrl: './productlist.component.html',
  styleUrl: './productlist.component.css'
})



export class ProductlistComponent {
  readonly presetColors = ['red', 'blue', 'green', 'yellow', 'purple','orange','brown']; // 可選標籤的顏色

    // 定義商品名稱列表
    productNameList: NzSelectOptionInterface[] = [
      { label: '精緻豪華四人房', value: '精緻豪華四人房' },
      { label: '蜜月雙人房', value: '蜜月雙人房' },
      { label: '家庭三人房', value: '家庭三人房 ' },
      { label: '樓中樓四人房', value: '樓中樓四人房' },
      { label: '黃金單身房', value: '黃金單身房' },
    ];
     // 定義標籤和圖標的映射
  availableLabels: { text: string; icon: string }[] = [
    { text: '1 King Bed', icon: 'fa-bed' },
    { text: 'Plasma TV', icon: 'fa-tv' },
    { text: 'Free wi-fi', icon: 'fa-wifi' },
    { text: 'Smoke-free', icon: 'fa-ban-smoking' },
    {text:'1 King +2 Queen',icon: 'fa-bed'},
    {text:'Free Newspaper',icon:'fa-newspaper'},
    {text:'Indoor corridor',icon:'fa-door-open'},
  ];
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
    previewVisible = false; // 控制預覽彈窗顯示
    previewImages: string[] = []; // 儲存所有預覽圖片URL
    previewIndex = 0; // 當前預覽的圖片索引

    // 用於追蹤是否為編輯模式
  private isEditMode: boolean = false;
  private editItemId: number | null = null;

  // 在類中新增一個屬性
  filteredProductNameList: NzSelectOptionInterface[] = [];

  // 排序參數
  sortKey: string | null = 'createTime'; // 默認按創建時間排序
  sortValue: 'ascend' | 'descend' | null = 'descend'; // 默認降序（最新在上）

  @ViewChild('modalContent', { static: true }) modalContent!: TemplateRef<any>; // 引用模板
  form: FormGroup;

  constructor(private http:HttpService,  private modal: NzModalService,private fb:FormBuilder,private message:NzMessageService,private router: Router) {
    this.http.get('getlabel/').subscribe((x:any)=>{
     this.availableLabels = x.labels.map((y:any,index:number)=> {
       return {text:y.specificname,icon:this.availableLabels[index].icon}
     });
   })

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
       id: index+1,
       pdname: `Edward King ${index}`,
       pdprice: 80,
       picurl: [`London, Park Lane no. ${index}`],
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
   this.isEditMode = false;
   this.editItemId = null;
   // 重置表單
   console.log('productNameList:', this.productNameList);
   this.form.reset({switchstatus:false,name:''});// 重置表單，默認狀態為 false
   this.fileList = []; // 清空 fileList，避免顯示之前的圖片
   this.selectedLabels = []; // 清空選中的標籤
   // 過濾未使用的商品名稱
   this.filteredProductNameList = this.productNameList.filter(option =>
   !this.listOfData.some(item => item.pdname === option.value)
 );
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
           picurl: this.fileList.map(file => file.url || file.thumbUrl || 'default-pic-url'), // 存儲多張圖片 URL,
           disabled: false,
           switchstatus: this.form.get('switchstatus')?.value??false,// 確保有值
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
     this.saveToLocalStorage(); // 保存到 localStorage
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
 private isProductNameExists(name: string,excludeId?: number): boolean {
   return this.listOfData.some(item => item.pdname === name && (excludeId === undefined || item.id !== excludeId));  }

 // 新增方法：生成唯一的 ID
 private generateUniqueId(): number {
   if (this.listOfData.length === 0) {
     return 1; // 如果列表為空，從 0 開始
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
   // 限制最多5張圖片
 if (fileList.length > 5) {
   fileList = fileList.slice(0, 5);
   this.message.warning('最多只能上傳5張圖片');
 }
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
 previewImage(urls: string|string[]): void {
   if (Array.isArray(urls) && urls.length > 0 && urls[0] !== 'default-pic-url') {
     this.previewImages = urls;
     this.previewIndex = 0;
     this.previewVisible = true;
   } else if (typeof urls === 'string' && urls !== 'default-pic-url') {
     this.previewImages = [urls];
     this.previewIndex = 0;
     this.previewVisible = true;
   } else {
     this.message.error('無效的圖片路徑！');
   }
 }
 // 新增切換圖片方法
   previewNext(): void {
     if (this.previewIndex < this.previewImages.length - 1) {
       this.previewIndex++;
     }
   }

   previewPrev(): void {
     if (this.previewIndex > 0) {
       this.previewIndex--;
     }
   }



 checkChange(label: string, checked: boolean):void{
   if (checked) {
     this.selectedLabels = [...this.selectedLabels, label];
     console.log(`選中標籤: ${label}`);
   } else {
     this.selectedLabels = this.selectedLabels.filter(l => l !== label);
     console.log(`取消選中標籤: ${label}`);
   }
   this.form.get('labels')?.setValue(this.selectedLabels);
   console.log('當前選中的標籤:', this.selectedLabels);
 }

 // 根據標籤索引返回對應的類別
 getTagClass(label: string): string {
   const index = this.availableLabels.findIndex(item => item.text === label) % this.presetColors.length;
       return `tag-${this.presetColors[index]}`;

 }
 // 新增方法：根據標籤文字獲取 Font Awesome 圖標類名
 getTagIcon(label: string): string {
   return this.availableLabels.find(item => item.text === label)?.icon || 'fa-tag';
 }

 // 新增編輯方法
 editItem(item: Data): void {
   this.isEditMode = true;
   this.editItemId = item.id;
   this.fileList = item.picurl.map((url, index) => ({
     uid: String(-index),
     name: `image${index}.png`,
     status: 'done',
     url: url
   }));
   // 填充表單數據
   this.form.patchValue({
     name: item.pdname,
     price: item.pdprice.toString(),
     switchstatus: item.switchstatus,
     labels: item.labels,
   });
   this.fileList = [];// 清空 fileList，要求重新上傳
   this.selectedLabels = [...item.labels];

   // 過濾未使用的商品名稱，但允許當前名稱
   this.filteredProductNameList = this.productNameList.filter(option =>
     !this.listOfData.some(data => data.pdname === option.value && data.id !== item.id)
   );

   this.modal.create({
     nzTitle: '編輯商品',
     nzContent: this.modalContent,
     nzOkText: '更新',
     nzCancelText: '取消',
     nzOnOk: () => {
       if (this.form.valid) {
         const productName = this.form.get('name')?.value;
         if (this.isProductNameExists(productName, item.id)) {
           this.message.error('此商品名稱已存在！');
           return false;
         }
         const updatedItem: Data = {
           id: item.id,
           pdname: productName,
           pdprice: this.form.get('price')?.value,
           picurl: this.fileList.map(file => file.url || file.thumbUrl || 'default-pic-url'),
           disabled: false,
           switchstatus: this.form.get('switchstatus')?.value??false,//確保有值
           createTime: item.createTime, // 保留原始創建時間
           labels: this.selectedLabels,
         };
         this.listOfData = this.listOfData.map(data => (data.id === item.id ? updatedItem : data));
         this.saveToLocalStorage();
         this.sortData();
         this.message.success('商品更新成功！');
         return true;
       } else {
         Object.values(this.form.controls).forEach(control => {
           control.markAsDirty();
           control.updateValueAndValidity();
         });
         return false;
       }
     },
     nzOnCancel: () => {
       this.isEditMode = false;
       this.editItemId = null;
     },
   });
 }


 // 新增登出方法
 logout(): void {
   this.message.success('已登出');
   this.router.navigate(['/login']); // 跳轉到登入頁面
 }

}
