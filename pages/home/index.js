const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const chatContainer = document.getElementById('chatContainer');
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
var state={};

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

// Auto-expandir el textarea
messageInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
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

const handleSendMessage=async()=> {
    const message = messageInput.value.trim();
    if (message) {
        saveMeesage(message, "in")
        addMessage(message, true);
        messageInput.value = '';
        messageInput.style.height = 'auto';
        
        let resp = await iaSendMessage(message);
        console.log(resp)
        // Simular respuesta del asistente virtual
        let msg=resp.output;
        saveMeesage(msg, "out")
        addMessage(msg, false);
    }
}

const iaSendMessage=async(message)=>{
    let hook = "";
    while(!state.chat){
        console.log("esperando..");
        await new Promise(r => setTimeout(r, 1000));
    }
    switch(state.tipo){
        case "Vía Jubilación":
            hook = state.hook_via_jubilacion;
            break;
        case "Todo Riesgo de Daños":
            hook = state.hook_trdp;
            break;
        default:
            hook = "9e123ff7-9a58-4d90-9eae-fd3e76cb0c8a";  
    }
        
    return new Promise((resolve, reject) => {
        fetch("https://uplabs-ai.app.n8n.cloud/webhook/"+hook+"?message="+message+"&sessionId="+state.chat.id)  
        .then((response) => response.json())
        .then((data) => {
            resolve(data);
        }).catch((error) => {
            reject(error);
        });
    });
};

sendButton.addEventListener('click', handleSendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
});

const cerrarSession=()=>{
    localStorage.removeItem("token");
    window.location.href="/";
};

const init=async()=>{
    var config = await fetch("../../config.json").then(response => response.json()).then(data => data);
    state.url = config.urlreplit;
    state.hook_via_jubilacion = config.hook_via_jubilacion;
    state.hook_trdp = config.hook_trdp;

    state.user = localStorage.getItem("user");
    if(!state.user) window.location.href="/";
    state.user = JSON.parse(state.user)
    
    verHistorial("Vía Jubilación", document.getElementById("btnViaJubilacion"));

};

const verHistorial=(tipo, button)=>{
    state.button=button;
    state.tipo = tipo;

    document.getElementById("asistName").innerText=tipo;

    let cuerpo ='<a href="#" class="nav-item" style="font-size: 16px;" onclick="closeHistory();"><span>⏪</span>'+tipo+'</a>';
    cuerpo+=`<a href="#" class="nav-item" style="font-size: 16px;" onclick="nuevoChat('${tipo}');"><span>❇️</span>Nuevo chat</a>`;
    cuerpo+="<div style='margin-top:30px;' id='listaHistorial'>";
    cuerpo+="</div>";

    document.getElementById("menu-historico").innerHTML=cuerpo;
    document.getElementById("sidebarHistory").style.display="";

    llenarHistorial(tipo);
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
    let cuerpo=`<a href="#" onclick='chatear(${JSON.stringify(chat)})' class="nav-item" style="font-size: 13px;"><i>📅</i>${chat.fecha_on.substring(0,19).replace('T', ' ')}</a>`;
    let listaHistorial = document.getElementById("listaHistorial");
    listaHistorial.innerHTML = cuerpo + listaHistorial.innerHTML;
    

};

const llenarHistorial= async(tipo)=>{
    
    document.getElementById("listaHistorial").innerHTML = "<div style='display:flex; justify-content:center;'><img alt='' src='../../images/load.gif' style='width:20px' /></div>";

    let historial = await new Promise((resolve, reject) => {
        fetch(state.url+"/chats/id_user/"+state.user.id,{
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

    let cuerpo ="";
    historial?.sort( (a,b)=> a<b?0:1 ).map(obj=>{
        if(obj.type===tipo)
            cuerpo+=`<a href="#" onclick='chatear(${JSON.stringify(obj)})' class="nav-item" style="font-size: 13px;"><i>📅</i>${obj.fecha_on.substring(0,19).replace('T',' ')}</a>`;
    });


    document.getElementById("listaHistorial").innerHTML = cuerpo;



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

    document.getElementById("sidebarHistory").style.display="none"
    document.getElementById("messageInput").focus()
};

const closeHistory=()=>{
    document.getElementById("sidebarHistory").style.display="none";
};

init();