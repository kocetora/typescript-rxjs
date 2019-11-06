import './style.css';
import {fromEvent, pipe} from 'rxjs';
import {map, switchMap, distinctUntilChanged, filter} from 'rxjs/operators'

const Email = document.getElementById('Email');
const password = document.getElementById('password');
const repeatedPassword = document.getElementById('repeatedPassword');

const EmailError = document.getElementById('EmailError');
const passwordError = document.getElementById('passwordError');
const repeatedPasswordError = document.getElementById('repeatedPasswordError');
const button = document.getElementById('button');

function validateEmailRegex(email:string):boolean {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

const handler$ = fromEvent(Email, 'blur').pipe(
  map((event:Object) => event.target.value),
  distinctUntilChanged(),
  filter((value:string)=>{
        if (!value){
          EmailError.innerHTML = `<p>Email is empty</p>`;
          return false;
        } else if (!validateEmailRegex(value)) {
           EmailError.innerHTML =`<p>Email is not valid</p>`;
           return false;
        } else {
          EmailError.innerHTML =`<p>Email is great!</p>`;
          return true;
        }
      }),
  switchMap((email)=>{
    return fromEvent(password, 'blur').pipe(
      distinctUntilChanged(),
      map((event:Object)=>([email, event.target.value])),
      filter(([email, value]:string[])=>{
        if (!value){
          passwordError.innerHTML = `<p>Password is empty</p>`;
          return false;
        } else if (value.length<=4) {
          passwordError.innerHTML = `<p>Password lenth should be longer then 4 symbols</p>`;
          return false;
        } else {
          passwordError.innerHTML = `<p>Password is great!</p>`;
          return true;
        }
      }),
      switchMap(([email, value]:string[])=>{
        return fromEvent(repeatedPassword, 'blur').pipe(
          distinctUntilChanged(),
          map((event:Object)=>([email, value, event.target.value])),
          filter(([email, value, repeatedValue]:string[])=>{
            if(repeatedValue === value){ 
              repeatedPasswordError.innerHTML = `<p>Passwords match!</p>`;
              return true;
            } else {
              repeatedPasswordError.innerHTML = `<p>Password don't match</p>`;
              return false;
            }
          }),
          switchMap(([email, value, repeatedValue]:string[])=>{
            button.disabled = false;
            return fromEvent(button, 'click').pipe(
              map(()=>{
                alert(`Your email: ${email}\nYour password: ${value}`);
                return([email, value]);
              })
              )
            }
          )
        )
      })
    )})
  ).subscribe(
     vl => {
      Email.value='';
      password.value='';
      repeatedPassword.value='';
      console.log(vl);
      },
     err => console.log('Error: ', err),
     () => console.log('Completed')
    );
