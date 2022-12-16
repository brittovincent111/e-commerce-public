var nameError = document.getElementById('name-error');
var emailError = document.getElementById('email-error');
var emailError1 = document.getElementById('email-error1');
var PhoneError = document.getElementById('number-error');
var messageError = document.getElementById('message-error');
var passwordError = document.getElementById('password-error');
var passwordError1 = document.getElementById('password-error1');
var submitError = document.getElementById('submit-error');
var loginError = document.getElementById('login-error');
 
var cPasswordError = document.getElementById('cpassword-error')

  
function validateName(){
    var name = document.getElementById('contact-name').value;      
    if(name.length == 0){
        nameError.innerHTML = 'Name is Required';
        return false;
    }
    if(!name.match(/^[a-zA-z]+\s{1}[a-zA-z]*$/)){   
        nameError.innerHTML = 'Enter full name';
        return false;
    }
    nameError.innerHTML = '';
    return true;


}


function validatePhone(){

    var Phone = document.getElementById('contact-phone').value;
    console.log(Phone);
    if(Phone.length == 0){
        PhoneError.innerHTML = 'Phone no is Required';
        return false;
    }
    if(Phone.length !==10){
        PhoneError.innerHTML = 'Phone no should be 10 digits';
        return false;
    }
    if(!Phone.match(/^[0-9]{10}$/)){     
       PhoneError.innerHTML = 'Phone no is required';
       return false;
    }

    PhoneError.innerHTML = '';
    return true;
}

function validateEmail(){

    var email = document.getElementById('contact-email').value;
    console.log(email);

    if(email.length == 0){
        emailError.innerHTML = 'Email is required'
        return false;
    }
    if(!email.match(/^[a-z\._\-[0-9]*[@][A-Za-z]*[\.][a-z]{2,6}$/)){
        emailError.innerHTML = 'email invalid'
        return false;
    }
    if(email == "sanjuny07@gmail.com"){
        emailError.innerHTML = 'you cant use this mail id'
        return false;
    }

    emailError.innerHTML='';
    return true; 

}

function validatepassword(){

    var password = document.getElementById('contact-password').value;
    console.log(password);

    if(password.length == 0){
        passwordError.innerHTML = 'Password is required'
        return false;
    }
    if(password.length < 8){
        passwordError.innerHTML = 'Password is less than 7 '
        return false;
    }
    

    passwordError.innerHTML='';
    return true; 

}

function validateConfPassword(){
    var password = document.getElementById('contact-password').value;
    var cpassword = document.getElementById('contact-cpassword').value;
    if(password!=cpassword){
        alert("NOT SAME PASSWORD")
    return false;
    }
    passwordError.innerHTML='';
    return true;
}
function validateSignup(){

    if(!validateName() || !validateEmail() || !validatePhone() || !validateConfPassword() || !validatepassword()){
        submitError.style.display = 'block';
        submitError.innerHTML = 'please fix error to submit';
        setTimeout(function(){submitError.style.display = 'none';}, 3000);
        return false;
    }
    submitError.innerHTML = '';
    return true;
}


function validateEmailLogin(){

    var email1 = document.getElementById('contact-email1').value;
    

    if(email1.length == 0){
        emailError1.innerHTML = 'Email is required'
        return false;
    }
    if(!email1.match(/^[a-z\._\-[0-9]*[@][A-Za-z]*[\.][a-z]{2,6}$/)){
        emailError1.innerHTML = 'email invalid'
        return false;
    }
    if(email1 == "sanjuny07@gmail.com"){
        emailError1.innerHTML = 'you cant use this mail id'
        return false;
    }

    emailError1.innerHTML='';
    return true; 

}
function validatePasswordLogin(){

    var password1 = document.getElementById('contact-password1').value;
    console.log(password);

    if(password1.length == 0){
        passwordError1.innerHTML = 'Password is required'
        return false;
    }
    if(password1.length < 8){
        passwordError1.innerHTML = 'Password is less than 7 '
        return false;
    }
    

    passwordError1.innerHTML='';
    return true; 

}
function validateLogin(){

    if( !validateEmailLogin() ||  !validatePasswordLogin()){
        loginError.style.display = 'block';
        loginError.innerHTML = 'please fix error to submit';
        setTimeout(function(){loginError.style.display = 'none';}, 3000);
        return false;
    }
    loginError.innerHTML = '';
    return true;
}



$("#submit-form").submit((e) => {
    e.preventDefault();
    $.ajax({
      url: "https://script.google.com/macros/s/AKfycbxwz36RQYAGJBLoop56YVqJyWCiI5EO0yP0UKQJ/exec",
      data: $("#submit-form").serialize(),
      method: "post",
      success: function (response) {
        alert("Form submitted successfully");
        window.location.reload();
        //window.location.href="https://google.com"
      },
      error: function (err) {
        alert("Something Error");
      },
    });
  });