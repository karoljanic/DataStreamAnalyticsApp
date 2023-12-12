import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ChangePictureData {
  picture: File | null
  pictureName: string;
}

@Component({
  selector: 'app-change-picture',
  templateUrl: './change-picture.component.html',
  styleUrls: ['./change-picture.component.scss']
})
export class ChangePictureComponent {
  constructor(
    public dialogRef: MatDialogRef<ChangePictureComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ChangePictureData,
  ) { }

  onCancel(): void {
    this.dialogRef.close();
  }

  handleFileInputChange(files: FileList | null): void {
    if (files && files.length) {
      const file = files[0];
      this.data.pictureName = file.name;
      this.data.picture = file;
    } else {
      this.data.pictureName = '';
      this.data.picture = null;
    }
  }
}
