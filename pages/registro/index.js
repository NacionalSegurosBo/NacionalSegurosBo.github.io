var state = {};
document.addEventListener('DOMContentLoaded', function() {
    const registrationForm = document.getElementById('registrationForm');
    


    registrationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const documentId = document.getElementById('documentId').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const termsAndConditions = document.getElementById('termsAndConditions').checked;
        
        // Basic form validation
        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }
        
        if (!termsAndConditions) {
            alert('Debes aceptar los términos y condiciones');
            return;
        }
        
        // Here you would typically send the data to your server
        console.log({
            fullName,
            email,
            documentId,
            password,
            termsAndConditions
        });
        
        alert('Registro exitoso!');
        registrationForm.reset();
    });
    
    // Floating label animation
    const inputs = document.querySelectorAll('.form-group input');
    
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
        
        // Check for existing values on page load
        if (input.value) {
            input.parentElement.classList.add('focused');
        }
    });
});

const registro=async()=>{
    let form = document.getElementById("registrationForm");
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    let pass = document.getElementById("password").value;
    let repass = document.getElementById("confirmPassword").value;

    if(pass!=repass){
        alert("Contrasenas inconsistentes!!")
        return;
    }

    state.url = await fetch("../../config.json").then(response => response.json()).then(data => data.urlreplit);

    var send={
        name:document.getElementById("fullName").value,
        email:document.getElementById("email").value,
        phone:document.getElementById("phone").value,
        password:document.getElementById("password").value
    };


    const response = await fetch(state.url+"/registro", {
        method:"POST",
        body:JSON.stringify(send)
    });        
    const data = await response.json();
    
    if(data.status === "success"){
        window.location.href = "pages/home/";
    }else{
        location.reload(true);
    }

};