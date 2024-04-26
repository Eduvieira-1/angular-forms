import { filter } from "rxjs/operators";
import { Component, Input } from "@angular/core";
import { HttpClient, HttpEventType } from "@angular/common/http";
import { catchError, finalize } from "rxjs/operators";
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  Validator,
} from "@angular/forms";
import { noop, of } from "rxjs";

@Component({
  selector: "file-upload",
  templateUrl: "file-upload.component.html",
  styleUrls: ["file-upload.component.scss"],
})
export class FileUploadComponent {
  @Input()
  requiredFileType: string;

  fileName = "";

  fileUploadError = false;

  uploadProgress: number;

  constructor(private http: HttpClient){

  }

  onFileSelected(event) {
    const file: File = event.target.files[0];

    if (file) {
      this.fileName = file.name;
      console.log(this.fileName);

      const formData = new FormData();

      this.fileUploadError = false

      formData.append("thumbnail", file);

      this.http.post("/api/thumbnail-upload", formData, {
        reportProgress: true,
        observe: 'events'
      })
      .pipe(
        catchError(error => {
          this.fileUploadError = true;
          return of(error);
        }),
        //este operador nos permite executar uma açao quando o observable for concluido ou houver erros
        finalize(() => {
          this.uploadProgress = null;
        })
      )
      .subscribe(event => {
        if(event.type == HttpEventType.UploadProgress){
          this.uploadProgress = Math.round(100 * (event.loaded / event.total))
        }
      });
    }

    event.target.value = ''
  }
}
