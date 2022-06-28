import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-comments.dialog',
  templateUrl: './comments.dialog.component.html',
  styleUrls: ['./comments.dialog.component.css']
})
export class CommentsDialogComponent implements OnInit {

    storage = {
        printedComment: null,
        nonPrintedComment: null
    }

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              public dialogRef: MatDialogRef<CommentsDialogComponent>) {

        if(data.printedComment){
            this.storage.printedComment = data.printedComment;
        }
      if(data.nonPrintedComment){
          this.storage.nonPrintedComment = data.nonPrintedComment;
      }
  }

      ngOnInit(): void {
      }

    cancel() : void {
        this.dialogRef.close();
    }

    save() : void {
        this.dialogRef.close(this.storage);
    }

}
