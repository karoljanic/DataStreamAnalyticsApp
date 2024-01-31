import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor() { }

  downloadJson(data: any, filename: string) {
    const jsonBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    saveAs(jsonBlob, filename);
  }
}