import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface DeleteAccountData {
  decision: boolean;
}

@Component({
  selector: 'app-delete-account',
  templateUrl: './delete-account.component.html',
  styleUrls: ['./delete-account.component.scss']
})
export class DeleteAccountComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteAccountComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DeleteAccountData,
  ) { }

  onYesClick(): void {
    this.data.decision = true;
    this.dialogRef.close({ decision: true });
  }

  onNoClick(): void {
    this.data.decision = false;
    this.dialogRef.close({ decision: false });
  }
}
