import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ChangeSurnameData {
  surname: string;
}

@Component({
  selector: 'app-change-surname',
  templateUrl: './change-surname.component.html',
  styleUrls: ['./change-surname.component.scss']
})
export class ChangeSurnameComponent {
  constructor(
    public dialogRef: MatDialogRef<ChangeSurnameComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ChangeSurnameData,
  ) { }

  onCancel(): void {
    this.dialogRef.close();
  }
}
