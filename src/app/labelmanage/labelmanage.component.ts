import { Component, TemplateRef, ViewChild } from '@angular/core';
import { HttpService } from '../share/service/http.service';
import { NzMessageComponent, NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-labelmanage',
  standalone: false,
  templateUrl: './labelmanage.component.html',
  styleUrl: './labelmanage.component.css'
})
export class LabelmanageComponent {
inputValue: string = ''; // 修正為字串，匹配 JSON 數據
  options: string[] = []; // 原始 JSON 數據
  filteredOptions: string[] = []; // 過濾後的選項

  [x: string]: any;
  availabletags: {icon: string }[] = [
    { icon: 'fa-bed' },
    { icon: 'fa-tv' },
    {icon: 'fa-wifi' },
    {icon: 'fa-ban-smoking' },
    {icon: 'fa-bed'},
    {icon:'fa-newspaper'},
    {icon:'fa-door-open'},
  ];
    labels:any[] = []
    newLabelName='';
    showModal = false;
    labelid=0
    listOfOption: string[] = [];
    readonly nzFilterOption = (): boolean => true;


    @ViewChild('editTemplate', { static: false }) editTemplate!: TemplateRef<any>; // 引用編輯模板

    constructor(private http:HttpService,private message:NzMessageService,private nzMessageService: NzMessageService,private modal: NzModalService ) {

      this.http.origin_get<any>('assets/icons.json').subscribe(x=>{
        this.options=x
      })

       this.http.get('label/getlabel/').subscribe((x:any)=>{
        this.listOfOption = x.labels.map((y:any,index:number)=> {
          return {icon:this.availabletags[index]?.icon}
        });
    })

    this.loadLabels()//載入初始標籤列表
    }



    // 載入標籤列表
    loadLabels() {
    this.http.get('label/getlabel/').subscribe((x: any) => {
      this.labels = x.labels;
      console.log(this.labels)
    });
  }
    openModal(){
      this.showModal = true;
      this.newLabelName = ''; // 清空輸入
    }
    createMessage(type: string,string:string): void {
      this.message.create(type, string);
    }


    create(){
      if (!this.newLabelName.trim()) {
        this.createMessage("error","請輸入標籤名稱")
        return;
      }

      const newLabel = {labelid:this.labelid ,specificname: this.newLabelName,iconname: this.inputValue};
      this.http.post('label/addlabel/', newLabel).subscribe(
        (response: any) => {
          console.log(response)
          // 成功後加入本地列表並重新載入
          this.labels.push({ labelid: response.labelid, specificname: this.newLabelName,iconname: this.inputValue});
          this.loadLabels(); // 確保與後端同步
          this.showModal=false; // 關閉彈窗
          this.createMessage('success','新增成功')
        },
        (error: any) => {
          console.error('新增失敗', error);
          alert('新增標籤失敗，請稍後再試！');
        }
      );
    }
    editlabel(){

    }


    confirm(labelid:number){
      console.log('ewewewew')
      this.deleteLabel(labelid)
    }

    cancel(){
      console.log()

    }
   // 刪除標籤
  deleteLabel(labelid:number) {

    console.log(labelid)
      this.http.delete(`label/deletelabel/${labelid}/`).subscribe(
        (response: any) => {
          console.log('刪除成功', response.labelid);
          // 從本地列表中移除該標籤
          this.labels = this.labels.filter(label => label.labelid !== labelid);
          this.createMessage('success','標籤刪除成功！');
        },
        (error: any) => {
          console.error('刪除失敗', error);
          this.createMessage('error','標籤刪除失敗，請稍後再試！');
        }
      );
    }
  // 輸入時過濾選項
  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.filteredOptions = this.options.filter(option =>
      option.toLowerCase().includes(value.toLowerCase())
    );
  }

  // 修正 compareFun 以適配字串
  compareFun = (o1: string, o2: string): boolean => {
    return o1 === o2;
  };



  }







