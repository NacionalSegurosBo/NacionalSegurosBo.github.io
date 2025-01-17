let state = {};


const conect = async (usr, pass) => {
    if(!state.url) {
        state.url = await fetch("../config.json").then(response => response.json()).then(data => data.urlreplit);
    }
    if(!state.user) {
        const response = await fetch(state.url+"/login?user="+usr+"&password="+pass, {
            method:"POST"
        });        
        const data = await response.json();
        state.user = data.data;
    }
};

const loguin= async()=>{
    document.getElementById("errorMsg").innerText=""
    let form = document.getElementById("loginForm");
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    let usr = document.getElementById("documentId").value;
    let pass = document.getElementById("password").value;

    await conect(usr, pass)
    if(!state.user){
        document.getElementById("documentId").value = "";
        document.getElementById("password").value = "";
    
        document.getElementById("errorMsg").innerText="Error en las credenciales, intente nuevamente."
        return;
    }
    localStorage.setItem("user", JSON.stringify(state.user));        
    window.location.href = "pages/home/";
};

const registro=()=>{
    window.location.href = "pages/registro/";
};