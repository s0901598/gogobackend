import { Component } from '@angular/core';
import { HttpService } from '../share/service/http.service';

@Component({
  selector: 'app-labelmanage',
  standalone: false,
  templateUrl: './labelmanage.component.html',
  styleUrl: './labelmanage.component.css'
})
export class LabelmanageComponent {
    labels:any[] = []
    newLabelName='';
    showModal = false;
    labelid=0
   
    constructor(private http:HttpService) {
    //    this.http.get('getlabel/').subscribe((x:any)=>{
    //   this.labels = x.labels;
    // })

    this.loadLabels()//載入初始標籤列表
    }

    // 載入標籤列表
    loadLabels() {
    this.http.get('getlabel/').subscribe((x: any) => {
      this.labels = x.labels;
    });
  }
    openModal(){
      this.showModal = true;
    }

    create(){
      if (!this.newLabelName.trim()) {
        alert('請輸入標籤名稱！');
        return;
      }
  
      const newLabel = {labelid:this.labelid ,specificname: this.newLabelName };
      this.http.post('addlabel/', newLabel).subscribe(
        (response: any) => {
          console.log(response)
          // 成功後加入本地列表並重新載入
          this.labels.push({ labelid: response.labelid, specificname: this.newLabelName });
          this.loadLabels(); // 確保與後端同步
          this.showModal=false; // 關閉彈窗
          alert('標籤新增成功！');
        },
        (error: any) => {
          console.error('新增失敗', error);
          alert('新增標籤失敗，請稍後再試！');
        }
      );
    }
    }
