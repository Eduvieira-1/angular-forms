import { Validators, FormBuilder, NonNullableFormBuilder } from '@angular/forms';
import { FormControl, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'login',
  templateUrl: './login-reactive.component.html',
  styleUrls: ['./login-reactive.component.css']
})
export class LoginReactiveComponent implements OnInit {

  form = this.formBuilder.group({
    email: ['', {validators: [Validators.required, Validators.email]} ],
    password: ['', {validators: [Validators.required, Validators.minLength(8)]}]
  })

  constructor(private formBuilder: NonNullableFormBuilder) {


  }

  ngOnInit() {

  }

  get email(){
    return this.form.controls['email'];
  }

  get password(){
    return this.form.controls['password'];
  }

  login(){

  }

  reset(){
      this.form.reset();

      console.log(this.form.value);

  }

}
