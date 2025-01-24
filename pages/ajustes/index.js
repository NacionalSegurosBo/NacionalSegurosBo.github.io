const chatContainer = document.getElementById('chatContainer');
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
var state={};
var escribiendo = `<div class="typing-indicator" id="typingIndicator"><img src="../../images/typing.gif" alt="Escribiendo..." /></div>`;
// Manejar el menú responsive
menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});

// Cerrar el menú al hacer clic fuera de él
document.addEventListener('click', (e) => {
    if (sidebar.classList.contains('active') && 
        !sidebar.contains(e.target) && 
        !menuToggle.contains(e.target)) {
        sidebar.classList.remove('active');
    }
});



function addMessage(message, isUser = true) {
    const messageElement = document.createElement('pre');
    messageElement.className = `message ${isUser ? 'user' : 'assistant'}`;
    messageElement.textContent = message;
    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;

}

const saveMeesage=async(message, type)=>{
    
    if(!state?.chat?.id){
        await nuevoChat(state.tipo);
    }
    

    fetch(state.url+"/messages",{
        method: "POST", // Cambia el método a POST
        headers: {
            "Content-Type": "application/json", // Indica que el contenido es JSON
            "Authorization": `Bearer ${state.user.access_token}` // Incluye el token de autorización
        },
        body: JSON.stringify({ // Incluye datos en el cuerpo de la solicitud
            // Agrega aquí los datos que deseas enviar
            id_chat:state.chat.id,
            message:message,
            type:type
        })
    })  
    .then((response) => response.json())
    .then((data) => {
        console.log(data);
    }).catch((error) => {
        console.log(error);
    });
};


const cerrarSession=async()=>{
    if(!state.url) {
        state.url = await fetch("../config.json").then(response => response.json()).then(data => data.urlreplit);
      }
      if(state.user) {
          const response = await fetch(state.url+"/logout?token="+state.user.access_token, {
              method:"POST"
          });        
          const data = await response.json();
          state.user = null;
      }
    
      localStorage.removeItem("user")
      window.location.href = "/"
};

const init=async()=>{
    var config = await fetch("../../config.json").then(response => response.json()).then(data => data);
    state.url = config.urlreplit;
    state.hook_via_jubilacion = config.hook_via_jubilacion;
    state.hook_trdp = config.hook_trdp;

    state.user = localStorage.getItem("user");
    if(!state.user) window.location.href="/";
    state.user = JSON.parse(state.user)
    
    menu("Perfil", document.getElementById("btnViaJubilacion"));

};

const goToHome=()=>{
    window.location.href="../home/";
};

const menu=(tipo, button)=>{
    state.button=button;
    state.tipo = tipo;

    document.getElementById("asistName").innerText=tipo;

    let cuerpo ='<a href="#" class="nav-item" style="font-size: 16px;" onclick="closeHistory();"><span>⏪</span>'+tipo+'</a>';
    cuerpo+=`<a href="#" class="nav-item" style="font-size: 16px;" onclick="nuevoChat('${tipo}');"><span>❇️</span>Nuevo chat</a>`;
    cuerpo+="<div style='margin-top:30px;' id='listaHistorial'>";
    cuerpo+="</div>";

    document.getElementById("menu-historico").innerHTML=cuerpo;


  if(state.user.type == "admin"){
    document.getElementById("dashboard_").style.display = "";
  }

    pintarMenu(tipo);
};

const nuevoChat=async(tipo)=>{
    let chat = await new Promise((resolve, reject) => {
        fetch(state.url+"/chats",{
            method: "POST", // Cambia el método a POST
            headers: {
                "Content-Type": "application/json", // Indica que el contenido es JSON
                "Authorization": `Bearer ${state.user.access_token}` // Incluye el token de autorización
            },
            body: JSON.stringify({ // Incluye datos en el cuerpo de la solicitud
                // Agrega aquí los datos que deseas enviar
                id_user:state.user.id,
                name:"test",
                type:tipo
            })
        })  
        .then((response) => response.json())
        .then((data) => {
            resolve(data.data);
        }).catch((error) => {
            reject(error);
        });
    });
    state.chat = chat;
    let cuerpo=`<a href="#" onclick='chatear(${JSON.stringify(chat)})' class="nav-item" style="font-size: 13px;"><i>📅</i>${parseFecha(chat.fecha_on)}</a>`;
    let listaHistorial = document.getElementById("listaHistorial");
    listaHistorial.innerHTML = cuerpo + listaHistorial.innerHTML;
    

};

const pintarMenu= async(tipo)=>{
    
    switch(tipo){
        case "Perfil":
            paintPerfil();
            break;
        case "Dashboard":
            paintDashboard();
            break;
    }
};
const irachat=()=>{
    window.location.href="../home/";
};
const paintPerfil=(edit)=>{
    let cuerpo = `
    <div class="profile-container">
      <div class="profile-box">
        <h1>Perfil</h1>

        <div class="form-group">
          <label for="name">Nombre</label>
          <input type="text" id="name" name="name" value="${state.user.name}" ${edit ? "" : "disabled"}>
        </div>

        <div class="form-group">
          <label for="email">Correo</label>
          <input type="text" id="email" name="email" value="${state.user.email}" ${edit ? "" : "disabled"}>
        </div>

        <div class="form-group">
          <label for="phone">Teléfono</label>
          <input type="text" id="phone" name="phone" value="${state.user.phone}" ${edit ? "" : "disabled"}>
        </div>

        <div class="form-group">
          <label for="phone">Contraseña</label>
          <input type="password" id="pass" name="pass" value="${state.user.password}" ${edit ? "" : "disabled"}>
        </div>
        
        
        
        <div class="button-container">
        ${
            edit ? 
            `<button class="admin-button" onclick='guardarPerfil();'>Guardar</button>` : 
            `<button class="admin-button" onclick='paintPerfil(true);'>Editar</button>`
        }
        </div>
      </div>
    </div>
  `;
    document.getElementById("chatContainer").innerHTML=cuerpo;
};

const guardarPerfil=()=>{

    let name = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    let phone = document.getElementById("phone").value;
    let password = document.getElementById("pass").value;

    fetch(state.url+"/users/"+state.user.id,{
        method: "PUT", // Cambia el método a POST
        headers: {
            "Content-Type": "application/json", // Indica que el contenido es JSON
            "Authorization": `Bearer ${state.user.access_token}` // Incluye el token de autorización
        },
        body: JSON.stringify({ // Incluye datos en el cuerpo de la solicitud
            // Agrega aquí los datos que deseas enviar
            name:name,
            email:email,
            phone:phone,
            password:password,
        })
    })  
    .then((response) => response.json())
    .then((data) => {
        console.log(data);
        state.user = data.data;
        localStorage.setItem("user", JSON.stringify(state.user));
        paintPerfil();
    }).catch((error) => {
        console.log(error);
    });
};

const paintDashboard=async()=>{
    state.dashboard = await new Promise((resolve, reject) => {
        fetch(state.url+"/users",{
            headers: {
                "Content-Type": "application/json", // Si necesitas especificar el tipo de contenido
                "Authorization": `Bearer ${state.user.access_token}` // Agregar el token de autorización
            }
        })  
        .then((response) => response.json())
        .then((data) => {
            resolve(data.data);
        }).catch((error) => {
            reject(error);
        });
    });

    let cuerpo = `
        <div class="container">
            <h2>Usuarios</h2>
            <div class="table-container">
                <table class="responsive-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Telefono</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>`;
    state.dashboard.map(usr=>{
        cuerpo+=`
            <tr>
                <td data-label="Nombre">${usr.name}</td>
                <td data-label="Telefono">${usr.phone}</td>
                <td data-label="Email">${usr.email}</td>
                <td data-label="Admin">${usr.type}</td>
                <td>
                <div class="toggle-switch">
                    <input type="checkbox" id="ios-toggle_${usr.id}" data-user='${JSON.stringify(usr)}' class="toggle-checkbox" ${usr.state == 1 ? "checked" : ""}>
                    <label for="ios-toggle_${usr.id}" class="toggle-label"></label>
                </div>
                </td>
            </tr>
        `;
    });
                        
                       
    cuerpo+=`</tbody>
                </table>
            </div>
        </div>
    `;
    document.getElementById("chatContainer").innerHTML= cuerpo;

    setTimeout(() => { 
        initToggle();
    }, 2000);
    
};

const initToggle=()=>{

    var elementos = document.getElementsByClassName('toggle-checkbox');

    for (let i = 0; i < elementos.length; i++) {
        elementos[i].addEventListener('click', function() {
            let us = JSON.parse(document.getElementById(elementos[i].id).dataset.user);
            console.log(us);

            this.checked ? us.state = 1 : us.state = 0;


            fetch(state.url+"/users/"+us.id,{
                method: "PUT", // Cambia el método a POST
                headers: {
                    "Content-Type": "application/json", // Indica que el contenido es JSON
                    "Authorization": `Bearer ${state.user.access_token}` // Incluye el token de autorización
                },
                body: JSON.stringify(us)
            })  
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
            }).catch((error) => {
                console.log(error);
            });
        });
    }

};

const getChats=(id_chat)=>{
    return new Promise((resolve, reject) => {
        fetch(state.url+"/messages/id_chat/"+id_chat,{
            headers: {
                "Content-Type": "application/json", // Si necesitas especificar el tipo de contenido
                "Authorization": `Bearer ${state.user.access_token}` // Agregar el token de autorización
            }
        })  
        .then((response) => response.json())
        .then((data) => {
            resolve(data.data);
        }).catch((error) => {
            reject(error);
        });
    });

};

const chatear=async(obj)=>{
    state.chat = obj;
    let messages = await getChats(obj.id);

    document.getElementById("chatContainer").innerHTML="";

    messages?.sort((a, b) => {
        const dateA = new Date(a.fecha_on);
        const dateB = new Date(b.fecha_on);
        return dateA - dateB; // Orden ascendente (más antiguo a más reciente)
    });
    
    messages?.map(obj=>{
        addMessage(obj.message, obj.type=="in") 
    });

};

const closeHistory=()=>{
};

const parseFecha=(fechaISO)=>{
    const fecha = new Date(fechaISO);
    const opciones = {
        timeZone: "America/La_Paz",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    };
    
    // Formatear la fecha a un formato legible
    return new Intl.DateTimeFormat("es-BO", opciones).format(fecha);
    
};

init();