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


    if(document.getElementById("loguin_").children.length>0){
        return;
    }

    let text = document.getElementById("loguin_").innerText;
    document.getElementById("loguin_").innerHTML = `<img alt="" src="../../images/load.gif" style="width: 25px;"/>`;


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
        document.getElementById("loguin_").innerText = text; 

        return;
    }
    localStorage.setItem("user", JSON.stringify(state.user));       
    window.location.href = "pages/home/";
};

const registro=()=>{
    window.location.href = "pages/registro/";
};