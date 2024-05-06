import { filter } from "rxjs/operators";
import { Component, Input } from "@angular/core";
import { HttpClient, HttpEventType } from "@angular/common/http";
import { catchError, finalize } from "rxjs/operators";
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
} from "@angular/forms";
import { noop, of } from "rxjs";

@Component({
  selector: "file-upload",
  templateUrl: "file-upload.component.html",
  styleUrls: ["file-upload.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: FileUploadComponent
    }
  ]
})
export class FileUploadComponent implements ControlValueAccessor, Validator{
  @Input()
  requiredFileType: string;

  fileName = "";

  fileUploadError = false;

  fileUploadSuccess = false;

  uploadProgress: number;

  onChange = (fileName: string) => {};
  onTouched = () => {};
  onValidatorChange = () => {}
  disabled: boolean = false;

  constructor(private http: HttpClient){

  }

  onClick(fileUpload: HTMLInputElement){
    this.onTouched();
    fileUpload.click();
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
        } else if(event.type == HttpEventType.Response){
          this.fileUploadSuccess = true;
          this.onChange(this.fileName);
          this.onValidatorChange();
        }
      });
    }

    event.target.value = ''
  }

  //usado para atualizar o valor de um controle de formulário personalizado. Quando esse método é chamado, o novo valor é passado como argumento.
  // O writeValue é responsável por sincronizar o valor interno do controle de formulário personalizado com o valor do controle de formulário Angular correspondente.
  writeValue(value: any){
    this.fileName = value;
  }

  //vc retorna um valor para o pai
  //Além disso, quando queremos reportar um novo valor do formulário de volta ao formulário pai usando o retorno de chamada Onchange,
  registerOnChange(onChange: any) {
    this.onChange = onChange;
  }

  //retorna se o campo já foi sujado ou nao
  registerOnTouched(onTouched: any) {
    this.onTouched = onTouched;
  }

  //pode habilitar e desabilitar o campo
  setDisabledState(disabled: boolean) {
    this.disabled = disabled;
  }

  //valida os campos aplicados
  registerOnValidatorChange(onValidatorChange: () => void) {
    this.onValidatorChange = onValidatorChange;
  }

  //validação do meu file-upload
  validate(control: AbstractControl): ValidationErrors | null {

    if(this.fileUploadSuccess){
      return null;
    }

    let errors: any = {
      requiredFileType: this.requiredFileType
    }

    if(this.fileUploadError){
      errors.uploadFailed = true;
    }

    return errors;
  }

}
